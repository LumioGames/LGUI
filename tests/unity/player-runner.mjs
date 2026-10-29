// Repository-only Release Player validation. Each run uses fresh evidence and its
// actual process exit; Editor snapshots and a successful build are insufficient.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {cases, conformanceProject, runHeadless, runH5} from '../conformance/runner.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {prepareUnityProject, prepareConformanceCase} from './runner.mjs';
import {unityExport} from '../../plugin/tools/lib/commands/unity-export.mjs';
import {createInventoryContext} from './acceptance/context.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const failure = message => new Error('LGUI-RT-001 Player runner: ' + message);
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const codePath = file => JSON.stringify(file.split(path.sep).join('/'));
function absolute(value, name) {
  if (!value || !path.isAbsolute(value)) throw failure(name + ' must be an absolute path.');
}

/** Validate after process termination, including errors written during disposal. */
export function readPlayerEvidence({result, log, exitCode}) {
  if (exitCode !== 0) throw failure('Player exited ' + exitCode + '; inspect ' + log + '.');
  try {
    for (const suffix of ['.errors.json', '.failure.json']) {
      if (fs.existsSync(result + suffix)) throw failure('Player recorded native errors: ' + fs.readFileSync(result + suffix, 'utf8'));
    }
    const content = fs.readFileSync(log, 'utf8');
    const errors = content.split(/\r?\n/).filter(line => /^LGUI-RT-|\b\w*Exception:|^Fatal error:|Crash!!!/.test(line));
    if (errors.length) throw failure('Player.log contains runtime errors: ' + errors.join('\n'));
    const output = JSON.parse(fs.readFileSync(result, 'utf8'));
    if (output.ok !== true) throw failure(output.error ?? output.message ?? 'Player returned no successful completion.');
    return output;
  } catch (error) {
    if (error.message.startsWith('LGUI-RT-001')) throw error;
    throw failure(error.message + '; inspect ' + log + '.');
  }
}

/** Launch a real Windows Player in batch mode unless graphical:true explicitly requests its visible window. */
export async function runPlayer({player, scenario, result, log, width = 1280, height = 720, timeoutMs = 180000, inspectorPort, fixtureBase, graphical = false, onStarted}) {
  for (const [name, value] of Object.entries({player, result, log})) absolute(value, name);
  if (typeof graphical !== 'boolean') throw failure('graphical must be a boolean.');
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(scenario)) throw failure('Unknown or unsafe scenario token.');
  if (![width, height, timeoutMs].every(value => Number.isInteger(value) && value > 0)) throw failure('Screen dimensions and timeout must be positive integers.');
  if (inspectorPort !== undefined && (!Number.isInteger(inspectorPort) || inspectorPort < 1 || inspectorPort > 65535)) throw failure('Inspector requires an explicit port from 1 to 65535.');
  for (const file of [result, result + '.errors.json', result + '.failure.json', log]) if (fs.existsSync(file)) throw failure('Evidence already exists: ' + file);
  fs.mkdirSync(path.dirname(result), {recursive: true});
  fs.mkdirSync(path.dirname(log), {recursive: true});
  const args = [...(graphical ? [] : ['-batchmode']), '-screen-width', String(width), '-screen-height', String(height), '-screen-fullscreen', '0',
    '-logFile', log, '-lguiResult', result, '-lguiCase', scenario];
  if (inspectorPort !== undefined) args.push('-lguiInspectorPort', String(inspectorPort));
  if (fixtureBase !== undefined) {
    const origin = new URL(fixtureBase);
    if (origin.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw failure('The HTTP fixture must be an explicit loopback origin.');
    args.push('-lguiFixtureBase', origin.origin);
  }
  const controller = new AbortController();
  let child, started = Promise.resolve(), terminalFailure;
  const exitCode = await new Promise((resolve, reject) => {
    child = spawn(player, args, {windowsHide: !graphical, stdio: 'ignore'});
    const deadline = setTimeout(() => {
      terminalFailure ??= {error: failure('Player timed out after ' + timeoutMs + 'ms; inspect ' + log + '.')};
      child.kill();
    }, timeoutMs);
    child.on('spawn', () => {
      if (!onStarted) return;
      started = Promise.resolve().then(() => onStarted({pid: child.pid, args, graphical, signal: controller.signal}));
      started.catch(error => { terminalFailure ??= {error}; child.kill(); });
    });
    child.on('error', error => { clearTimeout(deadline); controller.abort(); reject(failure(error.message)); });
    child.on('close', code => { clearTimeout(deadline); controller.abort(); resolve(code); });
  });
  await started.catch(() => {});
  if (terminalFailure) throw terminalFailure.error;
  const output = readPlayerEvidence({result, log, exitCode});
  json(result + '.process.json', {player, scenario, args, graphical, exitCode, completedUtc: new Date().toISOString()});
  return output;
}

