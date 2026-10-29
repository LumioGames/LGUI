// UIManager：方案 5.10 的每条规则，用 headless 后端测。
import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

// 用测试界面里的组件定义几种 View。
async function setup() {
  const ctx = await started();
  const {View} = ctx.fw;
  const log = [];
  const hooks = name => class extends View {
    onOpen(p) { log.push(`${name}.onOpen${p ? ' ' + JSON.stringify(p) : ''}`); }
    onActivate() { log.push(`${name}.onActivate`); }
    onDeactivate() { log.push(`${name}.onDeactivate`); }
    onCovered() { log.push(`${name}.onCovered`); }
    onRevealed() { log.push(`${name}.onRevealed`); }
    onClose() { log.push(`${name}.onClose`); }
  };
  class MainView extends hooks('Main') { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; }
  class BagView extends hooks('Bag') { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; static params = {tab: 'equip'}; }
  class HudView extends hooks('Hud') { static component = 'Common/CurrencyBar'; static layer = 'hud'; }
  class DetailView extends hooks('Detail') { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  class PickerView extends hooks('Picker') { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  class Reward1 extends hooks('Reward1') { static component = 'Common/CurrencyBar'; static layer = 'modal'; }
  class Reward2 extends hooks('Reward2') { static component = 'Bag/ItemSlot'; static layer = 'modal'; }
  class ToastView extends hooks('Toast') { static component = 'Bag/Header'; static layer = 'toast'; }
  return {...ctx, log, views: {MainView, BagView, HudView, DetailView, PickerView, Reward1, Reward2, ToastView}};
}

test('5 个容器按 hud → page → popup → modal → toast 叠在根节点下', async () => {
  const {backend} = await setup();
  assert.deepEqual(backend.root.childNames(), ['hud', 'page', 'popup', 'modal', 'toast']);
});

test('钩子顺序：打开 onOpen → onActivate；被压住 onDeactivate；关闭 onDeactivate → onClose', async () => {
  const {fw, log, views: {MainView, DetailView}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(MainView);
  await lgui.ui.open(DetailView, {id: 1});
  lgui.ui.close(DetailView);
  assert.deepEqual(log, ['Main.onOpen', 'Main.onActivate', 'Detail.onOpen {"id":1}', 'Main.onDeactivate', 'Detail.onActivate', 'Detail.onDeactivate', 'Detail.onClose', 'Main.onActivate']);
});

test('激活：所有层合起来最上面那个可交互；其余停用（不可点但看得见）', async () => {
  const {fw, views: {MainView, HudView, DetailView, ToastView}} = await setup();
  const {lgui} = fw;
  const hud = await lgui.ui.open(HudView);
  const main = await lgui.ui.open(MainView);
  const detail = await lgui.ui.open(DetailView);
  await lgui.ui.open(ToastView);
  assert.equal(lgui.ui.top(), detail, 'toast 不参与激活');
  assert.deepEqual([main.__component.touchable, main.__component.visible, detail.__component.touchable], [false, true, true]);
  assert.equal(hud.__component.visible, false, '全屏界面盖住了下面层的 hud');
});

test('全屏界面盖住下面所有层：隐藏、暂停定时器、onCovered；关掉后露出来、onRevealed（关掉全屏界面，上一个自动回来）', async () => {
  const {fw, backend, sim, log, views: {MainView, BagView, HudView}} = await setup();
  const {lgui} = fw;
  const hud = await lgui.ui.open(HudView);
  const main = await lgui.ui.open(MainView);
  let ticks = 0;
  hud.__timers.every(100, () => ticks++);
  log.length = 0;
  await lgui.ui.open(BagView);
  assert.deepEqual([main.__component.visible, log.includes('Main.onCovered')], [false, true]);
  await sim.advance(backend, 500);
  assert.equal(ticks, 0, 'hud 被盖住时定时器暂停');
  lgui.ui.close(BagView);
  assert.deepEqual([main.__component.visible, lgui.ui.top(), log.includes('Main.onRevealed')], [true, main, true]);
  assert.equal(hud.__component.visible, false, 'Main 也是全屏，hud 还被它盖着');
});

test('modal 是队列：同时只显示一个，前一个关掉下一个才弹出来；modal 打开时下面全部停用', async () => {
  const {fw, views: {MainView, Reward1, Reward2}} = await setup();
  const {lgui} = fw;
  const main = await lgui.ui.open(MainView);
  const first = await lgui.ui.open(Reward1);
  let secondShown = false;
  const second = lgui.ui.open(Reward2).then(v => { secondShown = true; return v; });
  await new Promise(r => setTimeout(r, 0));
  assert.deepEqual([secondShown, lgui.ui.isOpen(Reward2), main.__component.touchable, lgui.ui.top()], [false, false, false, first]);
  lgui.ui.close(Reward1);
  const v2 = await second;
  assert.deepEqual([secondShown, lgui.ui.top()], [true, v2]);
});

test('排队中的 modal 被关掉：马上释放界面包（打开那边报 LGUI-RT-081），不会等下一帧', async () => {
  const {fw, views: {Reward1, Reward2}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(Reward1);
  const second = lgui.ui.open(Reward2);
  await new Promise(r => setTimeout(r, 0));
  const refs = () => Object.fromEntries(lgui.debug.snapshot().packages.map(p => [p.name, p.refs]));
  assert.equal(refs().Bag, 1, '排队的 Reward2 占着 Bag 包');
  lgui.ui.closeAll('modal');
  assert.equal(refs().Bag, undefined, '关掉的同时就释放了');
  await assert.rejects(second, e => e.code === 'LGUI-RT-081');
  assert.equal(refs().Bag, undefined, '不重复释放');
});

test('page 层最底下的主界面按返回键关不掉；back 关闭当前激活的界面', async () => {
  const {fw, views: {MainView, DetailView}} = await setup();
  const {lgui} = fw;
  const main = await lgui.ui.open(MainView);
  await lgui.ui.open(DetailView);
  lgui.ui.back();
  assert.equal(lgui.ui.isOpen(DetailView), false);
  lgui.ui.back();
  assert.equal(lgui.ui.top(), main);
});

test('replace、popTo、closeAll、list、get', async () => {
  const {fw, views: {MainView, BagView, DetailView, PickerView}} = await setup();
  const {lgui} = fw;
  const main = await lgui.ui.open(MainView);
  await lgui.ui.open(DetailView);
  await lgui.ui.replace(PickerView);
  assert.deepEqual(lgui.ui.list('popup').map(v => v.constructor.name), ['PickerView']);
  await lgui.ui.open(BagView);
  await lgui.ui.open(DetailView);
  lgui.ui.popTo(MainView);
  assert.deepEqual([lgui.ui.list('page'), lgui.ui.list('popup')], [[main], []]);
  await lgui.ui.open(DetailView);
  lgui.ui.closeAll('popup');
  assert.equal(lgui.ui.get(DetailView), undefined);
});

test('onClose 第 1 条：B 不管怎么关闭（自己关、返回键、closeAll、replace）都调用一次', async () => {
  const {fw, views: {MainView, DetailView, PickerView}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(MainView);
  const calls = [];
  for (const how of ['close', 'back', 'closeAll', 'replace']) {
    await lgui.ui.open(DetailView, undefined, {onClose: r => calls.push([how, r])});
    if (how === 'close') lgui.ui.close(DetailView);
    if (how === 'back') lgui.ui.back();
    if (how === 'closeAll') lgui.ui.closeAll('popup');
    if (how === 'replace') { await lgui.ui.replace(PickerView); lgui.ui.close(PickerView); }
  }
  assert.deepEqual(calls, [['close', undefined], ['back', undefined], ['closeAll', undefined], ['replace', undefined]]);
});

test('onClose 第 2 条：可以顺带交回东西；不交回时是 undefined', async () => {
  const {fw, views: {MainView, PickerView}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(MainView);
  const got = [];
  await lgui.ui.open(PickerView, undefined, {onClose: r => got.push(r)});
  lgui.ui.close(PickerView, {itemId: 'sword'});
  await lgui.ui.open(PickerView, undefined, {onClose: r => got.push(r)});
  lgui.ui.close(PickerView);
  assert.deepEqual(got, [{itemId: 'sword'}, undefined]);
});

test('onClose 第 3 条：打开者在动作或钩子里同步记下；打开者先关了，回调自动取消', async () => {
  const {fw, views: {MainView, BagView, PickerView}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(MainView);
  const got = [];
  class OpenerView extends BagView { onOpen() { lgui.ui.open(PickerView, undefined, {onClose: () => got.push('closed')}); } }
  await lgui.ui.open(OpenerView);
  await new Promise(r => setTimeout(r, 0));
  assert.equal(lgui.ui.isOpen(PickerView), true);
  lgui.ui.close(OpenerView);
  lgui.ui.close(PickerView);
  assert.deepEqual(got, []);
});

test('onClose 第 5 条和广播站：A 关闭后 B 收到 viewClosed', async () => {
  const {fw, views: {MainView, DetailView}} = await setup();
  const {lgui, View} = fw;
  const seen = [];
  class Listener extends View { static component = 'Bag/ItemSlot'; static layer = 'hud'; onOpen() { this.on(lgui.events.viewClosed, e => seen.push(e.view.name)); } }
  await lgui.ui.open(Listener);
  await lgui.ui.open(MainView);
  await lgui.ui.open(DetailView);
  lgui.ui.close(DetailView);
  assert.deepEqual(seen, ['DetailView']);
});

test('同一个界面正在打开时又被打开：合并成一次；正在打开时被关闭：取消（LGUI-RT-081），资源释放', async () => {
  const {fw, ui, views: {MainView, DetailView}} = await setup();
  const {lgui} = fw;
  await lgui.ui.open(MainView);
  const a = lgui.ui.open(DetailView), b = lgui.ui.open(DetailView);
  assert.equal(a, b);
  await a;
  lgui.ui.close(DetailView);
  const opening = lgui.ui.open(DetailView);
  lgui.ui.close(DetailView);
  await assert.rejects(opening, e => e.code === 'LGUI-RT-081');
  assert.equal(lgui.ui.isOpen(DetailView), false);
  assert.deepEqual(ui.packageRefs().map(p => `${p.name}:${p.refs}`).sort(), ['Bag:1', 'Common:1']);
});

test('加载失败报 LGUI-RT-080，不留半成品；关闭没打开的界面只记日志（LGUI-RT-082）', async () => {
  const {fw, backend, ui, views: {DetailView}} = await setup();
  const {lgui, View} = fw;
  class Broken extends View { static component = 'Nope/Missing'; static layer = 'popup'; }
  await assert.rejects(lgui.ui.open(Broken), e => e.code === 'LGUI-RT-080');
  assert.deepEqual([ui.all().length, ui.packageRefs().length], [0, 0]);
  lgui.ui.close(DetailView);
  assert.deepEqual([backend.state.logs.at(-1).level, backend.state.logs.at(-1).data.code], ['info', 'LGUI-RT-082']);
});

test('界面关闭后包引用归零、监听和定时器清干净', async () => {
  const {fw, ui, views: {MainView, DetailView}} = await setup();
  const {lgui} = fw;
  for (let i = 0; i < 20; i++) { await lgui.ui.open(MainView); await lgui.ui.open(DetailView); lgui.ui.closeAll('popup'); lgui.ui.closeAll('page'); }
  assert.deepEqual([ui.all().length, ui.packageRefs().length], [0, 0]);
});
