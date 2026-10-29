// lgui.testing 的测试对象：t.end() 的泄漏检查、t.setSafeArea。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {headless} from '../../helpers/framework.mjs';
import {writeFixture, bagPanel} from '../../helpers/fixture.mjs';

// 像 lgui test 生成的 env.ts 一样注入测试环境，再用 lgui.testing.start 启动。
async function start(root, app) {
  const {fw, deps} = await headless({root});
  const dir = path.join(root, '.lgui/build/headless');
  const packages = fs.readdirSync(dir).map(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
  globalThis.__lguiTest = {createBackend: () => fw.createHeadlessBackend(packages), sim: fw.sim, deps, config: {...fw.defaultConfig, name: 'test'}, texts: {'zh-CN': {'bag.bye': '再见'}}, current: null};
  return {fw, t: await fw.lgui.testing.start(app ?? {backend: 'headless', start() {}})};
}

test('t.end()：界面的 onClose 里弹 toast 不算泄漏', async () => {
  const {fw, t} = await start(writeFixture());
  const {lgui, View} = fw;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; static bothOrientations = true; onClose() { lgui.toast('bag.bye'); } }
  await t.open(BagView);
  t.end();
  assert.deepEqual(t.snapshot().layers.toast, []);
});

test('t.setSafeArea：模拟刘海，safe 子控件跟着摆进安全区', async () => {
  const safe = '<graph id="n9" name="safe" xy="0,0" size="1920,1080" type="rect" lineSize="0"/>';
  const {fw, t} = await start(writeFixture(undefined, {landscape: bagPanel({extra: safe}), portrait: bagPanel({size: '1080,1920', extra: safe})}));
  const {View} = fw;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; }
  const bag = await t.open(BagView);
  await t.setSafeArea({top: 0, right: 47, bottom: 21, left: 47});
  assert.deepEqual(bag.__component.child('safe').rect, {x: 47, y: 0, width: 1826, height: 1059});
  t.end();
});
