// headless 后端的新控件（标签、滑动条、下拉框、序列帧动画、树）、显示齿轮和组、滚轮落点、打字 / 拖滑动条 / 选下拉框。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {importTs} from '../../helpers/ts.mjs';
import {writeFixture} from '../../helpers/fixture.mjs';
import {writeControls} from '../../conformance/controls.mjs';
import {generateProjectTypes} from '../../../plugin/tools/lib/generate/index.mjs';

const repo = fileURLToPath(new URL('../../..', import.meta.url));
const dir = path.join(repo, 'plugin/framework/backends/headless');

async function setup() {
  const root = writeFixture();
  writeControls(root, {buttonId: 'cbtn0001'});
  await generateProjectTypes(root);
  const packages = fs.readdirSync(path.join(root, '.lgui/build/headless')).map(f => JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/headless', f), 'utf8')));
  const entry = path.join(root, 'entry.ts');
  fs.writeFileSync(entry, `export * from ${JSON.stringify(path.join(dir, 'index.ts'))};\nexport * as sim from ${JSON.stringify(path.join(dir, 'simulate.ts'))};`);
  const mod = await importTs(entry);
  const backend = mod.createHeadlessBackend(packages);
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: ''});
  await backend.loadPackage('Common');
  await backend.loadPackage('Controls');
  const panel = backend.create('Controls', 'ControlsPanel');
  backend.root.addChild(panel);
  return {backend, panel, sim: mod.sim};
}

test('新控件按描述建好：标签、滑动条、下拉框、序列帧动画、树的初始属性', async () => {
  const {panel} = await setup();
  const volume = panel.child('volume');
  assert.deepEqual([volume.kind, volume.value, volume.min, volume.max, volume.wholeNumbers], ['slider', 50, 0, 100, true]);
  const mode = panel.child('mode');
  assert.deepEqual([mode.kind, mode.items, mode.selectedIndex, mode.text], ['combobox', [], -1, '']);
  assert.deepEqual([panel.child('badge').kind, panel.child('badge').title], ['label', '徽章']);
  assert.deepEqual([panel.child('spin').kind, panel.child('spin').playing], ['movieclip', true]);
  assert.deepEqual([panel.child('tree').kind, panel.child('tree').numItems, panel.child('tree').clickToExpand], ['tree', 0, 1]);
});

test('显示齿轮和组：控制器换页时跟着显隐；shown 是「真的显示」，visible 只是自己的开关', async () => {
  const {panel} = await setup();
  const view = panel.controller('view'), lock = panel.controller('lock');
  const shown = () => ['simpleText', 'extraText', 'extraButton', 'lockedText'].map(n => panel.child(n).shown);
  assert.deepEqual(shown(), [true, false, false, false], '组 extra 只在 full 页显示');
  assert.equal(panel.child('extraButton').visible, true);
  view.selectedPage = 'full';
  assert.deepEqual(shown(), [false, true, true, false], 'lockedText 还要 lock 在 on 页（gearDisplay2 的「并且」）');
  lock.selectedPage = 'on';
  assert.deepEqual(shown(), [false, true, true, true]);
  view.selectedPage = 'simple';
  assert.deepEqual(shown(), [true, false, false, false]);
  panel.visible = false;
  assert.equal(panel.child('simpleText').shown, false, '父组件不显示，里面的控件也不算显示');
});

test('被齿轮或组藏起来的控件点不到（LGUI-RT-032）；序列帧动画收不到点击', async () => {
  const {backend, panel, sim} = await setup();
  await assert.rejects(sim.click(backend, panel.child('extraButton')), e => e.code === 'LGUI-RT-032' && /齿轮/.test(e.message));
  panel.controller('view').selectedPage = 'full';
  await sim.click(backend, panel.child('extraButton'));
  await assert.rejects(sim.click(backend, panel.child('spin')), e => e.code === 'LGUI-RT-032');
});

test('滚轮：冒泡给目标和它的各级上级，再到舞台；别的控件收不到', async () => {
  const {backend, panel, sim} = await setup();
  const seen = [];
  panel.child('lockButton').onWheel(e => seen.push(['lock', e.deltaY]));
  panel.child('fullButton').onWheel(e => seen.push(['full', e.deltaY]));
  panel.onWheel(() => seen.push(['panel']));
  backend.platform.input.onWheel(() => seen.push(['stage']));
  await sim.wheel(backend, panel.child('lockButton'), 120);
  assert.deepEqual(seen, [['lock', 120], ['panel'], ['stage']]);
});