/** Bundle all shared cases once; a fresh Player process selects one by argument. */
export async function prepareValidationPlayer({context, caseNames, project, unityPackage, puertsCore, puertsV8, evidence}) {
  for (const [name, value] of Object.entries({project, unityPackage, puertsCore, puertsV8, evidence})) absolute(value, name);
  if (fs.existsSync(project)) throw failure('A fresh conformance Player project is required: ' + project);
  if (!context?.root || !Array.isArray(caseNames) || !caseNames.length || caseNames.some(name => !/^[a-z][a-z0-9-]*$/.test(name))) throw failure('An explicit workspace and safe case list are required.');
  prepareUnityProject(project, {unityPackage, puertsCore, puertsV8});
  // This is the actual export path and exact local PuerTS patch, not a hand-made scene.
  const exported = await unityExport({args: [], flags: {to: project}, cwd: context.root, projectRoot: context.root, project: context.project});
  fs.copyFileSync(path.join(here, 'acceptance/LGUIPlayerAcceptance.cs'), path.join(project, 'Assets/LGUIPlayerAcceptance.cs'));
  const linker = path.join(project, 'Assets/LGUI/link.xml');
  fs.writeFileSync(linker, fs.readFileSync(linker, 'utf8').replace('</linker>', '  <assembly fullname="Assembly-CSharp" preserve="all" />\n</linker>'));
  const dispatch = path.join(context.root, 'conformance/cases/player-suite.ts');
  fs.writeFileSync(dispatch, `${caseNames.map((name, index) => `import c${index} from './${name}';`).join('\n')}
import type {Case} from '../harness';
declare const CS: {LGUI:{Tests:{PlayerAcceptance:{readonly Scenario:string;readonly FixtureBaseURL:string}}}};
const all:Record<string,Case>={${caseNames.map((name, index) => `${JSON.stringify(name)}:c${index}`).join(',')}};
const name=CS.LGUI.Tests.PlayerAcceptance.Scenario;
const selected=all[name];
if(!selected)throw new Error('LGUI-RT-001 Unknown Release Player conformance case.');
if(name==='coverage')(globalThis as unknown as {__lguiFixtureBase:string}).__lguiFixtureBase=CS.LGUI.Tests.PlayerAcceptance.FixtureBaseURL;
export default selected;
`);
  const prepared = await prepareConformanceCase(context, 'player-suite', project);
  fs.mkdirSync(evidence, {recursive: true});
  json(path.join(evidence, 'context.json'), context);
  json(path.join(evidence, 'prepared.json'), {project, exported, caseNames, bundle: prepared.bundle,
    ordinaryPreviewModified: false, testOnly: ['ConformanceBridge', 'PlayerAcceptance', 'Assembly-CSharp preservation', 'shared case dispatcher']});
  return {context, project, ...prepared, caseNames};
}

export async function prepareConformancePlayer(options) {
  return prepareValidationPlayer({...options, context: await conformanceProject(), caseNames: cases});
}

export async function runConformancePlayerSuite({context, player, evidence}) {
  absolute(evidence, 'evidence');
  const browser = await launchBrowser();
  if (!browser) throw failure('Chrome or Edge is required for the three-backend comparison.');
  const comparisons = [];
  try {
    for (const name of cases) {
      const directory = path.join(evidence, name);
      const actual = await runPlayer({player, scenario: name, result: path.join(directory, 'unity.json'), log: path.join(directory, 'Player.log')});
      const headless = await runHeadless(context, name);
      const h5 = await runH5(context, name, browser);
      json(path.join(directory, 'headless.json'), headless);
      json(path.join(directory, 'h5.json'), h5);
      assert.deepEqual(actual.result, headless, name + ': Release Player/headless complete snapshot');
      assert.deepEqual(actual.result, h5, name + ': Release Player/h5 complete snapshot');
      comparisons.push({name, comparison: 'Release IL2CPP Player=headless=h5'});
      console.log(JSON.stringify(comparisons.at(-1)));
    }
  } finally { await browser.close(); }
  json(path.join(evidence, 'comparison.json'), {ok: true, comparisons});
  return comparisons;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, ...args] = process.argv.slice(2), options = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!args[index].startsWith('--') || !args[index + 1]) throw failure('Use prepare, run or suite with explicit paths.');
    options[args[index].slice(2)] = args[index + 1];
  }
  if (options.graphical !== undefined && (action !== 'run' || options.graphical !== 'true')) throw failure('Use --graphical true only with run; omit it for batch mode.');
  const inputs = {project: options.project, unityPackage: options.package, puertsCore: options['puerts-core'], puertsV8: options['puerts-v8'], evidence: options.evidence};
  const output = action === 'prepare' ? await prepareConformancePlayer(inputs)
    : action === 'prepare-inventory' ? await prepareValidationPlayer({...inputs, context: await createInventoryContext(), caseNames: ['inventory', 'coverage', 'memory', 'memory-settled', 'format']})
    : action === 'run' ? await runPlayer({player: options.player, scenario: options.case, result: options.result, log: options.log, fixtureBase: options['fixture-base'], graphical: options.graphical === 'true'})
    : action === 'suite' ? await runConformancePlayerSuite({context: JSON.parse(fs.readFileSync(options.context, 'utf8')), player: options.player, evidence: options.evidence})
    : (() => { throw failure('Expected prepare, run or suite.'); })();
  console.log(JSON.stringify(action.startsWith('prepare') ? {project: output.project, bundle: output.bundle, caseNames: output.caseNames} : output, null, 2));
}
