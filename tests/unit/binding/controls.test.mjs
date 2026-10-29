// 绑定表的新词和新控件：滚轮只认落在控件上的事件、输入框 input、滑动条 value / change、下拉框 items / selected / select、
// 标签 text / icon、序列帧动画 playing、树 items / item / key / selected / select。用 headless 后端测。
import test from 'node:test';
import assert from 'node:assert/strict';
import {headless} from '../../helpers/framework.mjs';
import {writeFixture} from '../../helpers/fixture.mjs';
import {writeControls} from '../../conformance/controls.mjs';

async function setup() {
  const root = writeFixture();
  writeControls(root, {buttonId: 'cbtn0001'});
  const ctx = await headless({root});
  await ctx.backend.loadPackage('Common');
  await ctx.backend.loadPackage('Controls');
  const panel = ctx.backend.create('Controls', 'ControlsPanel');
  ctx.backend.root.addChild(panel);
  const mount = bind => {
    class ControlsView extends ctx.fw.View { static component = 'Controls/ControlsPanel'; static layer = 'page'; bind = bind; }
    const view = new ControlsView();
    view.__mount(panel);
    return view;
  };
  return {...ctx, panel, sim: ctx.fw.sim, mount};
}

test('wheel 只认落在这个控件上的滚轮（在别的控件上滚不触发）', async () => {
  const {backend, panel, sim, mount} = await setup();
  const log = [];
  mount({lockButton: {wheel: e => log.push(`lock ${e.dy}`)}, fullButton: {wheel: e => log.push(`full ${e.dy}`)}});
  await sim.wheel(backend, panel.child('lockButton'), 120);
  await sim.wheel(backend, panel.child('fullButton'), -60);
  await sim.wheel(backend, panel.child('bg'), 10);
  assert.deepEqual(log, ['lock 120', 'full -60']);
});

test('input：用户打字时调用，text 显示 Model 的值；代码改文字不触发；不是输入框报 LGUI-RT-063', async () => {
  const {backend, panel, sim, mount, fw} = await setup();
  const {lgui, pick} = fw;
  const form = lgui.Model({name: ''}, set => ({setName(name) { set({name: name.toUpperCase()}); }}));
  const calls = [];
  mount({nameInput: {text: pick(form, s => s.name), input: text => { calls.push(text); form.setName(text); }}, nameText: {text: pick(form, s => s.name)}});
  await sim.type(backend, panel.child('nameInput'), 'ab');
  // 第二个字接在框里现在的文字（Model 改成的 A）后面，和真的键盘一样。
  assert.deepEqual([calls, form.get().name, panel.child('nameInput').text, panel.child('nameText').text], [['a', 'Ab'], 'AB', 'AB', 'AB']);
  form.setName('x');
  assert.equal(calls.length, 2);
  assert.throws(() => mount({nameText: {input: () => {}}}), e => e.code === 'LGUI-RT-063' && /input/.test(e.message));
});

test('value / change：滑动条显示 Model 的值，用户拖动时 change 收到新值；用错控件报 LGUI-RT-063', async () => {
  const {backend, panel, sim, mount, fw} = await setup();
  const {lgui, pick} = fw;
  const audio = lgui.Model({volume: 30}, set => ({setVolume(volume) { set({volume}); }}));
  mount({volume: {value: pick(audio, s => s.volume), change: v => audio.setVolume(v)}, volumeText: {text: pick(audio, s => String(s.volume))}});
  assert.equal(panel.child('volume').value, 30);
  await sim.setValue(backend, panel.child('volume'), 80);
  assert.deepEqual([audio.get().volume, panel.child('volumeText').text], [80, '80']);
  audio.setVolume(10);
  assert.equal(panel.child('volume').value, 10);
  assert.throws(() => mount({volumeText: {value: 1}}), e => e.code === 'LGUI-RT-063' && /value/.test(e.message));
  assert.throws(() => mount({lockButton: {change: () => {}}}), e => e.code === 'LGUI-RT-063' && /change/.test(e.message));
});