test('打字：先点一下，再一个字一个字地输入；空字符串清空；不是输入框报 LGUI-RT-150', async () => {
  const {backend, panel, sim} = await setup();
  const input = panel.child('nameInput');
  const texts = [], downs = [];
  input.onChange(text => texts.push(text));
  input.onPointer(e => downs.push(e.type));
  await sim.type(backend, input, '小明');
  assert.deepEqual([texts, input.text, downs], [['小', '小明'], '小明', ['down', 'up']]);
  await sim.type(backend, input, '');
  assert.deepEqual([texts.at(-1), input.text], ['', '']);
  await assert.rejects(sim.type(backend, panel.child('nameText'), 'x'), e => e.code === 'LGUI-RT-150');
  input.enabled = false;
  await assert.rejects(sim.type(backend, input, 'x'), e => e.code === 'LGUI-RT-032');
});

test('拖滑动条：夹在范围内、取整，值变了才通知；不是滑动条报 LGUI-RT-150', async () => {
  const {backend, panel, sim} = await setup();
  const slider = panel.child('volume');
  const values = [];
  slider.onChange(v => values.push(v));
  await sim.setValue(backend, slider, 70.4);
  await sim.setValue(backend, slider, 70);
  await sim.setValue(backend, slider, 150);
  assert.deepEqual([values, slider.value], [[70, 100], 100]);
  slider.value = 20;
  assert.deepEqual(values, [70, 100], '代码设置不通知');
  await assert.rejects(sim.setValue(backend, panel.child('mode'), 1), e => e.code === 'LGUI-RT-150');
});

test('下拉框：items 换了以后选中项还在范围内就保留，否则 -1；选同一项也通知；序号超出报 LGUI-RT-151', async () => {
  const {backend, panel, sim} = await setup();
  const combo = panel.child('mode');
  const chosen = [];
  combo.onChange(i => chosen.push(i));
  combo.items = ['简单', '普通', '困难'];
  assert.equal(combo.selectedIndex, -1);
  combo.selectedIndex = 1;
  assert.deepEqual([combo.text, combo.child('title').text], ['普通', '普通']);
  await sim.choose(backend, combo, 2);
  await sim.choose(backend, combo, 2);
  assert.deepEqual([chosen, combo.text], [[2, 2], '困难']);
  await assert.rejects(sim.choose(backend, combo, 3), e => e.code === 'LGUI-RT-151');
  combo.items = ['只有一项'];
  assert.deepEqual([combo.selectedIndex, combo.text], [-1, '']);
  combo.selectedIndex = 5;
  assert.equal(combo.selectedIndex, -1);
});

test('树：新节点是展开的；clickToExpand=1 时单击收起 / 展开；选中节点会展开它的父节点；换数据保留展开状态', async () => {
  const {backend, panel, sim} = await setup();
  const tree = panel.child('tree');
  const rendered = [], clicked = [];
  tree.nodeRenderer = (key, item) => { item.child('title').text = String(key); rendered.push(key); };
  tree.onClickNode(key => clicked.push(key));
  const nodes = [{key: 'a', children: [{key: 'a1', children: []}, {key: 'a2', children: []}]}, {key: 'b', children: []}];
  tree.setNodes(nodes);
  const titles = () => Array.from({length: tree.numItems}, (_, i) => tree.itemAt(i).child('title').text);
  assert.deepEqual(titles(), ['a', 'a1', 'a2', 'b']);
  await sim.click(backend, tree.itemAt(0));
  assert.deepEqual([titles(), clicked, tree.selectedKey], [['a', 'b'], ['a'], 'a']);
  assert.equal(tree.itemAt(0).controller('button').selectedPage, 'down', 'Radio 模式的节点按钮显示选中');
  assert.equal(tree.itemAt(0).child('mark').shown, true, '选中框的齿轮跟着 button 控制器');
  assert.equal(tree.itemAt(1).child('mark').shown, false);
  tree.setNodes([...nodes, {key: 'c', children: []}]);
  assert.deepEqual(titles(), ['a', 'b', 'c'], '同一个 key 保留收起状态');
  tree.selectedKey = 'a2';
  assert.deepEqual(titles(), ['a', 'a1', 'a2', 'b', 'c']);
  tree.setNodes([{key: 'b', children: []}]);
  assert.deepEqual([titles(), tree.selectedKey], [['b'], null], '选中的节点没了就不选');
  assert.ok(rendered.length > 0);
});
