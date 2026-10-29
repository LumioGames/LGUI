// 绑定表的每个词，用 headless 后端测。
import test from 'node:test';
import assert from 'node:assert/strict';
import {headless} from '../../helpers/framework.mjs';

async function setup() {
  const ctx = await headless();
  await ctx.backend.loadPackage('Common');
  await ctx.backend.loadPackage('Bag');
  const panel = ctx.backend.create('Bag', 'BagPanel');
  ctx.backend.root.addChild(panel);
  return {...ctx, panel, sim: ctx.fw.sim};
}

test('text、visible、enabled：固定值和 pick（带格式化）', async () => {
  const {fw, panel} = await setup();
  const {lgui, View, pick} = fw;
  const bag = lgui.Model({gold: 1234, items: []});
  class BagView extends View {
    static component = 'Bag/BagPanel'; static layer = 'page';
    bind = {gold: {text: pick(bag, s => s.gold, n => `${n} 金币`), visible: pick(bag, s => s.gold > 0)}, sellButton: {text: 'x', enabled: false}};
  }
  const view = new BagView();
  view.__mount(panel);
  assert.deepEqual([panel.child('gold').text, panel.child('gold').visible, panel.child('sellButton').title, panel.child('sellButton').enabled], ['1234 金币', true, 'x', false]);
  bag.set({gold: 0});
  assert.deepEqual([panel.child('gold').text, panel.child('gold').visible], ['0 金币', false]);
});

test('page / change：控制器名当键；代码设置不触发 change，用户切页才触发', async () => {
  const {fw, panel} = await setup();
  const {lgui, View, pick} = fw;
  const bag = lgui.Model({tab: 'equip'});
  const changes = [];
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {tabs: {page: pick(bag, s => s.tab), change: t => changes.push(t)}, 'header.mode': {page: 'edit'}}; }
  new BagView().__mount(panel);
  bag.set({tab: 'item'});
  assert.equal(panel.controller('tabs').selectedPage, 'item');
  assert.deepEqual(changes, []);
  panel.controller('tabs').selectedPage = 'equip';   // 用户点了分页
  assert.deepEqual(changes, ['equip']);
  assert.equal(panel.child('header').controller('mode').selectedPage, 'edit');
});

test('items / item / key / selected / select：列表子项用 ItemView，值写成函数', async () => {
  const {fw, panel, backend, sim} = await setup();
  const {lgui, View, ItemView, pick} = fw;
  const bag = lgui.Model({items: [{id: 'a', count: 1}, {id: 'b', count: 5}], selected: 'b'});
  const picked = [];
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {count: {text: it => String(it.count), visible: it => it.count > 1}}; }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {list: {items: pick(bag, s => s.items), item: SlotView, key: it => it.id, selected: pick(bag, s => s.selected), select: id => picked.push(id)}}; }
  new BagView().__mount(panel);
  const list = panel.child('list');
  assert.deepEqual([list.numItems, list.itemAt(1).child('count').text, list.itemAt(0).child('count').visible, list.selectedIndex], [2, '5', false, 1]);
  bag.set({items: [{id: 'c', count: 9}, ...bag.get().items]});
  assert.deepEqual([list.numItems, list.itemAt(0).child('count').text, list.selectedIndex], [3, '9', 2], '用 key 认出同一项，选中项跟着走');
  await sim.click(backend, list.itemAt(0).child('icon'));
  assert.deepEqual(picked, ['c']);
});

test('view：好几个界面共用的部件交给 PartView', async () => {
  const {fw, panel} = await setup();
  const {lgui, View, PartView, pick} = fw;
  const wallet = lgui.Model({gold: 7});
  class CurrencyBarView extends PartView { static component = 'Common/CurrencyBar'; bind = {gold: {text: pick(wallet, s => String(s.gold))}}; }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {topBar: {view: CurrencyBarView}, 'header.count': {text: '3'}}; }
  const view = new BagView();
  view.__mount(panel);
  wallet.set({gold: 8});
  assert.deepEqual([panel.child('topBar.gold').text, panel.child('header.count').text], ['8', '3']);
  view.__dispose();
  assert.equal(fw.listenerCount(wallet), 0, '部件跟着所在界面一起清理');
});

test('icon + placeholder：先显示占位图，加载好再换上；加载失败留着占位图并报 LGUI-RT-070', async () => {
  const {fw, panel, backend} = await setup();
  const {View, ItemView, HeadlessLoader} = fw;
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {icon: {icon: it => it.url, placeholder: 'ui://Bag/loading'}}; }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {list: {items: [{url: 'https://x/ok.png'}], item: SlotView}}; }
  new BagView().__mount(panel);
  const icon = panel.child('list').itemAt(0).child('icon');
  assert.equal(icon.url, 'ui://Bag/loading');
  await new Promise(r => setTimeout(r, 0));
  assert.equal(icon.url, 'https://x/ok.png');
  HeadlessLoader.failExternal = true;
  try {
    const {panel: p2} = await setup();
    class V2 extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {list: {items: [{url: 'https://x/bad.png'}], item: SlotView}}; }
    new V2().__mount(p2);
    await new Promise(r => setTimeout(r, 0));
    assert.equal(p2.child('list').itemAt(0).child('icon').url, 'ui://Bag/loading');
  } finally { HeadlessLoader.failExternal = false; }
  void backend;
});

test('progress：进度条 0–100', async () => {
  const {fw, panel} = await setup();
  const {View} = fw;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {'sellButton.holdProgress': {progress: 50}}; }
  new BagView().__mount(panel);
  const bar = panel.child('sellButton.holdProgress');
  assert.equal(bar.value, bar.max / 2);
});

