// 拖放（游戏式）：dragData / dragIcon / drop，和测试里的 t.dragTo。用 headless 后端测。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {writeFixture} from '../../helpers/fixture.mjs';
import {headless, started} from '../../helpers/framework.mjs';

async function setup() {
  const ctx = await started();
  const {lgui, View, ItemView, pick} = ctx.fw;
  const bag = lgui.Model({items: [{id: 'a', url: 'ui://Bag/flag'}, {id: 'b', url: 'ui://Bag/flag'}, {id: 'c', url: ''}]});
  const log = [];
  // 子项的图标能拖（空格子拖不起来），也能接收（带上这一格的数据）。
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {icon: {icon: it => it.url, dragData: it => it.url ? it.id : null, drop: (id, it) => log.push(`slot ${id}→${it.id}`)}}; }
  class BagView extends View {
    static component = 'Bag/BagPanel'; static layer = 'page';
    bind = {list: {items: pick(bag, s => s.items), item: SlotView, key: it => it.id, drop: id => log.push(`list ${id}`)}, sellButton: {drop: id => log.push(`sell ${id}`)}};
  }
  return {...ctx, bag, log, SlotView, BagView};
}

const ghostOf = backend => backend.root.child('lgui-drag');

test('拖到写了 drop 的控件上：调用 drop(data)；拖起时有跟手的图标，松手就去掉；原来的控件不动', async () => {
  const {fw, backend, sim, log, BagView} = await setup();
  const view = await fw.lgui.ui.open(BagView);
  const icon = view.__component.child('list').itemAt(0).child('icon');
  const before = {...icon.rect};
  await sim.dragTo(backend, icon, view.__component.child('sellButton'));
  assert.deepEqual(log, ['sell a']);
  assert.equal(ghostOf(backend), null);
  assert.deepEqual(icon.rect, before);
});

test('跟手的图标：放在最上面、不接收输入，跟着指针走；默认用加载器自己的图片', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View, ItemView} = fw;
  const seen = [];
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {icon: {icon: 'ui://Bag/flag', dragData: 'x', drag: g => { const ghost = ghostOf(backend); if (g.phase === 'move' && ghost) seen.push({last: backend.root.childNames().at(-1), touchable: ghost.touchable, x: ghost.rect.x, url: ghost.children[0].url}); }}}; }
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {list: {items: [1], item: SlotView}}; }
  const view = await lgui.ui.open(BagView);
  await sim.drag(backend, view.__component.child('list').itemAt(0).child('icon'), 100, 0);
  assert.ok(seen.length > 2);
  assert.deepEqual([seen[0].last, seen[0].touchable, seen[0].url], ['lgui-drag', false, 'ui://Bag/flag']);
  assert.ok(seen.at(-1).x > seen[0].x, '跟着指针走');
  assert.equal(ghostOf(backend), null);
});

test('松在别处、松在没写 drop 的控件上：什么也不改；dragData 是 null 的拖不起来', async () => {
  const {fw, backend, sim, log, BagView} = await setup();
  const view = await fw.lgui.ui.open(BagView);
  const c = view.__component;
  await sim.dragTo(backend, c.child('list').itemAt(0).child('icon'), c.child('header'));
  assert.deepEqual(log, []);
  let ghost = false;
  const stop = backend.state.handlers.frame.add(() => { if (ghostOf(backend)) ghost = true; });
  await sim.dragTo(backend, c.child('list').itemAt(2).child('icon'), c.child('sellButton'));
  stop();
  assert.deepEqual([log, ghost], [[], false]);
});

test('ItemView 里的 drop 带上这一格的数据；落点重叠时取最里面的（格子在列表里面）', async () => {
  const {fw, backend, sim, log, BagView} = await setup();
  const view = await fw.lgui.ui.open(BagView);
  const list = view.__component.child('list');
  await sim.dragTo(backend, list.itemAt(0).child('icon'), list.itemAt(1).child('icon'));
  await sim.dragTo(backend, list.itemAt(1).child('icon'), list.itemAt(2));
  assert.deepEqual(log, ['slot a→b', 'list b']);
});

