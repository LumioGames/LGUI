import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './cli/helpers.mjs';
import {mp3} from '../helpers/fixture.mjs';

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

test('lgui test：测试文件一加载就出错（顶层抛错）也算失败，退出码 1，失败项是这个文件', async () => {
  const root = await project();
  fs.writeFileSync(path.join(root, 'tests/crash.test.ts'), `throw new Error('加载时出错');\n`);
  const result = await run(['test', '--json'], root);
  const json = JSON.parse(result.stdout);
  assert.equal(result.code, 1);
  assert.equal(json.ok, false);
  assert.equal(json.data.passed, 1);
  assert.deepEqual(json.data.failed.map(f => f.name), ['tests/crash.test.ts']);
  assert.equal(json.errors[0].code, 'LGUI-CLI-041');
});

test('lgui test：t.sounds() 是放过的音效，t.music() 是正在放的背景音乐；记了 error 级日志的测试判失败（LGUI-RT-176），warn 不算', async () => {
  const root = await project();
  const common = path.join(root, 'ui/assets/Common');
  fs.writeFileSync(path.join(common, 'click.mp3'), mp3());
  fs.writeFileSync(path.join(common, 'bgm.mp3'), mp3(40));
  const pkg = path.join(common, 'package.xml');
  fs.writeFileSync(pkg, fs.readFileSync(pkg, 'utf8').replace('</resources>', '  <sound id="click001" name="click.mp3" path="/" exported="true"/>\n    <sound id="bgm00001" name="bgm.mp3" path="/" exported="true"/>\n  </resources>'));
  const view = path.join(root, 'src/modules/main/MainView.ts');
  fs.writeFileSync(view, fs.readFileSync(view, 'utf8').replace('static fullScreen = true;', "static fullScreen = true;\n  static music = 'ui://Common/bgm';"));
  fs.writeFileSync(path.join(root, 'tests/sound.test.ts'), `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';

test('声音', async () => {
  const t = await lgui.testing.start(app);
  assert.equal(t.music(), 'ui://Common/bgm');
  lgui.sound.play('ui://Common/click', { volume: 0.5 });
  assert.deepEqual(t.sounds(), [{ url: 'ui://Common/click', volume: 0.5 }]);
  lgui.log.warn('slow_network', { ms: 900 });
  t.end();
  await t.advance(16);
  assert.equal(t.music(), null);
});

test('记了 error', async () => {
  const t = await lgui.testing.start(app);
  lgui.log.error('save_failed', new Error('磁盘满'));
  await t.advance(16);
});

test('最后才记 error', async () => {
  await lgui.testing.start(app);
  lgui.log.error('late_failure');
});
`);
  const result = await run(['test'], root);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /通过 2，失败 2/, result.stdout);
  assert.match(result.stdout, /失败：记了 error/);
  assert.match(result.stdout, /失败：最后才记 error/);
  assert.match(result.stdout, /LGUI-RT-176[^\n]*save_failed/);
});