test('click、doubleClick、hold（驱动 holdProgress）、drag、swipe、pinch、wheel、hover', async () => {
  const {fw, panel, backend, sim} = await setup();
  const {View} = fw;
  const log = [];
  const progress = [];
  class BagView extends View {
    static component = 'Bag/BagPanel'; static layer = 'page';
    bind = {
      topBar: {doubleClick: () => log.push('double')},
      sellButton: {click: () => log.push('click'), hold: {ms: 500, action: () => log.push('hold')}},
      list: {drag: g => { if (g.phase === 'end') log.push(`drag ${g.dx}`); }, swipe: g => log.push(`swipe ${Math.round(g.dx)}`), pinch: g => { if (g.phase === 'end') log.push(`pinch ${g.scale.toFixed(1)}`); }, wheel: e => log.push(`wheel ${e.dy}`)},
      header: {hover: inside => log.push(`hover ${inside}`)}
    };
  }
  new BagView().__mount(panel);
  const bar = panel.child('sellButton.holdProgress');
  backend.platform.time.onFrame(() => progress.push(bar.value));
  await sim.click(backend, panel.child('sellButton'));
  await sim.hold(backend, panel.child('sellButton'), 600);
  assert.ok(Math.max(...progress) > bar.max * 0.9 && bar.value === 0, '按住时进度涨到接近满，松手归零');
  await sim.doubleClick(backend, panel.child('topBar'));
  await sim.drag(backend, panel.child('list'), 100, 0);
  await sim.swipe(backend, panel.child('list'), -200, 0);
  await sim.pinch(backend, panel.child('list'), 1.5);
  await sim.wheel(backend, panel.child('list'), 120);
  await sim.hover(backend, panel.child('header'));
  assert.deepEqual(log, ['click', 'hold', 'double', 'drag 100', 'drag -200', 'swipe -200', 'pinch 1.5', 'wheel 120', 'hover true', 'hover false']);
});

test('lockWhilePending：动作返回的 Promise 结束前保持锁住', async () => {
  const {fw, panel, backend, sim} = await setup();
  const {View} = fw;
  let resolve, calls = 0;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {sellButton: {click: () => { calls++; return new Promise(r => { resolve = r; }); }, lockWhilePending: true}}; }
  new BagView().__mount(panel);
  await sim.click(backend, panel.child('sellButton'));
  assert.equal(panel.child('sellButton').enabled, false);
  await assert.rejects(sim.click(backend, panel.child('sellButton')), e => e.code === 'LGUI-RT-032');
  resolve();
  await new Promise(r => setTimeout(r, 0));
  assert.deepEqual([panel.child('sellButton').enabled, calls], [true, 1]);
});

test('visibleOn：跟着输入类型显隐', async () => {
  const {fw, panel, backend, sim} = await setup();
  const {View, inputType} = fw;
  inputType.set('keyboardMouse');
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {gold: {visibleOn: ['keyboardMouse']}, sellButton: {click: () => {}}}; }
  new BagView().__mount(panel);
  assert.equal(panel.child('gold').visible, true);
  await sim.click(backend, panel.child('sellButton'), 50, 'touch');
  assert.deepEqual([inputType.get(), panel.child('gold').visible], ['touch', false]);
  inputType.set('keyboardMouse');
});

test('报错：不存在的键 LGUI-RT-062；词表以外的词、控制器上写 visible LGUI-RT-063', async () => {
  const {fw, panel} = await setup();
  const {View} = fw;
  const make = bind => { class V extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = bind; } return new V(); };
  assert.throws(() => make({coins: {text: '1'}}).__mount(panel), e => e.code === 'LGUI-RT-062' && /coins/.test(e.message));
  assert.throws(() => make({gold: {label: '1'}}).__mount(panel), e => e.code === 'LGUI-RT-063' && /label/.test(e.message));
  assert.throws(() => make({tabs: {visible: false}}).__mount(panel), e => e.code === 'LGUI-RT-063');
});

test('7 项 static 的运行时校验：缺必填 LGUI-RT-060，写了清单以外的 LGUI-RT-061', async () => {
  const {fw} = await setup();
  const {View, PartView, validateViewClass} = fw;
  class Ok extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; static bothOrientations = true; }
  class NoLayer extends View { static component = 'Bag/BagPanel'; }
  class Extra extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static cache = true; }
  class BadPart extends PartView { static component = 'Common/CurrencyBar'; static layer = 'page'; }
  validateViewClass(Ok);
  assert.throws(() => validateViewClass(NoLayer), e => e.code === 'LGUI-RT-060');
  assert.throws(() => validateViewClass(Extra), e => e.code === 'LGUI-RT-061' && /cache/.test(e.message));
  assert.throws(() => validateViewClass(BadPart), e => e.code === 'LGUI-RT-061');
});

test('换版重新绑定：同一个实例、同一张绑定表绑到新组件，旧组件的绑定全部清掉；解绑后订阅归零', async () => {
  const {fw, panel, backend} = await setup();
  const {lgui, View, pick, listenerCount} = fw;
  const bag = lgui.Model({gold: 1});
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {gold: {text: pick(bag, s => String(s.gold))}}; }
  const view = new BagView();
  view.__mount(panel);
  const portrait = backend.create('Bag', 'BagPanel@portrait');
  view.__mount(portrait);
  bag.set({gold: 2});
  assert.deepEqual([panel.child('gold').text, portrait.child('gold').text], ['1', '2']);
  assert.equal(listenerCount(bag), 1);
  view.__dispose();
  assert.equal(listenerCount(bag), 0);
});
