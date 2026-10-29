import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './cli/helpers.mjs';

async function project() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-test-cmd-'));
  const r = await run(['init', 'game'], parent);
  assert.equal(r.code, 0, r.stderr);
  return path.join(parent, 'game');
}

test('lgui test：新建工程自带的测试能跑通（headless、打开主界面、点按钮、读文字）', async () => {
  const root = await project();
  const result = await run(['test', '--json'], root);
  const json = JSON.parse(result.stdout);
  assert.equal(json.ok, true, JSON.stringify(json.errors) + result.stderr);
  assert.deepEqual([json.data.passed, json.data.failed, json.data.files], [1, [], ['tests/main.test.ts']]);
});

test('lgui test：失败时退出码 1，报 LGUI-CLI-041 并附上测试结束时的界面快照', async () => {
  const root = await project();
  fs.writeFileSync(path.join(root, 'tests/broken.test.ts'), `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';

test('故意失败', async () => {
  const t = await lgui.testing.start(app);
  await t.click('Main/MainView.button');
  assert.equal(t.text('Main/MainView.status'), '不会是这个');
});
`);
  const result = await run(['test'], root);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /通过 1，失败 1/);
  assert.match(result.stderr, /LGUI-CLI-041  测试没通过：故意失败。测试结束时的界面状态：\{"layers":\{"hud":\[\],"page":\["MainView"\]/);
});

test('lgui test：路径写错报 LGUI-RT-111；没有测试文件报 LGUI-CLI-040', async () => {
  const root = await project();
  fs.writeFileSync(path.join(root, 'tests/main.test.ts'), `import { test } from 'node:test';
import { lgui } from 'lgui';
import app from '../src/main';
test('路径写错', async () => { const t = await lgui.testing.start(app); t.text('Main/MainView.nope'); });
`);
  const result = await run(['test'], root);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /LGUI-RT-111/);
  fs.rmSync(path.join(root, 'tests'), {recursive: true});
  const empty = JSON.parse((await run(['test', '--json'], root)).stdout);
  assert.equal(empty.errors[0].code, 'LGUI-CLI-040');
});
