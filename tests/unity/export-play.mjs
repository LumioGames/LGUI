// Optional native acceptance: exports the real inventory app, then plays its generated boot scene.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn, spawnSync} from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const failure = message => new Error('LGUI-RT-001 ' + message);
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function command(file, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, {cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => {stdout += chunk;}); child.stderr.on('data', chunk => {stderr += chunk;});
    child.on('error', reject);
    child.on('exit', code => resolve({code, stdout, stderr}));
  });
}
function extract(archive, target, expectedHash) {
  if (digest(archive) !== expectedHash) throw failure('Official PuerTS archive SHA256 mismatch: ' + archive);
  const list = spawnSync('tar', ['-tzf', archive], {encoding: 'utf8', windowsHide: true});
  if (list.status !== 0) throw failure('Cannot inspect the official PuerTS archive: ' + list.stderr);
  for (const entry of list.stdout.trim().split(/\r?\n/)) {
    if (/^[\\/]|^[A-Za-z]:|(^|[\\/])\.\.([\\/]|$)/.test(entry)) throw failure('Unsafe PuerTS archive entry: ' + entry);
  }
  fs.mkdirSync(target, {recursive: true});
  const output = spawnSync('tar', ['-xzf', archive, '-C', target, '--strip-components=1'], {encoding: 'utf8', windowsHide: true});
  if (output.status !== 0) throw failure('Cannot extract official PuerTS package: ' + output.stderr);
}

export async function exportAndPlay({editor, project, coreArchive, v8Archive, evidence}) {
  for (const value of [editor, project, coreArchive, v8Archive, evidence]) if (!value || !path.isAbsolute(value)) throw failure('Every native acceptance path must be absolute.');
  if (fs.existsSync(project)) throw failure('Native acceptance requires a fresh empty Unity project path: ' + project);
  fs.mkdirSync(evidence, {recursive: true});
  fs.mkdirSync(path.join(project, 'Assets/Editor'), {recursive: true});
  fs.mkdirSync(path.join(project, 'ProjectSettings'), {recursive: true});
  // Keep Unity's normal Assets/Packages search index configuration in this hand-built test project.
  fs.cpSync(path.join(here, 'UserSettings'), path.join(project, 'UserSettings'), {recursive: true});
  extract(coreArchive, path.join(project, 'Packages/com.tencent.puerts.core'), 'feafc11bf2f9dbdb7e5fd2546124a771ea69b0f7c1a194740d47cfffb721cea0');
  extract(v8Archive, path.join(project, 'Packages/com.tencent.puerts.v8'), '649b2de6dc74b24a17e1c624e5c6e98f381f05b1975b68b055ee8d5c47ea6e27');
  const dependencies = {'com.unity.ugui': '2.0.0', 'com.tencent.puerts.core': 'file:com.tencent.puerts.core', 'com.tencent.puerts.v8': 'file:com.tencent.puerts.v8'};
  for (const module of ['animation','assetbundle','audio','imageconversion','imgui','jsonserialize','particlesystem','physics','physics2d','screencapture','terrain','terrainphysics','ui','uielements','unitywebrequest','unitywebrequestaudio','unitywebrequesttexture','video']) dependencies['com.unity.modules.' + module] = '1.0.0';
  fs.writeFileSync(path.join(project, 'Packages/manifest.json'), JSON.stringify({dependencies}, null, 2) + '\n');
  fs.writeFileSync(path.join(project, 'ProjectSettings/ProjectVersion.txt'), 'm_EditorVersion: 6000.6.6f1\n');
  fs.copyFileSync(path.join(here, 'Assets/LGUIConformanceBridge.cs'), path.join(project, 'Assets/LGUIConformanceBridge.cs'));
  fs.copyFileSync(path.join(here, 'Assets/Editor/LGUIExportAcceptance.cs'), path.join(project, 'Assets/Editor/LGUIExportAcceptance.cs'));
  const synced = await command(process.execPath, ['scripts/sync-examples.mjs'], root);
  if (synced.code !== 0) throw failure('Cannot synchronize example framework: ' + synced.stdout + synced.stderr);
  const inventory = path.join(root, 'examples/inventory');
  const configFile = path.join(inventory, '.lgui/project.json');
  const config = fs.readFileSync(configFile);
  let exported;
  try {
    exported = await command(process.execPath, [path.join(root, 'plugin/tools/lgui.mjs'), 'unity', 'export', '--to', project, '--json'], inventory);
    fs.writeFileSync(path.join(evidence, 'export-cli.json'), exported.stdout);
    fs.writeFileSync(path.join(evidence, 'export-cli.stderr.txt'), exported.stderr);
    if (exported.code !== 0) throw failure('Actual inventory export failed: ' + exported.stdout + exported.stderr);
  } finally { fs.writeFileSync(configFile, config); }
  const result = path.join(evidence, 'export-play.json');
  const log = path.join(evidence, 'unity-editor.log');
  const bundle = path.join(project, 'Assets/LGUI/Resources/Game/game.js.txt');
  const exportedBundleHash = digest(bundle);
  const exportedSceneHash = digest(path.join(project, 'Assets/LGUI/LGUIBoot.unity'));
  if (fs.existsSync(result)) throw failure('Result file already exists: ' + result);
  const native = await command(editor, ['-batchmode', '-projectPath', project, '-executeMethod', 'LGUI.Tests.LGUIExportAcceptance.Run', '-logFile', log, '-lguiResult', result, '-lguiEvidence', evidence], root);
  fs.writeFileSync(path.join(evidence, 'editor-stdout.txt'), native.stdout + native.stderr);
  if (native.code !== 0) throw failure('Unity export Play acceptance exited ' + native.code + ': inspect ' + log);
  const report = JSON.parse(fs.readFileSync(result, 'utf8'));
  if (!report.ok) throw failure('Actual exported scene failed: ' + report.message);
  if (digest(bundle) !== exportedBundleHash) throw failure('The generated bundle changed during native acceptance.');
  const acceptance = {project, editor, export: JSON.parse(exported.stdout), report, log, exportedBundleHash, exportedSceneHash, configRestored: fs.readFileSync(configFile).equals(config)};
  fs.writeFileSync(path.join(evidence, 'acceptance.json'), JSON.stringify(acceptance, null, 2) + '\n');
  return acceptance;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), options = {};
  for (let i = 0; i < args.length; i += 2) { if (!args[i].startsWith('--') || !args[i + 1]) throw failure('Use --editor, --project, --core-archive, --v8-archive and --evidence.'); options[args[i].slice(2)] = path.resolve(args[i + 1]); }
  console.log(JSON.stringify(await exportAndPlay({editor: options.editor, project: options.project, coreArchive: options['core-archive'], v8Archive: options['v8-archive'], evidence: options.evidence}), null, 2));
}
