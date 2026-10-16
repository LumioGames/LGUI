import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const require = createRequire(path.join(root, 'toolchain-test/package.json'));
const editorRequire = createRequire(path.join(root, 'repos/editor-online/package.json'));
const { unzipSync } = editorRequire('fflate');
const { NodeIO } = require('@openfairygui/core/node');
const { publishNode } = require('@openfairygui/functions/node');
const { createNodeBackendRuntime } = require('@openfairygui/backend/node');
const archive = path.resolve(process.argv[2]);
const output = path.resolve(here, process.argv[3] || 'roundtrip-final');
if (!output.startsWith(here + path.sep) || fs.existsSync(output)) throw new Error('Output must be a new folder under 闭环验证.');
const entries = Object.entries(unzipSync(fs.readFileSync(archive)));
const seen = new Set();
for (const [name] of entries) {
  const normalized = name.replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || /^[a-z]:/i.test(normalized) || normalized.split('/').includes('..')) throw new Error('Unsafe archive path: ' + name);
  if (seen.has(normalized.toLowerCase())) throw new Error('Case-colliding archive path: ' + name);
  seen.add(normalized.toLowerCase());
}
const projectDir = path.join(output, 'project');
fs.mkdirSync(projectDir, { recursive: true });
for (const [name, bytes] of entries) {
  const target = path.resolve(projectDir, name);
  if (name.endsWith('/')) { fs.mkdirSync(target, { recursive: true }); continue; }
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes);
}
const fairyFiles = entries.filter(([name]) => name.endsWith('.fairy')).map(([name]) => path.join(projectDir, name));
if (fairyFiles.length !== 1) throw new Error('Expected exactly one exported .fairy project.');
const projectPath = fairyFiles[0];
const document = await new NodeIO().readProject(projectPath);
document.getRoot().setProjectType(4);
const published = path.join(output, 'published');
const publishResult = await publishNode({ document, output: published, compressed: false, fileExtension: 'fui', plugins: [], codeGeneration: false });
if (!Array.isArray(publishResult.files) || publishResult.files.length === 0
    || publishResult.files.some(file => !fs.existsSync(file.path))) throw new Error('Publisher did not return existing output files.');
const web = path.join(output, 'web');
fs.cpSync(path.join(root, 'prototype/web'), web, { recursive: true });
const assets = path.join(web, 'assets/Inventory');
const backend = createNodeBackendRuntime({ allowedProjectRoots: [projectDir] });
const opened = await backend.openSession({ projectPath });
if (!opened.ok) throw new Error(JSON.stringify(opened));
const { sessionId } = opened.data;
let project;
try {
  const state = backend.readSessionState({ sessionId }); if (!state.ok) throw new Error(JSON.stringify(state));
  project = state.data.project;
  const manifest = { schemaVersion: 1, adapter: 'legacy-fairygui-dom-loose-images', source: 'browser-shared-session exported ZIP', packages: {} };
  for (const pkg of project.packages) {
    if (pkg.name !== 'Inventory' || project.packages.length !== 1) throw new Error('This verification exporter supports the single Inventory package only.');
    const images = {};
    for (const resource of pkg.resources.filter(r => r.kind === 'image')) {
      const result = backend.readResourceBytes({ sessionId, expectedRevision: state.data.revision, selector: { packageId: pkg.id, resourceId: resource.id } });
      if (!result.ok) throw new Error(JSON.stringify(result));
      const file = `${resource.id}.png`; images[resource.id] = file;
      fs.writeFileSync(path.join(assets, file), result.data.sourceBytes);
    }
    manifest.packages[pkg.id] = { name: pkg.name, images };
    fs.copyFileSync(path.join(published, pkg.name + '.fui'), path.join(assets, 'package.xml'));
  }
  fs.writeFileSync(path.join(assets, 'manifest.json'), JSON.stringify(manifest, null, 2));
} finally { await backend.closeSession({ sessionId }); }
const title = project.packages[0].resources.find(r => r.name === 'Main').component.displayList.find(n => n.id === 'title');
const result = { sourceArchive: archive, archiveSha256: crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'), output, projectPath, title, publishResult, note: 'Published an explicit saved browser snapshot; Node exporter does not create a second live editor session.' };
fs.writeFileSync(path.join(output, 'publish-report.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ output, projectPath, title, success: true }, null, 2));
