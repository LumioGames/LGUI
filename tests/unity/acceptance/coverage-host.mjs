// Explicit repository-only screenshot evidence. Build the Native screenshot
// bundle with createInventoryContext({coverageCapture:true}) and the existing
// prepareValidationPlayer. Ordinary context creation never waits for Inspector.
//
// Node: coverage-host.mjs player --player <absolute.exe> --evidence <fresh-dir> --port <explicit>
// H5:  coverage-host.mjs h5 --context <saved-context.json> --evidence <fresh-dir>
// Both routes keep the real gated HTTP fixture; neither changes proxies, Player
// settings, production backends, or substitutes rendered image pixels.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';
import {connectInspector} from './inspector.mjs';
import {startGatedImageFixture} from './business-data.mjs';
import {runPlayer} from '../player-runner.mjs';
import {runH5} from '../../conformance/runner.mjs';
import {launchBrowser} from '../../helpers/browser.mjs';
import {sharp} from '../../../plugin/tools/lib/vendor.mjs';

const points = ['placeholder-pending', 'external-image-loaded'];
const failure = (message, cause) => new Error('LGUI-RT-001 Coverage screenshot host: ' + message, {cause});
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const execute = promisify(execFile);

async function ownedInspectorListener(pid, port) {
  const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const command = `Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction Stop | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Compress`;
  const {stdout} = await execute(executable, ['-NoProfile', '-NonInteractive', '-Command', command],
    {windowsHide: true, timeout: 10000, maxBuffer: 65536});
  const parsed = JSON.parse(stdout);
  const listeners = Array.isArray(parsed) ? parsed : [parsed];
  if (!listeners.length || listeners.some(listener => listener.OwningProcess !== pid))
    throw failure('Inspector listener does not belong exclusively to the started Player PID.');
  return listeners;
}

function freshEvidence(directory) {
  if (!directory || !path.isAbsolute(directory)) throw failure('Evidence must be an absolute fresh directory.');
  if (fs.existsSync(directory) && (!fs.statSync(directory).isDirectory() || fs.readdirSync(directory).length))
    throw failure('Evidence directory must be absent or empty: ' + directory);
  fs.mkdirSync(directory, {recursive: true});
  return path.resolve(directory);
}

function imagePath(directory, name) {
  if (!points.includes(name)) throw failure('Unknown screenshot checkpoint: ' + name);
  const file = path.join(directory, name + '.png');
  if (fs.existsSync(file)) throw failure('Screenshot must use a fresh PNG path: ' + file);
  return file;
}

export async function pngEvidence(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      bytes.toString('ascii', 12, 16) !== 'IHDR') throw failure('Screenshot was not a PNG: ' + file);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (!width || !height) throw failure('Screenshot PNG is empty: ' + file);
  let statistics;
  try { statistics = await sharp()(bytes).stats(); }
  catch (error) { throw failure('Screenshot PNG could not be decoded: ' + file, error); }
  const rgb = {channels: statistics.channels.slice(0, 3)};
  if (rgb.channels.length !== 3) throw failure('Screenshot does not contain three RGB channels: ' + file);
  // Inspect only original RGB values. Alpha variation cannot make a black or
  // solid-color frame valid, and no pixels are rewritten or converted.
  if (rgb.channels.every(channel => channel.min === channel.max))
    throw failure('Screenshot has uniform RGB pixels (black/solid color), without visible UI: ' + file + '; ' + JSON.stringify(rgb));
  return {path: file, width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), rgb};
}

function validatePoint(name, sequence, images) {
  if (name !== points[images.length] || sequence !== images.length + 1)
    throw failure('Screenshot checkpoint was missing, repeated or out of order: ' + JSON.stringify({name, sequence, expected: points[images.length]}));
}

async function evaluate(client, expression, awaitPromise = false) {
  const response = await client.send('Runtime.evaluate', {expression, awaitPromise, returnByValue: true});
  if (response.exceptionDetails) throw failure('Original-VM evaluation threw: ' + JSON.stringify(response.exceptionDetails));
  return response.result.value;
}

/** @typedef {{ok:boolean,path:string,error?:string,width:number,height:number}} NativeScreenshotReport */
async function captureNative(client, directory, name) {
  const file = imagePath(directory, name);
  const encoded = await evaluate(client,
    'new Promise(resolve => CS.LGUI.Tests.PlayerAcceptance.Screenshot(' + JSON.stringify(file) + ', resolve))', true);
  if (typeof encoded !== 'string') throw failure('The Native screenshot callback returned no JSON report.');
  /** @type {NativeScreenshotReport} */
  const report = JSON.parse(encoded);
  if (report.ok !== true || typeof report.path !== 'string' || path.resolve(report.path) !== file ||
      !Number.isInteger(report.width) || report.width <= 0 || !Number.isInteger(report.height) || report.height <= 0)
    throw failure('Actual GPU screenshot failed: ' + JSON.stringify(report));
  save(path.join(directory, name + '.native.json'), report);
  const png = await pngEvidence(file);
  if (png.width !== report.width || png.height !== report.height) throw failure('Native report dimensions do not match actual PNG dimensions.');
  return {name, source: 'PlayerAcceptance.Screenshot / ScreenCapture.CaptureScreenshotAsTexture', ...png};
}

