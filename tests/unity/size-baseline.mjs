// Dedicated package-size controls. Does not weaken the ordinary inventory build checks.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {measurePlayerOutput, inspectCompiledBridge, validatePhaseReport} from './player-build.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = 'Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt';
const patchedHash = '3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83';
const labels = {A: 'A', B: 'B', lgui: 'C'};
const fail = message => new Error('LGUI-RT-001 Size baseline: ' + message);
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const hash = file => ({bytes: fs.statSync(file).size, sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
function absolute(value, name) {if (!value || !path.isAbsolute(value)) throw fail(name + ' must be an absolute path.');}
function localPackage(source, name, version) {
  absolute(source, name);
  if (fs.lstatSync(source).isSymbolicLink()) throw fail('Use a real embedded local package source: ' + source);
  const value = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
  if (value.name !== name || value.version !== version) throw fail('Expected local ' + name + ' ' + version + '.');
}

/** Pure file preparation; the caller owns the single native build queue. */
export function prepareSizeBaseline({project, mode, puertsCore, puertsV8, lguiPackage}) {
  absolute(project, 'project');
  if (!Object.hasOwn(labels, mode)) throw fail('Use explicit mode A, B or lgui.');
  if (fs.existsSync(project)) throw fail('Use a fresh project path: ' + project);
  let patch;
  if (mode !== 'A') {
    localPackage(puertsCore, 'com.tencent.puerts.core', '3.0.3'); localPackage(puertsV8, 'com.tencent.puerts.v8', '3.0.3');
    patch = hash(path.join(puertsCore, template));
    if (patch.sha256 !== patchedHash) throw fail('Official four-patch template raw SHA256 mismatch: ' + patch.sha256);
  }
  if (mode === 'lgui') {
    localPackage(lguiPackage, 'com.lumiogames.lgui', '0.3.0');
    for (const file of ['Runtime/LGUIBoot.cs', 'Runtime/link.xml']) if (!fs.existsSync(path.join(lguiPackage, file))) throw fail('LGUI package input missing ' + file);
  }
  fs.mkdirSync(path.join(project, 'Assets/Editor'), {recursive: true});
  fs.mkdirSync(path.join(project, 'Packages'), {recursive: true});
  fs.mkdirSync(path.join(project, 'ProjectSettings'), {recursive: true});
  fs.cpSync(path.join(here, 'UserSettings'), path.join(project, 'UserSettings'), {recursive: true});
  fs.copyFileSync(path.join(here, 'baseline/Editor/LGUISizeBaseline.cs'), path.join(project, 'Assets/Editor/LGUISizeBaseline.cs'));
  const dependencies = {'com.unity.ugui': '2.0.0'};
  for (const module of ['animation','assetbundle','audio','imageconversion','imgui','jsonserialize','particlesystem','physics','physics2d','screencapture','terrain','terrainphysics','ui','uielements','unitywebrequest','unitywebrequestaudio','unitywebrequesttexture','video']) dependencies['com.unity.modules.' + module] = '1.0.0';
  if (mode !== 'A') {
    for (const [name, source] of [['com.tencent.puerts.core', puertsCore], ['com.tencent.puerts.v8', puertsV8]]) {
      fs.cpSync(source, path.join(project, 'Packages', name), {recursive: true}); dependencies[name] = 'file:' + name;
    }
    fs.mkdirSync(path.join(project, 'Assets/Baseline'), {recursive: true});
    fs.writeFileSync(path.join(project, 'Assets/Baseline/link.xml'), '<linker>\n  <assembly fullname="com.tencent.puerts.core" preserve="all" />\n  <assembly fullname="com.tencent.puerts.v8" preserve="all" />\n</linker>\n');
  }
  if (mode === 'B') fs.copyFileSync(path.join(here, 'baseline/LGUIPuerTSBaseline.cs'), path.join(project, 'Assets/LGUIPuerTSBaseline.cs'));
  if (mode === 'lgui') {
    fs.cpSync(lguiPackage, path.join(project, 'Packages/com.lumiogames.lgui'), {recursive: true}); dependencies['com.lumiogames.lgui'] = 'file:com.lumiogames.lgui';
    fs.mkdirSync(path.join(project, 'Assets/LGUI/Resources/Game'), {recursive: true});
    fs.copyFileSync(path.join(lguiPackage, 'Runtime/link.xml'), path.join(project, 'Assets/LGUI/link.xml'));
    fs.writeFileSync(path.join(project, 'Assets/LGUI/Resources/Game/game.js.txt'), 'globalThis.__lguiFrame = () => {};\nglobalThis.__lguiVisibility = () => {};\nglobalThis.__lguiDispose = () => {};\nglobalThis.__lguiStart = async () => { globalThis.__lguiReady = true; };\n');
  }
  json(path.join(project, 'Packages/manifest.json'), {dependencies});
  fs.writeFileSync(path.join(project, 'ProjectSettings/ProjectVersion.txt'), 'm_EditorVersion: 6000.6.6f1\n');
  const result = {mode, label: labels[mode], unity: '6000.6.6f1', patch, lguiPackage: mode === 'lgui' ? {manifest: hash(path.join(lguiPackage, 'package.json')), boot: hash(path.join(lguiPackage, 'Runtime/LGUIBoot.cs'))} : null,
    purpose: mode === 'A' ? 'Camera only; no PuerTS or LGUI' : mode === 'B' ? 'Camera and actual JsEnv V8 runtime; no LGUI' : 'Camera and real LGUIBoot with empty valid JS; no UI assets'};
  json(path.join(project, 'ProjectSettings/LGUISizeBaseline.json'), result);
  return result;
}

export function compareBaselineMeasurements(reports) {
  if (!Array.isArray(reports) || reports.length < 2) throw fail('At least two actual baseline measurements are required.');
  const config = reports[0]?.config;
  const required = {unity: '6000.6.6f1', target: 'StandaloneWindows64', backend: 'IL2CPP', compiler: 'Release', stripping: 'Low',
    apiCompatibility: 'NET_Standard_2_0', managedCodeVariant: 'Release', development: false, buildOptions: 'None', screenMode: 'Windowed'};
  const keys = [...Object.keys(required), 'width', 'height', 'resizable'];
  for (const report of reports) {
    const actual = report?.config;
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) throw fail('Expected an actual config object.');
    for (const key of keys) if (!Object.hasOwn(actual, key)) throw fail('Missing actual config field ' + key + '.');
    for (const [key, expected] of Object.entries(required)) if (actual[key] !== expected) throw fail('Invalid actual config field ' + key + '; expected ' + String(expected) + '.');
    for (const key of ['width', 'height']) if (!Number.isSafeInteger(actual[key]) || actual[key] <= 0) throw fail('Invalid actual config field ' + key + '; expected positive integer pixels.');
    if (typeof actual.resizable !== 'boolean') throw fail('Invalid actual config field resizable; expected a boolean.');
    for (const key of keys) if (actual[key] !== config[key]) throw fail('Cannot compare different config field ' + key + '.');
    if (!Number.isSafeInteger(report.measurement?.distributionBytes) || report.measurement.distributionBytes < 0) throw fail('Expected measured distributionBytes.');
  }
  return {controls: reports.map(report => ({mode: report.mode, distributionBytes: report.measurement.distributionBytes, v8Bytes: report.measurement.v8Bytes})),
    config, deltas: reports.slice(1).map((report, index) => ({from: reports[index].mode, to: report.mode, bytes: report.measurement.distributionBytes - reports[index].measurement.distributionBytes})),
    attributionLimit: 'These are raw marginal distribution deltas under matching settings. GameAssembly.dll is aggregate IL2CPP code and cannot be partitioned entirely as LGUI. Shader/resource/code interactions and stripping can make deltas negative.'};
}

export function inspectManagedRelease(project) {
  const bee = path.join(project, 'Library/Bee');
  const dags = fs.readdirSync(bee).filter(name => /P\.dag\.json$/.test(name)).map(name => path.join(bee, name));
  const responses = dags.flatMap(dag => JSON.parse(fs.readFileSync(dag, 'utf8')).Nodes.filter(node => /^Csc /.test(node.Annotation ?? '')).flatMap(node =>
    node.Inputs.filter(input => input.endsWith('.rsp')).map(input => {
      const file = path.resolve(project, input), text = fs.readFileSync(file, 'utf8');
      const optimized = /^\s*\/optimize\+\s*$/m.test(text) && !/^\s*\/optimize-\s*$/m.test(text);
      if (!optimized) throw fail('Actual Player Csc response is missing /optimize+: ' + input);
      return {annotation: node.Annotation, path: path.relative(project, file).split(path.sep).join('/'), ...hash(file), optimized};
    })));
  if (responses.length === 0) throw fail('Actual Player Csc response inputs were not found.');
  return {dags: dags.map(file => ({path: path.relative(project, file).split(path.sep).join('/'), ...hash(file)})), responses};
}

async function command(editor, args, log) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(log, {flags: 'wx'});
    const child = spawn(editor, args, {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    child.stdout.pipe(output, {end: false}); child.stderr.pipe(output, {end: false});
    child.on('error', error => {output.end(); reject(fail(error.message));});
    child.on('close', code => output.end(() => resolve(code)));
  });
}
/** Explicit native operation, never called by preparation or lgui export. */
export async function buildSizeBaseline({editor, project, evidence, output}) {
  for (const [name, value] of Object.entries({editor, project, evidence, output})) absolute(value, name);
  if (process.platform !== 'win32') throw fail('Windows native baselines must build on Windows.');
  if (path.extname(output).toLowerCase() !== '.exe' || fs.existsSync(output) || (fs.existsSync(path.dirname(output)) && fs.readdirSync(path.dirname(output)).length)) throw fail('Use a fresh .exe inside an empty output directory.');
  const setup = JSON.parse(fs.readFileSync(path.join(project, 'ProjectSettings/LGUISizeBaseline.json'), 'utf8'));
  if (!Object.hasOwn(labels, setup.mode)) throw fail('Unknown project baseline mode.');
  fs.mkdirSync(evidence, {recursive: true}); fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.copyFileSync(path.join(here, 'baseline/Editor/LGUISizeBaseline.cs'), path.join(project, 'Assets/Editor/LGUISizeBaseline.cs'));
  const reports = {};
  for (const phase of setup.mode === 'A' ? ['Configure', 'Build'] : ['Configure', 'Generate', 'Build']) {
    const report = path.join(evidence, phase.toLowerCase() + '.json');
    if (fs.existsSync(report)) throw fail('Use fresh evidence; already exists: ' + report);
    const args = ['-batchmode', '-quit', '-buildTarget', 'Win64', '-projectPath', project, '-executeMethod', 'LGUI.Tests.LGUISizeBaseline.' + phase,
      '-logFile', path.join(evidence, phase.toLowerCase() + '.log'), '-lguiBaselineReport', report, '-lguiOutput', output];
    json(path.join(evidence, phase.toLowerCase() + '-command.json'), {editor, args});
    const code = await command(editor, args, path.join(evidence, phase.toLowerCase() + '-stdout.log'));
    if (code !== 0 || !fs.existsSync(report)) throw fail(phase + ' exited ' + code + '; inspect native evidence.');
    reports[phase.toLowerCase()] = JSON.parse(fs.readFileSync(report, 'utf8')); validatePhaseReport(reports[phase.toLowerCase()]);
  }
  const result = {ok: true, mode: setup.label, config: reports.build.config, setup, reports, measurement: measurePlayerOutput(output),
    compiledBridge: setup.mode === 'A' ? null : inspectCompiledBridge(project), managedRelease: inspectManagedRelease(project),
    scope: 'Native build size control only; actual V8 Eval and disposal need the explicit B Player probe. No inventory or UI behavior is claimed.'};
  json(path.join(evidence, 'acceptance.json'), result); return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, ...args] = process.argv.slice(2), options = {};
  const names = {'editor': 'editor', 'project': 'project', 'evidence': 'evidence', 'output': 'output', 'puerts-core': 'puertsCore', 'puerts-v8': 'puertsV8', 'lgui-package': 'lguiPackage', 'mode': 'mode'};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].slice(2);
    if (!args[i].startsWith('--') || !Object.hasOwn(names, key) || !args[i + 1]) throw fail('Use prepare/build with explicit named options.');
    options[names[key]] = key === 'mode' ? args[i + 1] : path.resolve(args[i + 1]);
  }
  const result = action === 'prepare' ? prepareSizeBaseline(options) : action === 'build' ? await buildSizeBaseline(options) : (() => {throw fail('Use prepare or build.');})();
  console.log(JSON.stringify(result, null, 2));
}
