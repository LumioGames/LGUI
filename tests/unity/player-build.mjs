// Repository-only native build tooling. lgui unity export remains a pure file export.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const template = 'Packages/com.tencent.puerts.core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt';
const patchedHash = '3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83';
const failure = message => new Error('LGUI-RT-001 Player build: ' + message);
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const relative = (base, file) => path.relative(base, file).split(path.sep).join('/');
function absolute(value, name) {
  if (!value || !path.isAbsolute(value)) throw failure(name + ' must be an absolute path.');
}
function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(item => {
    const file = path.join(directory, item.name);
    if (item.isSymbolicLink()) throw failure('Project inputs must be real files, not directory links: ' + file);
    return item.isDirectory() ? files(file) : [file];
  });
}
function hashFile(project, file) { return {path: relative(project, file), bytes: fs.statSync(file).size, sha256: digest(file)}; }

/** Reads the exact build inputs. This function neither generates files nor starts Unity. */
export function inspectPlayerProject(project) {
  absolute(project, 'project');
  try {
    const version = /^m_EditorVersion:\s*(\S+)\s*$/m.exec(fs.readFileSync(path.join(project, 'ProjectSettings/ProjectVersion.txt'), 'utf8'))?.[1];
    if (version !== '6000.6.6f1') throw failure('This verification requires Unity 6000.6.6f1; found ' + version + '.');
    const manifest = JSON.parse(fs.readFileSync(path.join(project, 'Packages/manifest.json'), 'utf8'));
    for (const name of ['com.tencent.puerts.core', 'com.tencent.puerts.v8']) {
      const directory = path.join(project, 'Packages', name);
      if (fs.lstatSync(directory).isSymbolicLink()) throw failure('PuerTS must be an embedded local package: ' + directory);
      const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
      if (pkg.name !== name || pkg.version !== '3.0.3' || manifest.dependencies[name] !== 'file:' + name) throw failure('Expected embedded official ' + name + ' 3.0.3.');
    }
    const patch = hashFile(project, path.join(project, template));
    if (patch.sha256 !== patchedHash) throw failure('PuerTS template raw SHA256 mismatch: ' + patch.sha256 + '. Export again with the official Core 3.0.3 package.');
    const source = fs.readFileSync(path.join(project, template), 'utf8');
    patch.unboxCalls = (source.match(/il2cpp_object_unbox\(/g) ?? []).length;
    if (patch.unboxCalls !== 4 || source.includes('Object::Unbox')) throw failure('Expected exactly four public unbox calls in the fixed PuerTS template.');
    const link = fs.readFileSync(path.join(project, 'Assets/LGUI/link.xml'), 'utf8');
    for (const assembly of ['FairyGUI', 'LGUI.Runtime', 'com.tencent.puerts.core', 'com.tencent.puerts.v8']) {
      if (!new RegExp('<assembly\\s+fullname="' + assembly.replaceAll('.', '\\.') + '"\\s+preserve="all"\\s*/>').test(link)) throw failure('Assets/LGUI/link.xml must preserve all of ' + assembly + '.');
    }
    const wrappers = files(path.join(project, 'Assets')).filter(file => /(?:_Wrap\.cs|RegisterInfo_Gen\.cs|PuertsIl2cppWrapperDef\d+\.cpp)$/.test(file));
    if (wrappers.length) throw failure('Unexpected type static wrapper inputs: ' + wrappers.map(file => relative(project, file)).join(', ') + '. Use a fresh Reflection Mode project.');
    const ui = files(path.join(project, 'Assets/LGUI/Resources/UI')).filter(file => !file.endsWith('.meta')).sort().map(file => hashFile(project, file));
    if (ui.length === 0) throw failure('Exported UI resources are missing. Run lgui unity export first.');
    return {unityVersion: version, patch, game: hashFile(project, path.join(project, 'Assets/LGUI/Resources/Game/game.js.txt')), ui,
      scene: hashFile(project, path.join(project, 'Assets/LGUI/LGUIBoot.unity')), linker: hashFile(project, path.join(project, 'Assets/LGUI/link.xml')), staticWrappers: []};
  } catch (cause) {
    if (cause.message.startsWith('LGUI-RT-001')) throw cause;
    throw failure(cause.message + ' Inspect the exported Unity project and explicit local package paths.');
  }
}

/** Unity explicitly names these two output folders as build support, not game distribution. */
export function measurePlayerOutput(output) {
  const directory = path.dirname(output);
  const outputFiles = files(directory).map(file => hashFile(directory, file));
  const buildSupportFiles = outputFiles.filter(file => /^[^/]+_(?:BackUpThisFolder_ButDontShipItWithYourGame|BurstDebugInformation_DoNotShip)\//.test(file.path));
  const excluded = new Set(buildSupportFiles.map(file => file.path));
  const distributionFiles = outputFiles.filter(file => !excluded.has(file.path));
  const v8Files = distributionFiles.filter(file => /(?:^|\/)PapiV8\.dll$/i.test(file.path));
  const bytes = list => list.reduce((total, file) => total + file.bytes, 0);
  return {outputFiles, allOutputBytes: bytes(outputFiles), distributionFiles, distributionBytes: bytes(distributionFiles),
    buildSupportFiles, buildSupportBytes: bytes(buildSupportFiles), v8Files, v8Bytes: bytes(v8Files)};
}

/** Verifies the generated native source against the actual Bee compiler inputs and existing object outputs. */
export function inspectCompiledBridge(project) {
  const generated = path.join(project, 'Assets/Gen/Plugins/puerts_il2cpp');
  const compiled = path.join(project, 'Library/Bee/artifacts/WinPlayerBuildProgram/il2cppOutput/cpp');
  const dags = fs.readdirSync(path.join(project, 'Library/Bee')).filter(name => /^Player.*\.dag\.json$/.test(name)).map(name => path.join(project, 'Library/Bee', name));
  const nodes = dags.flatMap(file => JSON.parse(fs.readFileSync(file, 'utf8')).Nodes);
  const inputs = files(generated).filter(file => /\.(?:cpp|h)$/.test(file)).sort();
  if (inputs.length === 0) throw failure('No generated native bridge sources are available.');
  const result = inputs.map(file => {
    const source = hashFile(project, file), target = path.join(compiled, path.basename(file));
    const actual = hashFile(project, target);
    if (source.sha256 !== actual.sha256) throw failure('Actual compiled native source SHA256 differs from generated bridge: ' + source.path);
    const commands = file.endsWith('.cpp') ? nodes.filter(node => /^C_Win_x64_/.test(node.Annotation ?? '') &&
      (node.Inputs ?? []).some(input => path.resolve(project, input) === path.resolve(target))).map(node => ({annotation: node.Annotation, command: node.Action,
      objects: node.Outputs.map(object => hashFile(project, path.resolve(project, object)))})) : [];
    if (file.endsWith('.cpp') && commands.length === 0) throw failure('Actual Bee x64 compilation command is missing for ' + source.path);
    return {source, compiled: actual, commands, objects: commands.flatMap(command => command.objects)};
  });
  return {dags: dags.map(file => hashFile(project, file)), files: result};
}

export function validatePhaseReport(report) {
  if (!report.ok) throw failure(report.phase + ' failed: ' + report.error);
  const errors = (report.editorMessages ?? []).filter(message => ['Error', 'Exception', 'Assert'].includes(message.type));
  if (errors.length) throw failure(report.phase + ' logged actual native errors: ' + errors.map(message => message.type + ': ' + message.content).join('\n'));
}

export function testHttpOptions(project, allowTestHTTP = false) {
  if (typeof allowTestHTTP !== 'boolean') throw failure('allowTestHTTP must be a boolean.');
  if (allowTestHTTP) {
    for (const name of ['LGUIConformanceBridge.cs', 'LGUIPlayerAcceptance.cs']) {
      const file = path.join(project, 'Assets', name);
      const info = fs.lstatSync(file, {throwIfNoEntry: false});
      if (!info?.isFile() || info.isSymbolicLink() || info.size === 0) throw failure('Test HTTP requires a real nonempty Assets/' + name + ' file.');
    }
  }
  return {testOnlyHTTP: allowTestHTTP, expectedPolicy: allowTestHTTP ? 'AlwaysAllowed' : 'NotAllowed', nativeArgs: ['-lguiTestHTTP', String(allowTestHTTP)]};
}

export function validateTestHttpReport(report, allowTestHTTP = false) {
  if (report.testOnlyHTTP !== allowTestHTTP || report.insecureHttpOption !== (allowTestHTTP ? 'AlwaysAllowed' : 'NotAllowed')) {
    throw failure('Actual HTTP policy does not match the explicit test-only HTTP flag in phase ' + report.phase + '.');
  }
}

async function command(file, args, cwd, stdoutFile) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(stdoutFile, {flags: 'wx'});
    const child = spawn(file, args, {cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    child.stdout.pipe(output, {end: false}); child.stderr.pipe(output, {end: false});
    child.on('error', error => {output.end(); reject(failure(error.message));});
    child.on('close', code => {output.end(() => resolve(code));});
  });
}

/** Prepares a dedicated ordinary inventory project; no test input bridge or replacement JS is added. */
export async function prepareInventoryPlayer({project, puertsCore, puertsV8, evidence}) {
  for (const [name, value] of Object.entries({project, puertsCore, puertsV8, evidence})) absolute(value, name);
  if (fs.existsSync(project)) throw failure('Prepare requires a new project directory: ' + project);
  for (const [source, name] of [[puertsCore, 'com.tencent.puerts.core'], [puertsV8, 'com.tencent.puerts.v8']]) {
    const pkg = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
    if (pkg.name !== name || pkg.version !== '3.0.3') throw failure('Expected the official local ' + name + ' 3.0.3 package.');
  }
  fs.mkdirSync(evidence, {recursive: true});
  fs.mkdirSync(path.join(project, 'Assets/Editor'), {recursive: true});
  fs.mkdirSync(path.join(project, 'ProjectSettings'), {recursive: true});
  fs.mkdirSync(path.join(project, 'Packages'), {recursive: true});
  fs.cpSync(path.join(here, 'UserSettings'), path.join(project, 'UserSettings'), {recursive: true});
  fs.cpSync(puertsCore, path.join(project, 'Packages/com.tencent.puerts.core'), {recursive: true});
  fs.cpSync(puertsV8, path.join(project, 'Packages/com.tencent.puerts.v8'), {recursive: true});
  const dependencies = {'com.unity.ugui': '2.0.0', 'com.tencent.puerts.core': 'file:com.tencent.puerts.core', 'com.tencent.puerts.v8': 'file:com.tencent.puerts.v8'};
  for (const module of ['animation','assetbundle','audio','imageconversion','imgui','jsonserialize','particlesystem','physics','physics2d','screencapture','terrain','terrainphysics','ui','uielements','unitywebrequest','unitywebrequestaudio','unitywebrequesttexture','video']) dependencies['com.unity.modules.' + module] = '1.0.0';
  json(path.join(project, 'Packages/manifest.json'), {dependencies});
  fs.writeFileSync(path.join(project, 'ProjectSettings/ProjectVersion.txt'), 'm_EditorVersion: 6000.6.6f1\n');
  fs.copyFileSync(path.join(here, 'Assets/Editor/LGUIPlayerBuild.cs'), path.join(project, 'Assets/Editor/LGUIPlayerBuild.cs'));
  const synced = await command(process.execPath, ['scripts/sync-examples.mjs'], root, path.join(evidence, 'sync-examples.log'));
  if (synced !== 0) throw failure('Example framework sync failed; inspect sync-examples.log.');
  const inventory = path.join(root, 'examples/inventory');
  const configFile = path.join(inventory, '.lgui/project.json');
  const config = fs.readFileSync(configFile);
  try {
    const exitCode = await command(process.execPath, [path.join(root, 'plugin/tools/lgui.mjs'), 'unity', 'export', '--to', project, '--json'], inventory, path.join(evidence, 'export-cli.log'));
    if (exitCode !== 0) throw failure('Inventory export failed; inspect export-cli.log.');
  } finally {fs.writeFileSync(configFile, config);}
  const inputs = inspectPlayerProject(project);
  const sources = ['src', 'ui'].flatMap(directory => files(path.join(inventory, directory))).map(file => hashFile(inventory, file));
  json(path.join(evidence, 'prepared-inputs.json'), {...inputs, example: 'examples/inventory', sourceFiles: sources, configRestored: fs.readFileSync(configFile).equals(config)});
  return inputs;
}

/** Three separate Editor invocations allow generated C# and native assets to import before BuildPlayer. */
export async function buildPlayer({editor, project, evidence, output, allowTestHTTP = false}) {
  for (const [name, value] of Object.entries({editor, project, evidence, output})) absolute(value, name);
  const http = testHttpOptions(project, allowTestHTTP);
  if (process.platform !== 'win32') throw failure('Windows x64 native validation must run on Windows.');
  if (path.extname(output).toLowerCase() !== '.exe' || fs.existsSync(output)) throw failure('Choose a fresh Windows .exe output path.');
  if (fs.existsSync(path.dirname(output)) && fs.readdirSync(path.dirname(output)).length) throw failure('The Player output directory must be empty, so its manifest cannot contain stale files.');
  const before = inspectPlayerProject(project);
  fs.mkdirSync(evidence, {recursive: true});
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.mkdirSync(path.join(project, 'Assets/Editor'), {recursive: true});
  fs.copyFileSync(path.join(here, 'Assets/Editor/LGUIPlayerBuild.cs'), path.join(project, 'Assets/Editor/LGUIPlayerBuild.cs'));
  json(path.join(evidence, 'inputs-before.json'), before);
  const reports = {};
  for (const [phase, method] of [['configure', 'Configure'], ['generate', 'Generate'], ['build', 'Build']]) {
    const report = path.join(evidence, phase + '.json');
    if (fs.existsSync(report)) throw failure('A phase report already exists; choose fresh evidence: ' + report);
    const log = path.join(evidence, phase + '.log');
    const args = ['-batchmode', '-quit', '-buildTarget', 'Win64', '-projectPath', project, '-executeMethod', 'LGUI.Tests.LGUIPlayerBuild.' + method,
      '-logFile', log, '-lguiBuildReport', report, '-lguiOutput', output, ...http.nativeArgs];
    json(path.join(evidence, phase + '-command.json'), {editor, args, startedUtc: new Date().toISOString()});
    const exitCode = await command(editor, args, root, path.join(evidence, phase + '-stdout.log'));
    if (exitCode !== 0 || !fs.existsSync(report)) throw failure(phase + ' exited ' + exitCode + '; inspect ' + log + '.');
    reports[phase] = JSON.parse(fs.readFileSync(report, 'utf8'));
    validatePhaseReport(reports[phase]);
    validateTestHttpReport(reports[phase], allowTestHTTP);
  }
  const after = inspectPlayerProject(project);
  for (const name of ['game', 'scene', 'patch', 'linker']) if (before[name].sha256 !== after[name].sha256) throw failure('Build changed exported input: ' + name);
  if (JSON.stringify(before.ui) !== JSON.stringify(after.ui)) throw failure('Build changed exported UI resources, atlases or translations.');
  const report = {ok: true, editor, project, output, inputs: after, reports, testOnlyHTTP: allowTestHTTP, insecureHttpOption: reports.build.insecureHttpOption,
    insecureHttpOptionValue: reports.build.insecureHttpOptionValue, ...measurePlayerOutput(output), compiledBridge: inspectCompiledBridge(project), completedUtc: new Date().toISOString(),
    scope: 'Release IL2CPP build only. Player execution, visible pixels, conformance and memory require separate acceptance.'};
  json(path.join(evidence, 'acceptance.json'), report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, ...args] = process.argv.slice(2), options = {};
  const allowed = new Set(['editor', 'project', 'puerts-core', 'puerts-v8', 'evidence', 'output', 'allow-test-http']);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].slice(2);
    if (!args[i].startsWith('--') || !allowed.has(key) || !args[i + 1] || args[i + 1].startsWith('--') || Object.hasOwn(options, key === 'allow-test-http' ? 'allowTestHTTP' : key)) throw failure('Use prepare/inspect/build and explicit named paths; --allow-test-http accepts only true for a dedicated test build.');
    if (key === 'allow-test-http') {
      if (action !== 'build' || args[i + 1] !== 'true') throw failure('--allow-test-http accepts only true for a dedicated test build.');
      options.allowTestHTTP = true;
    } else options[key] = path.resolve(args[i + 1]);
  }
  const value = action === 'prepare' ? await prepareInventoryPlayer({project: options.project, puertsCore: options['puerts-core'], puertsV8: options['puerts-v8'], evidence: options.evidence})
    : action === 'inspect' ? inspectPlayerProject(options.project)
    : action === 'build' ? await buildPlayer(options) : (() => {throw failure('Expected prepare, inspect or build.');})();
  console.log(JSON.stringify(value, null, 2));
}
