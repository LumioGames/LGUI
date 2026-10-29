import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

test('反复开关 200 次：包引用数、监听数、定时器数都回到 0', async () => {
  const {fw, ui} = await started();
  const {lgui, View, pick, listenerCount} = fw;
  const bag = lgui.Model({gold: 1});
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {gold: {text: pick(bag, s => String(s.gold))}}; onOpen() { this.every(100, () => {}); } }
  class DetailView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  for (let i = 0; i < 200; i++) {
    await lgui.ui.open(BagView);
    await lgui.ui.open(DetailView);
    lgui.ui.close(DetailView);
    lgui.ui.close(BagView);
  }
  const snap = lgui.debug.snapshot();
  assert.deepEqual([snap.packages, snap.views, listenerCount(bag), ui.cachedCount()], [[], [], 0, 0]);
});

test('界面缓存 keepClosedViews：最近关掉的 N 个界面不销毁，再打开时直接复用；超出的销毁并释放资源', async () => {
  const {fw, ui} = await started({config: {uiCache: {keepClosedViews: 2}}});
  const {lgui, View} = fw;
  const make = (name, component) => ({[name]: class extends View { static component = component; static layer = 'popup'; }})[name];
  const A = make('A', 'Bag/ItemSlot'), B = make('B', 'Bag/Header'), C = make('C', 'Common/CurrencyBar');
  const a1 = await lgui.ui.open(A);
  const componentA = a1.__component;
  lgui.ui.close(A);
  assert.equal(ui.cachedCount(), 1);
  assert.deepEqual(lgui.debug.snapshot().packages.map(p => `${p.name}:${p.refs}`).sort(), ['Bag:1', 'Common:1'], '缓存着的组件还占着包');
  const a2 = await lgui.ui.open(A);
  assert.notEqual(a2, a1, 'View 实例是新的');
  assert.equal(a2.__component, componentA, '组件直接复用');
  lgui.ui.close(A);
  for (const V of [B, C]) { await lgui.ui.open(V); lgui.ui.close(V); }
  assert.equal(ui.cachedCount(), 2, '超出 2 个，最早关掉的 A 被销毁');
  const a3 = await lgui.ui.open(A);
  assert.notEqual(a3.__component, componentA);
  lgui.ui.close(A);
  ui.clearCache();
  assert.deepEqual([ui.cachedCount(), lgui.debug.snapshot().packages], [0, []]);
});
