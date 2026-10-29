import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

test('lgui.debug.snapshot()：结构和数字', async () => {
  const {fw, backend} = await started();
  const {lgui, View, pick} = fw;
  const bag = lgui.Model({gold: 1});
  class MainView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {gold: {text: pick(bag, s => String(s.gold))}}; onOpen() { this.every(1000, () => {}); } }
  class DetailView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  await lgui.ui.open(MainView);
  await lgui.ui.open(DetailView);
  const snap = lgui.debug.snapshot();
  assert.deepEqual(Object.keys(snap).sort(), ['active', 'inputType', 'language', 'layers', 'orientation', 'packages', 'views']);
  assert.deepEqual(snap.layers, {hud: [], page: ['MainView'], popup: ['DetailView'], modal: [], toast: []});
  assert.equal(snap.active, 'DetailView');
  const main = snap.views.find(v => v.name === 'MainView');
  assert.equal(main.timers, 1);
  assert.ok(main.listeners >= 2, '绑定的订阅 + 定时器的每帧回调');
  assert.deepEqual(snap.packages.map(p => `${p.name}:${p.refs}`).sort(), ['Bag:2', 'Common:2']);
  assert.equal(snap.orientation, 'landscape');
  assert.equal(snap.inputType, 'keyboardMouse');
  lgui.ui.closeAll('popup');
  lgui.ui.closeAll('page');
  assert.deepEqual(lgui.debug.snapshot().packages, []);
  void backend;
});

test('lgui.ui.find：控件在设计尺寸下的位置和大小（只读）；isOpen、get、top、list', async () => {
  const {fw} = await started();
  const {lgui, View} = fw;
  class MainView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; }
  const main = await lgui.ui.open(MainView);
  assert.deepEqual(lgui.ui.find('Bag/BagPanel.sellButton'), {x: 0, y: 50, width: 160, height: 56});
  assert.deepEqual(lgui.ui.find('Bag/BagPanel.sellButton.holdProgress'), {x: 0, y: 100, width: 160, height: 6});
  assert.equal(lgui.ui.find('Bag/BagPanel.nope'), null);
  assert.equal(lgui.ui.find('Shop/ShopPanel.buy'), null);
  assert.deepEqual([lgui.ui.isOpen(MainView), lgui.ui.get(MainView), lgui.ui.top('page'), lgui.ui.list('page')], [true, main, main, [main]]);
});
