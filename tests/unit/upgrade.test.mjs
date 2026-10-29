import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './cli/helpers.mjs';
import {changesBetween} from '../../plugin/tools/lib/commands/upgrade.mjs';
import {pluginVersion} from '../../plugin/tools/lib/version.mjs';

test('旧版本的工程：命令报 LGUI-CLI-003；lgui upgrade 之后就通过', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-upgrade-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const file = path.join(root, '.lgui/project.json');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(`"lguiVersion": "${pluginVersion()}"`, '"lguiVersion": "0.2.9"'));
  fs.writeFileSync(path.join(root, '.lgui/framework/stale.ts'), '// 旧版本留下的文件\n');
  const before = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(before.errors[0].code, 'LGUI-CLI-003');
  assert.match(before.errors[0].message, /工程里的框架是 0\.2\.9，插件是 .*，请先运行 lgui upgrade。/);
  const up = JSON.parse((await run(['upgrade', '--json'], root)).stdout);
  assert.equal(up.ok, true);
  assert.deepEqual([up.data.from, up.data.to], ['0.2.9', pluginVersion()]);
  assert.ok(up.data.changes.some(c => c.startsWith(`## ${pluginVersion()}`)), 'CHANGELOG 里跨过的版本');
  assert.equal(fs.existsSync(path.join(root, '.lgui/framework/stale.ts')), false, '整个替换');
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).name, 'g', '其他字段保留');
  const after = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(after.ok, true, JSON.stringify(after.errors));
  const again = JSON.parse((await run(['upgrade', '--json'], root)).stdout);
  assert.equal(again.data.upgraded, false);
});

test('CHANGELOG：只取跨过的版本', () => {
  const log = '# 更新记录\n\n## 0.5.0\n\n- e\n\n## 0.4.0（未发布）\n\n- d\n\n## 0.3.0\n\n- c\n';
  assert.deepEqual(changesBetween(log, '0.3.0', '0.5.0').map(s => s.split('\n')[0]), ['## 0.5.0', '## 0.4.0（未发布）']);
});
