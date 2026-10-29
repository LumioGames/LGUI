import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {typecheck, importTs} from '../../helpers/ts.mjs';
import {writeFixture} from '../../helpers/fixture.mjs';
import {generateProjectTypes} from '../../../plugin/tools/lib/generate/index.mjs';

const repo = fileURLToPath(new URL('../../..', import.meta.url));
const dir = path.join(repo, 'plugin/framework/backends/headless');
const files = ['index.ts', 'objects.ts', 'simulate.ts', 'descriptor.ts'].map(f => path.join(dir, f));

test('headless 后端在 strict 下类型检查通过（不依赖 DOM 和 Node 类型）', () => {
  assert.deepEqual(typecheck(files), []);
});

async function setup() {
  const root = writeFixture();
  await generateProjectTypes(root);
  const packages = fs.readdirSync(path.join(root, '.lgui/build/headless')).map(f => JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/headless', f), 'utf8')));
  const entry = path.join(root, 'entry.ts');
  fs.writeFileSync(entry, `export * from ${JSON.stringify(path.join(dir, 'index.ts'))};\nexport * as sim from ${JSON.stringify(path.join(dir, 'simulate.ts'))};`);
  const mod = await importTs(entry);
  const backend = mod.createHeadlessBackend(packages);
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: ''});
  await backend.loadPackage('Common');
  await backend.loadPackage('Bag');
  const panel = backend.create('Bag', 'BagPanel');
  backend.root.addChild(panel);
  return {backend, panel, sim: mod.sim};
}

test('按描述建控件树：初始属性、控制器、子组件、列表子项', async () => {
  const {backend, panel} = await setup();
  assert.equal(panel.componentName, 'Bag/BagPanel');
  assert.deepEqual(panel.childNames(), ['gold', 'sellButton', 'list', 'header', 'topBar']);
  assert.equal(panel.child('gold').text, '0');
  assert.equal(panel.child('sellButton').title, '出售');
  assert.equal(panel.child('header.count').text, '0');
  assert.equal(panel.child('topBar').componentName, 'Common/CurrencyBar');
  assert.deepEqual(panel.controller('tabs').pages, ['equip', 'item']);
  assert.throws(() => panel.controller('tabs').selectedPage = 'shop', e => e.code === 'LGUI-RT-022');
  const list = panel.child('list');
  const rendered = [];
  list.itemRenderer = (i, item) => { item.child('count').text = String(i * 10); rendered.push(item.componentName); };
  list.numItems = 3;
  assert.deepEqual([list.numItems, list.itemAt(2).child('count').text, rendered.length], [3, '20', 3]);
  list.numItems = 1;
  assert.equal(list.childNames().length, 1);
  assert.throws(() => backend.create('Nope', 'X'), e => e.code === 'LGUI-RT-002');
});

test('模拟点击、长按、双击：冒泡给上级；点不到的控件报 LGUI-RT-032', async () => {
  const {backend, panel, sim} = await setup();
  const seen = [];
  panel.child('sellButton').onPointer(e => seen.push(['button', e.type, e.time]));
  panel.onPointer(e => seen.push(['panel', e.type]));
  await sim.click(backend, panel.child('sellButton'));
  assert.deepEqual(seen.map(s => s.slice(0, 2)), [['button', 'down'], ['panel', 'down'], ['button', 'up'], ['panel', 'up']]);
  seen.length = 0;
  await sim.hold(backend, panel.child('sellButton'), 1000);
  const [down, up] = seen.filter(s => s[0] === 'button');
  assert.equal(up[2] - down[2], 1000);
  panel.child('sellButton').enabled = false;
  await assert.rejects(sim.click(backend, panel.child('sellButton')), e => e.code === 'LGUI-RT-032');
});

test('模拟拖拽、滑动、双指缩放、滚轮、按键', async () => {
  const {backend, panel, sim} = await setup();
  const moves = [];
  panel.child('list').onPointer(e => moves.push(e));
  await sim.drag(backend, panel.child('list'), 100, 0);
  const downs = moves.filter(e => e.type === 'down'), ups = moves.filter(e => e.type === 'up');
  assert.equal(ups[0].x - downs[0].x, 100);
  assert.equal(ups[0].time - downs[0].time, 400);
  moves.length = 0;
  await sim.swipe(backend, panel.child('list'), 0, -200);
  assert.ok(moves.at(-1).time - moves[0].time <= 100);
  moves.length = 0;
  await sim.pinch(backend, panel.child('list'), 2);
  assert.deepEqual([...new Set(moves.map(e => e.pointerId))].sort(), [1, 2]);
  const wheels = [], keys = [];
  backend.platform.input.onWheel(e => wheels.push(e.deltaY));
  backend.platform.input.onKey(e => keys.push(`${e.type}:${e.key}`));
  await sim.wheel(backend, panel.child('list'), 120);
  await sim.key(backend, 'Escape');
  assert.deepEqual(wheels, [120]);
  assert.deepEqual(keys, ['down:Escape', 'up:Escape']);
});

test('点列表子项会更新选中项并通知', async () => {
  const {backend, panel, sim} = await setup();
  const list = panel.child('list');
  list.itemRenderer = () => {};
  list.numItems = 4;
  const clicked = [];
  list.onClickItem(i => clicked.push(i));
  await sim.click(backend, list.itemAt(2));
  assert.deepEqual([clicked, list.selectedIndex], [[2], 2]);
});

test('换屏幕尺寸、假时钟、存储、音频和日志', async () => {
  const {backend, sim} = await setup();
  const sizes = [], frames = [];
  backend.platform.screen.onResize(s => sizes.push(`${s.width}x${s.height}`));
  backend.platform.time.onFrame(dt => frames.push(dt));
  await sim.setScreen(backend, 1080, 1920);
  assert.deepEqual(sizes, ['1080x1920']);
  assert.deepEqual(backend.platform.screen.applyDesignSize({width: 1080, height: 1920}), {x: 0, y: 0, width: 1080, height: 1920});
  const start = backend.platform.time.now();
  await sim.advance(backend, 10000);
  assert.equal(backend.platform.time.now() - start, 10000);
  assert.equal(frames.reduce((a, b) => a + b, 0), 10000);
  backend.platform.storage.set('save', '{"gold":1}');
  assert.equal(backend.platform.storage.get('save'), '{"gold":1}');
  assert.deepEqual([...backend.state.storage.keys()], ['lgui:demo:save']);
  backend.platform.audio.play('ui://Common/click', {volume: 0.5});
  assert.deepEqual(backend.state.sounds, [{url: 'ui://Common/click', volume: 0.5}]);
  backend.platform.log.write('warn', '小心');
  assert.equal(backend.state.logs.at(-1).message, '小心');
  assert.throws(() => backend.platform.net.fetch('/x'), e => e.code === 'LGUI-RT-001');
});