test('items / selected / select：下拉框显示选中项，用户选了一项时 select 收到序号；不能用 item、key', async () => {
  const {backend, panel, sim, mount, fw} = await setup();
  const {lgui, pick} = fw;
  const game = lgui.Model({modes: ['简单', '普通', '困难'], mode: 1}, set => ({setMode(mode) { set({mode}); }}));
  const picked = [];
  mount({mode: {items: pick(game, s => s.modes), selected: pick(game, s => s.mode), select: i => { picked.push(i); game.setMode(i); }}});
  const combo = panel.child('mode');
  assert.deepEqual([combo.text, combo.selectedIndex], ['普通', 1]);
  await sim.choose(backend, combo, 2);
  assert.deepEqual([picked, game.get().mode, combo.text], [[2], 2, '困难']);
  game.set({modes: ['甲', '乙', '丙']});
  assert.equal(combo.text, '丙', '换了 items 以后重新按 selected 选中');
  assert.throws(() => mount({mode: {key: x => x}}), e => e.code === 'LGUI-RT-063' && /key/.test(e.message));
});

test('标签用 text、icon；序列帧动画用 playing；playing 用错控件报 LGUI-RT-063', async () => {
  const {panel, mount, fw} = await setup();
  const {lgui, pick} = fw;
  const fx = lgui.Model({spinning: false});
  mount({badge: {text: pick(fx, s => (s.spinning ? 'on' : 'off')), icon: 'ui://Controls/none'}, spin: {playing: pick(fx, s => s.spinning)}});
  assert.deepEqual([panel.child('badge').title, panel.child('badge').icon, panel.child('spin').playing], ['off', 'ui://Controls/none', false]);
  fx.set({spinning: true});
  assert.deepEqual([panel.child('badge').title, panel.child('spin').playing], ['on', true]);
  assert.throws(() => mount({badge: {playing: true}}), e => e.code === 'LGUI-RT-063' && /playing/.test(e.message));
});

test('树：items 的 children 是子节点，用 ItemView 显示；点节点时 select 收到 key；没写 key 或 key 重复报 LGUI-RT-152', async () => {
  const {backend, panel, sim, mount, fw} = await setup();
  const {lgui, pick, ItemView} = fw;
  const nodes = [{id: 'weapon', name: '武器', children: [{id: 'sword', name: '剑'}, {id: 'bow', name: '弓'}]}, {id: 'herb', name: '草药'}];
  const bag = lgui.Model({nodes, selected: null}, set => ({select(selected) { set({selected}); }}));
  class NodeView extends ItemView { static component = 'Controls/TreeItem'; bind = {title: {text: n => n.name}}; }
  const view = mount({tree: {items: pick(bag, s => s.nodes), item: NodeView, key: n => n.id, selected: pick(bag, s => s.selected), select: id => bag.select(id)}});
  const tree = panel.child('tree');
  const titles = () => Array.from({length: tree.numItems}, (_, i) => tree.itemAt(i).child('title').text);
  assert.deepEqual(titles(), ['武器', '剑', '弓', '草药']);
  await sim.click(backend, tree.itemAt(3));
  assert.deepEqual([bag.get().selected, tree.selectedKey], ['herb', 'herb']);
  await sim.click(backend, tree.itemAt(0));
  assert.deepEqual([bag.get().selected, titles()], ['weapon', ['武器', '草药']], 'clickToExpand=1：点文件夹节点收起');
  bag.select('bow');
  assert.deepEqual(titles(), ['武器', '剑', '弓', '草药'], '选中节点时展开它的父节点');
  view.__dispose();
  assert.throws(() => mount({tree: {items: nodes, item: NodeView}}), e => e.code === 'LGUI-RT-152' && /key/.test(e.message));
  assert.throws(() => mount({tree: {items: [{id: 'a'}, {id: 'a'}], item: NodeView, key: n => n.id}}), e => e.code === 'LGUI-RT-152' && /a/.test(e.message));
});

test('齿轮藏起来的按钮：切到它显示的页以后才能点（绑定照常工作）', async () => {
  const {backend, panel, sim, mount, fw} = await setup();
  const {lgui, pick} = fw;
  const ui = lgui.Model({view: 'simple', clicks: 0}, (set, get) => ({toggle() { set({view: get().view === 'simple' ? 'full' : 'simple'}); }, more() { set({clicks: get().clicks + 1}); }}));
  mount({view: {page: pick(ui, s => s.view)}, fullButton: {click: () => ui.toggle()}, extraButton: {click: () => ui.more()}});
  await assert.rejects(sim.click(backend, panel.child('extraButton')), e => e.code === 'LGUI-RT-032');
  await sim.click(backend, panel.child('fullButton'));
  await sim.click(backend, panel.child('extraButton'));
  assert.equal(ui.get().clicks, 1);
});
