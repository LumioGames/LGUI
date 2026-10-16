import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verification = path.dirname(root);
const viteRoot = path.join(verification, 'repos/editor-online/node_modules/vite');
const { build } = await import(pathToFileURL(path.join(viteRoot, 'dist/node/index.js')));
const dependency = JSON.parse(fs.readFileSync(path.join(viteRoot, 'package.json'), 'utf8'));
const entry = path.join(root, 'ts/index.ts');
const sharedModel = path.join(verification, 'prototype/shared/model.ts');
const outfile = path.join(root, 'ts/dist/inventory-app.js.txt');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const modelHashBefore = sha256(sharedModel);
const result = await build({
  configFile: false,
  root,
  publicDir: false,
  logLevel: 'silent',
  build: {
    write: false,
    minify: false,
    target: 'es2020',
    sourcemap: true,
    lib: { entry, formats: ['iife'], name: 'InventoryBridge' },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
const chunk = outputs.find(item => item.type === 'chunk');
if (!chunk || !chunk.map) throw new Error('The IIFE and its source map were not produced');
const inputs = Object.keys(chunk.modules);
const normalizedModel = sharedModel.replaceAll('\\', '/');
if (!inputs.some(input => input.replaceAll('\\', '/') === normalizedModel)) {
  throw new Error('The bundle did not include the original shared Inventory source');
}
if (modelHashBefore !== sha256(sharedModel)) throw new Error('The shared model changed during build');
fs.mkdirSync(path.dirname(outfile), { recursive: true });
fs.writeFileSync(outfile, chunk.code.replace(/\n?\/\/# sourceMappingURL=.*$/m, '') + '\n');
fs.writeFileSync(outfile + '.map', chunk.map.toString());
const evidence = {
  timestamp: new Date().toISOString(),
  command: 'node scripts/build-ts.mjs',
  node: process.version,
  bundler: { name: dependency.name, version: dependency.version, origin: viteRoot, installedForThisTask: false },
  format: 'iife', target: 'es2020', minified: false,
  entry, output: outfile, bytes: fs.statSync(outfile).size, sha256: sha256(outfile),
  sourceMap: outfile + '.map',
  inputs,
  sharedModel: { path: sharedModel, sha256: modelHashBefore, unchangedDuringBuild: true, importedDirectly: true },
  sourceHashes: [entry, path.join(root, 'ts/inventory-app.ts'), sharedModel].map(file => ({ path: file, sha256: sha256(file) })),
  runtimePlatformGlobalsRequired: [],
  scope: 'Build provenance only; actual PuerTS Editor/IL2CPP verification belongs to the Unity test project',
};
fs.mkdirSync(path.join(root, 'evidence'), { recursive: true });
fs.writeFileSync(path.join(root, 'evidence/ts-build.json'), JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
