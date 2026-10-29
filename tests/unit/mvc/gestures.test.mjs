import test from 'node:test';
import assert from 'node:assert/strict';
import {headless} from '../../helpers/framework.mjs';

async function setup(handlers) {
  const {fw, backend} = await headless();
  await backend.loadPackage('Common');
  await backend.loadPackage('Bag');
  const panel = backend.create('Bag', 'BagPanel');
  backend.root.addChild(panel);
  const target = panel.child('sellButton');
  const off = fw.recognize(target, backend.platform.input, backend.platform.time, handlers);
  return {fw, backend, target, sim: fw.sim, off};
}

test('点击：按下到抬起 ≤ 300 毫秒、移动 ≤ 10 像素才算', async () => {
  const log = [];
  const {backend, target, sim} = await setup({click: () => log.push('click')});
  await sim.click(backend, target, 288);
  await sim.click(backend, target, 320);
  await sim.drag(backend, target, 10, 0, 100);
  await sim.drag(backend, target, 11, 0, 100);
  assert.deepEqual(log, ['click', 'click']);
});

test('双击：两次点击间隔 ≤ 300 毫秒', async () => {
  const log = [];
  const {backend, target, sim} = await setup({click: () => log.push('click'), doubleClick: () => log.push('double')});
  await sim.doubleClick(backend, target);
  await sim.advance(backend, 500);
  await sim.click(backend, target);
  await sim.advance(backend, 400);
  await sim.click(backend, target);
  assert.deepEqual(log, ['click', 'double', 'click', 'click']);
});

test('长按：按满才执行，进度从 0 涨到 1，松手归零；不再算点击', async () => {
  const log = [], progress = [];
  const {backend, target, sim} = await setup({click: () => log.push('click'), hold: {ms: 1000, action: () => log.push('hold'), progress: r => progress.push(r)}});
  await sim.hold(backend, target, 900);
  assert.deepEqual(log, []);
  assert.equal(progress.at(-1), 0);
  assert.ok(Math.max(...progress) < 1);
  progress.length = 0;
  await sim.hold(backend, target, 1100);
  assert.deepEqual(log, ['hold']);
  assert.equal(Math.max(...progress), 1);
  assert.equal(progress.at(-1), 0);
});

test('拖拽：移动超过 10 像素后开始；滑动：抬起时速度 > 0.5 像素/毫秒', async () => {
  const drags = [], swipes = [];
  const {backend, target, sim} = await setup({drag: g => drags.push([g.phase, g.dx]), swipe: g => swipes.push(Math.round(g.dx))});
  await sim.drag(backend, target, 100, 0, 400);
  assert.deepEqual(drags[0][0], 'start');
  assert.deepEqual(drags.at(-1), ['end', 100]);
  assert.deepEqual(swipes, [], '0.25 像素/毫秒不算滑动');
  await sim.swipe(backend, target, 200, 0);
  assert.deepEqual(swipes, [200]);
});

test('双指缩放：两个指针同时按下', async () => {
  const pinches = [];
  const {backend, target, sim} = await setup({pinch: g => pinches.push([g.phase, Math.round(g.scale * 100) / 100])});
  await sim.pinch(backend, target, 2);
  assert.deepEqual(pinches[0], ['start', 1]);
  assert.deepEqual(pinches.at(-1), ['end', 2]);
});

test('悬停：鼠标移入、移出', async () => {
  const hovers = [];
  const {backend, target, sim} = await setup({hover: inside => hovers.push(inside)});
  await sim.hover(backend, target);
  assert.deepEqual(hovers, [true, false]);
});

test('取消识别以后不再收到手势', async () => {
  const log = [];
  const {backend, target, sim, off} = await setup({click: () => log.push('click')});
  off();
  await sim.click(backend, target);
  assert.deepEqual(log, []);
  assert.equal(backend.state.handlers.pointer.size, 0);
});

test('按键 → 动作：默认映射，工程配置按平台改写', async () => {
  const {fw} = await headless();
  const {actionForKey, keysForAction} = fw;
  assert.equal(actionForKey('Escape', 'h5'), 'back');
  assert.equal(actionForKey('Back', 'unity'), 'back');
  assert.equal(actionForKey('Enter', 'h5'), 'confirm');
  assert.equal(actionForKey('x', 'h5'), null);
  const keyMap = {default: {Space: 'confirm'}, unity: {Enter: 'none'}};
  assert.equal(actionForKey('Space', 'h5', keyMap), 'confirm');
  assert.equal(actionForKey('Enter', 'unity', keyMap), 'none');
  assert.deepEqual(keysForAction('back', 'h5'), ['Escape', 'Back']);
});
