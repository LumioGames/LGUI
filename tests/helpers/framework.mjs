// 测试用：把框架、headless 后端和模拟操作打包成一个模块；用 fixture 界面建好 headless 后端并设置运行时。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {importTs} from './ts.mjs';
import {writeFixture} from './fixture.mjs';
import {generateProjectTypes} from '../../plugin/tools/lib/generate/index.mjs';

const framework = fileURLToPath(new URL('../../plugin/framework', import.meta.url));
let cached = null;

export async function loadFramework() {
  if (cached) return cached;
  const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-fw-')), 'entry.ts');
  const f = rel => JSON.stringify(path.join(framework, rel));
  fs.writeFileSync(entry, [
    `export * from ${f('index.ts')};`,
    `export {createHeadlessBackend} from ${f('backends/headless/index.ts')};`,
    `export * as sim from ${f('backends/headless/simulate.ts')};`,
    `export {setRuntime, clearRuntime, defaultConfig} from ${f('mvc/runtime.ts')};`,
    `export {bus} from ${f('mvc/events.ts')};`
  ].join('\n'));
  cached = await importTs(entry);
  return cached;
}

// 用 fixture（或给定工程根目录）的 headless 描述建一个后端，并设成当前运行时。
export async function headless({root = writeFixture(), config = {}} = {}) {
  const fw = await loadFramework();
  await generateProjectTypes(root);
  const dir = path.join(root, '.lgui/build/headless');
  const packages = fs.readdirSync(dir).map(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
  const backend = fw.createHeadlessBackend(packages);
  await backend.init({projectName: 'test', defaultFont: null, uiBase: ''});
  fw.setRuntime(backend, {...fw.defaultConfig, ...config}, 1_700_000_000_000);
  return {fw, backend, root};
}
