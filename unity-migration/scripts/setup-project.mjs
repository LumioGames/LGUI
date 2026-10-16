import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validation = path.dirname(root), project = path.join(root, 'InventoryUnity');
for (const folder of ['Assets/Editor', 'Assets/Migration', 'Assets/Resources/InventoryUI', 'Packages', 'ProjectSettings']) await fs.mkdir(path.join(project, folder), { recursive: true });
const source = path.join(validation, 'repos/fairygui-unity/Assets');
const copies = [
  [path.join(source, 'Scripts'), path.join(project, 'Assets/FairyGUI/Scripts')],
  [path.join(source, 'Resources/Shaders'), path.join(project, 'Assets/Resources/Shaders')],
  [path.join(root, 'assets-publish/unity/Inventory_fui.bytes'), path.join(project, 'Assets/Resources/InventoryUI/Inventory_fui.bytes')],
  [path.join(root, 'assets-publish/unity/Inventory_atlas0.png'), path.join(project, 'Assets/Resources/InventoryUI/Inventory_atlas0.png')],
  [path.join(root, 'ts/dist/inventory-app.js.txt'), path.join(project, 'Assets/Resources/InventoryApp.txt')],
];
for (const [from, to] of copies) await fs.cp(from, to, { recursive: true, force: false, errorOnExist: false });
const dependencies = {
  'com.tencent.puerts.core': 'file:../../packages/puerts-core',
  'com.tencent.puerts.v8': 'file:../../packages/puerts-v8',
  'com.unity.ugui': '2.6.0',
};
for (const module of ['animation','assetbundle','audio','director','imageconversion','imgui','jsonserialize','particlesystem','physics','physics2d','screencapture','ui','unitywebrequest','unitywebrequestassetbundle','unitywebrequestaudio','unitywebrequesttexture','unitywebrequestwww','video']) dependencies[`com.unity.modules.${module}`] = '1.0.0';
await fs.writeFile(path.join(project, 'Packages/manifest.json'), JSON.stringify({ dependencies }, null, 2) + '\n');
await fs.writeFile(path.join(project, 'ProjectSettings/ProjectVersion.txt'), 'm_EditorVersion: 6000.6.6f1\nm_EditorVersionWithRevision: 6000.6.6f1 (d20c9ac777da)\n');
const sharedFile = path.join(validation, 'prototype/shared/model.ts');
const report = { project, unity: '6000.6.6f1', fairyGuiCommit: '8cc8f214cca79685532eef13372d0a4f74acdf08', sharedFile, sharedSha256: createHash('sha256').update(await fs.readFile(sharedFile)).digest('hex'), copies, dependencies, note: 'Only runtime sources/shaders copied. Existing sample project and business state remain unchanged. Windows OS fonts stay on this machine.' };
await fs.writeFile(path.join(root, 'evidence/project-setup.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
