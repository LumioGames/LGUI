import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototype = path.join(root, 'prototype');
const out = path.join(prototype, 'web');
fs.mkdirSync(path.join(out, 'shared'), { recursive: true });
fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });
for (const [source, target] of [['shared/model.ts', 'shared/model.js'], ['dom.ts', 'dom.js']]) {
  if (!fs.existsSync(path.join(prototype, source))) continue;
  const result = stripTypeScriptTypes(fs.readFileSync(path.join(prototype, source), 'utf8'));
  fs.writeFileSync(path.join(out, target), result.replaceAll('./shared/model.ts', './shared/model.js'));
}
fs.copyFileSync(path.join(root, 'repos/fairygui-dom/dist/fairygui.module.js'), path.join(out, 'vendor/fairygui.module.js'));
fs.copyFileSync(path.join(root, 'repos/fairygui-dom/LICENSE'), path.join(out, 'vendor/FairyGUI-LICENSE.txt'));
console.log(JSON.stringify({ compiler: 'Node ' + process.version + ' stripTypeScriptTypes', output: out, runtime: 'fade49fc33bdcd5673351e04637d4cc08d2297f3' }));
