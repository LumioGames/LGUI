// 部件 View（PartView）跟着所在的界面保留：旋转、换语言重建组件时还是同一个实例；列表子项里的部件照常重建。
import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';
import {writeFixture, bagPanel} from '../../helpers/fixture.mjs';

// BagPanel 再加一个按钮和一个按钮列表（按钮 Bag/Btn 里有 redDot 子组件）。
const extra = `<component id="n8" name="buyButton" src="btn00001" xy="200,50" size="160,56"><Button title="买"/></component>
    <list id="n9" name="buttons" xy="0,800" size="800,100" layout="row" defaultItem="ui://bag00001btn00001"/>`;
const setup = () => started({root: writeFixture(undefined, {landscape: bagPanel({extra}), portrait: bagPanel({size: '1080,1920', extra})})});

async function rotateAndTranslate(fw, backend, sim) {
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 200);
  await fw.lgui.setLanguage('en');
}

test('PartView 跟着所在界面保留：旋转、换语言后还是同一个实例，定时器接着走，绑定换到新组件上；界面关闭时才清理', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View, PartView, pick, listenerCount} = fw;
  const wallet = lgui.Model({gold: 7});
  const made = [];
  class CurrencyBarView extends PartView { static component = 'Common/CurrencyBar'; bind = {gold: {text: pick(wallet, s => String(s.gold))}}; constructor() { super(); made.push(this); } }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {topBar: {view: CurrencyBarView}}; }
  const view = await lgui.ui.open(BagView);
  const [part] = made;
  let ticks = 0;
  part.every(100, () => ticks++);
  await rotateAndTranslate(fw, backend, sim);
  assert.equal(view.__component.componentName, 'Bag/BagPanel@portrait');
  assert.deepEqual([made.length, part.__component === view.__component.child('topBar')], [1, true]);
  const before = ticks;
  await sim.advance(backend, 300);
  assert.ok(ticks > before, '定时器没被取消');
  wallet.set({gold: 9});
  assert.equal(view.__component.child('topBar.gold').text, '9');
  assert.equal(listenerCount(wallet), 1, '旧组件上的绑定已经解开');
  lgui.ui.close(BagView);
  assert.deepEqual([listenerCount(wallet), part.__scope.isClosed], [0, true]);
});

test('PartView 嵌套、同一个类用在两处：各自保留、各回各的位置', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View, PartView} = fw;
  const dots = [];
  const buttons = [];
  class DotView extends PartView { static component = 'Bag/RedDot'; constructor() { super(); dots.push(this); } }
  class ButtonPart extends PartView { static component = 'Bag/Btn'; bind = {redDot: {view: DotView}}; constructor() { super(); buttons.push(this); } }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {sellButton: {view: ButtonPart}, buyButton: {view: ButtonPart}}; }
  const view = await lgui.ui.open(BagView);
  await rotateAndTranslate(fw, backend, sim);
  const c = view.__component;
  assert.deepEqual([buttons.length, dots.length], [2, 2]);
  assert.deepEqual([buttons[0].__component === c.child('sellButton'), buttons[1].__component === c.child('buyButton')], [true, true]);
  assert.deepEqual([dots[0].__component === c.child('sellButton.redDot'), dots[1].__component === c.child('buyButton.redDot')], [true, true]);
  lgui.ui.close(BagView);
  assert.deepEqual([...buttons, ...dots].map(p => p.__scope.isClosed), [true, true, true, true]);
});

test('列表子项里的 PartView 跟着子项重建', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View, ItemView, PartView} = fw;
  const dots = [];
  class DotView extends PartView { static component = 'Bag/RedDot'; constructor() { super(); dots.push(this); } }
  class ButtonItem extends ItemView { static component = 'Bag/Btn'; bind = {redDot: {view: DotView}}; }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {buttons: {items: [1, 2], item: ButtonItem}}; }
  await lgui.ui.open(BagView);
  assert.equal(dots.length, 2);
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 200);
  assert.equal(dots.length, 4);
  assert.deepEqual(dots.map(p => p.__scope.isClosed), [true, true, false, false]);
  lgui.ui.close(BagView);
});
