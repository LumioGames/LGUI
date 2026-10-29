// 把插件里的框架复制进 examples/*/.lgui/framework/（示例工程的框架副本不进 git，在仓库里跑示例之前先运行它）。
// 用法：node scripts/sync-examples.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {copyFramework} from '../plugin/tools/lib/commands/init.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = path.join(root, 'examples');
for (const name of fs.readdirSync(examples)) {
  const project = path.join(examples, name);
  if (!fs.existsSync(path.join(project, '.lgui', 'project.json'))) continue;
  copyFramework(path.join(project, '.lgui', 'framework'));
  console.log(`已更新 examples/${name}/.lgui/framework/`);
}