test('dragIcon：写了就用它；按钮默认用自己的图标；既不是加载器也不是按钮又没写 dragIcon → LGUI-RT-220；写了 dragIcon 没写 dragData → LGUI-RT-221', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View} = fw;
  const urls = [];
  const watchGhost = () => backend.state.handlers.frame.add(() => { const g = ghostOf(backend); if (g) urls.push(g.children[0].url); });
  class IconView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {sellButton: {icon: 'ui://Bag/flag', dragData: 1}, header: {dragData: 2, dragIcon: 'ui://Bag/flag@en'}}; }
  const view = await lgui.ui.open(IconView);
  const stop = watchGhost();
  await sim.drag(backend, view.__component.child('sellButton'), 0, 100);
  await sim.drag(backend, view.__component.child('header'), 0, 100);
  stop();
  assert.deepEqual([...new Set(urls)], ['ui://Bag/flag', 'ui://Bag/flag@en']);
  const {fw: fw2, backend: b2} = await headless();
  await b2.loadPackage('Common');
  await b2.loadPackage('Bag');
  const mount = bind => { class V extends fw2.View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = bind; } new V().__mount(b2.create('Bag', 'BagPanel')); };
  assert.throws(() => mount({header: {dragData: 1}}), /LGUI-RT-220/);
  assert.throws(() => mount({sellButton: {dragIcon: 'ui://Bag/flag'}}), /LGUI-RT-221/);
});

test('只认激活界面里的落点：拖的时候弹出别的界面，松手什么也不改；界面关了图标也去掉', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View} = fw;
  const log = [];
  class PopupView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  let opened = false;
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {sellButton: {icon: 'ui://Bag/flag', dragData: 1, drop: d => log.push(d), drag: () => { if (!opened) { opened = true; void lgui.ui.open(PopupView); } }}}; }
  const view = await lgui.ui.open(BagView);
  await sim.drag(backend, view.__component.child('sellButton'), 0, 30);
  assert.deepEqual([lgui.ui.isOpen(PopupView), log, ghostOf(backend)], [true, [], null]);
  lgui.ui.close(PopupView);
  let closed = false;
  class GoneView extends View { static component = 'Bag/BagPanel'; static layer = 'popup'; bind = {sellButton: {icon: 'ui://Bag/flag', dragData: 1, drag: g => { if (g.phase === 'move' && !closed) { closed = true; lgui.ui.close(GoneView); } }}}; }
  const gone = await lgui.ui.open(GoneView);
  await sim.drag(backend, gone.__component.child('sellButton'), 0, 100);
  assert.deepEqual([closed, ghostOf(backend)], [true, null]);
});

test('lgui.testing：t.dragTo(从哪, 到哪)', async () => {
  const root = writeFixture();
  const {fw, deps} = await headless({root});
  const {lgui, View, ItemView, pick} = fw;
  const dir = path.join(root, '.lgui/build/headless');
  const packages = fs.readdirSync(dir).map(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
  globalThis.__lguiTest = {createBackend: () => fw.createHeadlessBackend(packages), sim: fw.sim, deps, config: fw.defaultConfig, texts: {}, current: null};
  try {
    const bag = lgui.Model({items: ['a', 'b'], sold: []});
    class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {icon: {icon: 'ui://Bag/flag', dragData: it => it}}; }
    class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; bind = {list: {items: pick(bag, s => s.items), item: SlotView}, sellButton: {drop: id => bag.set({items: bag.get().items.filter(x => x !== id), sold: [...bag.get().sold, id]})}}; }
    const t = await lgui.testing.start({backend: 'headless', start() {}});
    await t.open(BagView);
    await t.dragTo('Bag/BagPanel.list[1].icon', 'Bag/BagPanel.sellButton');
    assert.deepEqual([bag.get().sold, t.items('Bag/BagPanel.list')], [['b'], 1]);
    await t.dragTo('Bag/BagPanel.list[0].icon', 'Bag/BagPanel.header');
    assert.deepEqual(bag.get().sold, ['b']);
    t.end();
  } finally {
    delete globalThis.__lguiTest;
  }
});
