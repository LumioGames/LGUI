// 安全区：全屏界面铺满整个可见区域，名字叫 safe 的直接子控件摆进安全区（设计单位）；不是全屏的界面放在安全区正中。
import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';
import {writeFixture, bagPanel} from '../../helpers/fixture.mjs';

const safe = size => `<graph id="n9" name="safe" xy="0,0" size="${size}" type="rect" lineSize="0"/>`;
const setup = () => started({root: writeFixture(undefined, {landscape: bagPanel({extra: safe('1920,1080')}), portrait: bagPanel({size: '1080,1920', extra: safe('1080,1920')})})});

test('全屏界面铺满可见区域，safe 子控件摆进安全区（屏幕像素换算成设计单位）；弹窗放在安全区正中', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View} = fw;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; }
  class DetailView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  // 屏幕 960×540，缩放比 0.5：设计单位下可见区域是 1920×1080。左边刘海 60 像素、底部 20 像素。
  await sim.setScreen(backend, 960, 540);
  await sim.setSafeArea(backend, {top: 0, right: 0, bottom: 20, left: 60});
  await sim.advance(backend, 200);
  const bag = await lgui.ui.open(BagView);
  const detail = await lgui.ui.open(DetailView);
  assert.deepEqual(bag.__component.rect, {x: 0, y: 0, width: 1920, height: 1080}, '全屏界面照样铺满');
  assert.deepEqual(bag.__component.child('safe').rect, {x: 120, y: 0, width: 1800, height: 1040});
  assert.deepEqual(detail.__component.rect, {x: 956, y: 456, width: 128, height: 128}, '安全区正中');
  // 旋转：换竖版，按新的安全区重新摆。
  await sim.setSafeArea(backend, {top: 30, right: 0, bottom: 20, left: 0});
  await sim.setScreen(backend, 540, 960);
  await sim.advance(backend, 200);
  assert.equal(bag.__component.componentName, 'Bag/BagPanel@portrait');
  assert.deepEqual(bag.__component.child('safe').rect, {x: 0, y: 60, width: 1080, height: 1820});
  assert.deepEqual(detail.__component.rect, {x: 476, y: 906, width: 128, height: 128});
  // 只换安全区（没换方向）也重新摆。
  await sim.setSafeArea(backend, {top: 0, right: 0, bottom: 0, left: 0});
  await sim.advance(backend, 200);
  assert.deepEqual(bag.__component.child('safe').rect, {x: 0, y: 0, width: 1080, height: 1920});
});

test('全屏界面没有 safe 子控件也能打开（lgui check 会报出来）', async () => {
  const {fw, backend, sim} = await started();
  const {lgui, View} = fw;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; }
  await sim.setSafeArea(backend, {top: 10, right: 10, bottom: 10, left: 10});
  await sim.advance(backend, 200);
  const bag = await lgui.ui.open(BagView);
  assert.deepEqual(bag.__component.rect, {x: 0, y: 0, width: 1920, height: 1080});
});
