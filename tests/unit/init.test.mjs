import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './cli/helpers.mjs';
import {typecheckProject} from '../helpers/ts.mjs';
import {pluginVersion} from '../../plugin/tools/lib/version.mjs';

const expected = [
  'ui/UI.fairy', 'ui/assets/Common/package.xml', 'ui/assets/Common/Toast.xml', 'ui/assets/Common/Confirm.xml', 'ui/assets/Common/Loading.xml',
  'ui/assets/Common/ActionHintBar.xml', 'ui/assets/Common/RedDot.xml', 'ui/assets/Common/HoldProgress.xml', 'ui/assets/Common/ArtText.xml',
  'ui/assets/Common/placeholder.png', 'ui/assets/Main/MainView.xml', 'ui/assets/Main/MainView@portrait.xml', 'ui/art-src',
  'src/main.ts', 'src/modules/main/MainModel.ts', 'src/modules/main/MainView.ts', 'src/modules/main/MainController.ts',
  'tests/main.test.ts', 'i18n/zh-CN.json', 'i18n/en.json', '.lgui/project.json', 'package.json', 'tsconfig.json', '.gitignore',
  'AGENTS.md', 'CLAUDE.md', '.lgui/framework/index.ts', '.lgui/framework/core/index.ts', '.lgui/framework/mvc/index.ts',
  '.lgui/framework/backends/h5/vendor/fairygui.module.js', '.lgui/framework/backends/headless', '.lgui/framework/backends/unity/adapter',
  '.lgui/build/types/index.d.ts', '.lgui/build/types/Main.d.ts', '.lgui/build/headless/Common.json'
];

test('lgui init 生成完整工程，类型检查通过；再 init 同一个目录报 LGUI-CLI-010', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-init-'));
  const result = await run(['init', 'my-game', '--name', '我的 "游戏"', '--json'], parent);
  const json = JSON.parse(result.stdout);
  assert.equal(json.ok, true, result.stdout);
  const root = path.join(parent, 'my-game');
  for (const file of expected) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.equal(fs.existsSync(path.join(root, '.lgui/framework/backends/unity/package')), false, 'Unity 包模板不复制进工程');
  const project = JSON.parse(fs.readFileSync(path.join(root, '.lgui/project.json'), 'utf8'));
  assert.equal(project.name, '我的 "游戏"');
  assert.equal(project.lguiVersion, pluginVersion());
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name, '我的 "游戏"');
  assert.deepEqual(typecheckProject(root), []);
  const again = JSON.parse((await run(['init', 'my-game', '--json'], parent)).stdout);
  assert.equal(again.errors[0].code, 'LGUI-CLI-010');
});

test('不写 --name 时用目录名；不写目录时用当前目录', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-init-cwd-'));
  const result = await run(['init'], dir);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, '.lgui/project.json'), 'utf8')).name, path.basename(dir));
  assert.match(result.stdout, /lgui dev/);
});

test('模板里的类型检查会拦住写错的绑定', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-init-bad-'));
  await run(['init', 'g'], parent);
  const view = path.join(parent, 'g/src/modules/main/MainView.ts');
  fs.writeFileSync(view, fs.readFileSync(view, 'utf8').replace('button: {', 'buton: {'));
  const errors = typecheckProject(path.join(parent, 'g'));
  assert.ok(errors.some(e => /buton/.test(e)), errors.join('\n'));
});