/** @param {{player:string,evidence:string,port:number}} options */
export async function runCoveragePlayer({player, evidence, port, fixtureHost = '127.0.0.1'}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw failure('Choose an explicit verification Inspector port.');
  if (!player || !path.isAbsolute(player)) throw failure('Player must be an absolute executable path.');
  const directory = freshEvidence(evidence);
  const fixture = await startGatedImageFixture({outDir: path.join(directory, 'http'), host: fixtureHost});
  const images = [];
  try {
    const output = await runPlayer({player, scenario: 'coverage', result: path.join(directory, 'result.json'),
      log: path.join(directory, 'Player.log'), inspectorPort: port, fixtureBase: fixture.baseURL, graphical: true,
      onStarted: async ({pid, signal}) => {
        const client = await connectInspector({port, signal});
        try {
          save(path.join(directory, 'inspector-listener.json'), {pid, port, listeners: await ownedInspectorListener(pid, port)});
          while (!signal.aborted && images.length < points.length) {
            const encoded = await evaluate(client, 'JSON.stringify({enabled:globalThis.__lguiCoverageCaptureEnabled??null,point:globalThis.__lguiCoveragePoint??null})');
            const state = JSON.parse(encoded);
            if (state.enabled === false) throw failure('This Player was not prepared with createInventoryContext({coverageCapture:true}).');
            if (!state.point) { await delay(25, undefined, {signal}); continue; }
            validatePoint(state.point.name, state.point.sequence, images);
            const image = await captureNative(client, directory, state.point.name);
            images.push(image);
            save(path.join(directory, 'screenshots.json'), images);
            const resumed = await evaluate(client, 'globalThis.__lguiResumeCoverage(' + JSON.stringify(state.point.name) + ')');
            if (resumed !== true) throw failure('The pending original-VM screenshot checkpoint did not acknowledge resume.');
          }
        } finally { client.close(); }
      }});
    if (images.length !== points.length) throw failure('Player ended without both exact image screenshots.');
    save(path.join(directory, 'capture.json'), {acquisitionCompleted: true, pixelVerdict: null,
      interpretation: 'Real GPU images were captured at the two shared-case checkpoints. Inspect their pixels separately; URL success is not a visual pass.',
      fixtureBase: fixture.baseURL, port, images, result: output.result});
    return {output, images, requests: [...fixture.requests]};
  } catch (error) {
    save(path.join(directory, 'capture-failure.json'), {error: String(error), images});
    throw error?.message?.startsWith('LGUI-RT-001') ? error : failure(String(error), error);
  } finally {
    try { save(path.join(directory, 'http-requests.json'), fixture.requests); }
    finally { await fixture.close(); }
  }
}

/** Real H5 companion, exposing the optional window callback before page load. */
export async function runCoverageH5({context, evidence}) {
  if (!context?.root || !path.isAbsolute(context.root)) throw failure('H5 requires the prepared inventory context.');
  const directory = freshEvidence(evidence);
  const fixture = await startGatedImageFixture({outDir: path.join(directory, 'http')});
  const images = [];
  let browser;
  try {
    browser = await launchBrowser();
    if (!browser) throw failure('Chrome or Edge is required for actual H5 screenshots.');
    const instrumented = {async newPage(options) {
      const page = await browser.newPage(options);
      const navigate = page.goto.bind(page);
      let initialized = false;
      page.goto = async (...args) => {
        // runH5 starts its page/server cleanup scope before calling goto. Keep
        // optional host setup inside that scope rather than failing in newPage.
        if (!initialized) {
          await page.addInitScript(base => { globalThis.__lguiFixtureBase = base; }, fixture.baseURL);
          await page.exposeFunction('__lguiCoverageCapture', async name => {
            validatePoint(name, images.length + 1, images);
            const file = imagePath(directory, name);
            const bytes = await page.screenshot({type: 'png'});
            fs.writeFileSync(file, bytes, {flag: 'wx'});
            images.push({name, source: 'Playwright page.screenshot at shared-case checkpoint', ...await pngEvidence(file)});
            save(path.join(directory, 'screenshots.json'), images);
          });
          initialized = true;
        }
        return navigate(...args);
      };
      return page;
    }};
    const output = await runH5(context, 'coverage', instrumented);
    if (images.length !== points.length) throw failure('H5 ended without both exact image screenshots.');
    save(path.join(directory, 'capture.json'), {acquisitionCompleted: true, pixelVerdict: null,
      interpretation: 'Actual browser screenshots; inspect placeholder and final image pixels separately.', images, result: output});
    return {output, images, requests: [...fixture.requests]};
  } catch (error) {
    save(path.join(directory, 'capture-failure.json'), {error: String(error), images});
    throw error?.message?.startsWith('LGUI-RT-001') ? error : failure(String(error), error);
  } finally {
    try { if (browser) await browser.close(); }
    finally {
      try { save(path.join(directory, 'http-requests.json'), fixture.requests); }
      finally { await fixture.close(); }
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, ...args] = process.argv.slice(2), options = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!args[index].startsWith('--') || !args[index + 1]) throw failure('Use player/h5 and explicit named arguments.');
    options[args[index].slice(2)] = args[index + 1];
  }
  let context;
  if (mode === 'h5') {
    if (!options.context || !path.isAbsolute(options.context)) throw failure('H5 context must be an absolute saved-context JSON path.');
    try { context = JSON.parse(fs.readFileSync(options.context, 'utf8')); }
    catch (error) { throw failure('Could not read the saved H5 context JSON.', error); }
  }
  const output = mode === 'player' ? await runCoveragePlayer({player: options.player, evidence: options.evidence, port: Number(options.port), fixtureHost: options['fixture-host']})
    : mode === 'h5' ? await runCoverageH5({context, evidence: options.evidence})
    : (() => { throw failure('Expected player or h5.'); })();
  console.log(JSON.stringify({images: output.images, requests: output.requests}, null, 2));
}
