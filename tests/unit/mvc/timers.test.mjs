import test from 'node:test';
import assert from 'node:assert/strict';
import {headless} from '../../helpers/framework.mjs';

test('倒计时按「结束时间 − 现在」算：跳过 10 秒（模拟切到后台，没有帧）后数值正确', async () => {
  const {fw, backend} = await headless();
  const {lgui, View, sim} = fw;
  const ticks = [];
  let done = 0;
  class EventView extends View { start(endsAt) { this.countdown(endsAt, left => ticks.push(Math.ceil(left / 1000)), () => done++); } }
  const view = new EventView();
  view.start(lgui.time.now() + 30_000);
  assert.deepEqual(ticks, [30]);
  await sim.advance(backend, 1000);
  assert.equal(ticks.at(-1), 29);
  backend.state.now += 10_000;            // 后台 10 秒，一帧都没有
  await sim.advance(backend, 16);
  assert.equal(ticks.at(-1), 19);
  await sim.advance(backend, 19_000);
  assert.deepEqual([ticks.at(-1), done], [0, 1]);
  assert.equal(view.__timers.size, 0);
});

test('after、every、onUpdate；界面被盖住时暂停，露出来时恢复', async () => {
  const {fw, backend} = await headless();
  const {View, sim} = fw;
  const log = [];
  let frames = 0;
  class V extends View { start() { this.after(500, () => log.push('after')); this.every(200, () => log.push('every')); this.onUpdate(() => frames++); } }
  const view = new V();
  view.start();
  await sim.advance(backend, 410);
  assert.deepEqual(log, ['every', 'every']);
  view.__timers.pause();
  await sim.advance(backend, 1000);
  assert.deepEqual(log, ['every', 'every']);
  const pausedFrames = frames;
  view.__timers.resume();
  await sim.advance(backend, 100);
  assert.deepEqual(log, ['every', 'every', 'after']);
  await sim.advance(backend, 100);
  assert.deepEqual(log, ['every', 'every', 'after', 'every']);
  assert.ok(frames > pausedFrames);
});

test('界面关闭后定时器归零，也不再占用每帧回调', async () => {
  const {fw, backend} = await headless();
  const {View, sim} = fw;
  let fired = 0;
  class V extends View { start() { this.every(100, () => fired++); this.after(1000, () => fired++); this.onUpdate(() => {}); } }
  const view = new V();
  view.start();
  assert.equal(view.__timers.size, 3);
  assert.equal(backend.state.handlers.frame.size, 1);
  view.__scope.dispose();
  assert.equal(view.__timers.size, 0);
  assert.equal(backend.state.handlers.frame.size, 0);
  await sim.advance(backend, 2000);
  assert.equal(fired, 0);
  view.start();
  assert.equal(view.__timers.size, 0, '关闭之后不能再加定时器');
});

test('lgui.time.setServerOffset 对齐服务器时间；框架没启动时报 LGUI-RT-050', async () => {
  const {fw} = await headless();
  const {lgui, clearRuntime} = fw;
  const before = lgui.time.now();
  lgui.time.setServerOffset(5000);
  assert.equal(lgui.time.now() - before, 5000);
  clearRuntime();
  assert.throws(() => lgui.time.now(), e => e.code === 'LGUI-RT-050');
});

test('lgui.time.wait 按帧累计：没到时间不结束，到了才结束（假时钟能推进）；0 毫秒马上结束', async () => {
  const {fw, backend} = await headless();
  const {lgui, sim} = fw;
  let done = false;
  const waiting = lgui.time.wait(100).then(() => { done = true; });
  await sim.advance(backend, 80);
  assert.equal(done, false);
  await sim.advance(backend, 32);
  await waiting;
  assert.equal(done, true);
  await lgui.time.wait(0);
});

test('假时钟每帧之后等排队的 Promise 跑完：一次 advance 里能走完一串 await', async () => {
  const {fw, backend} = await headless();
  const {lgui, sim} = fw;
  const steps = [];
  (async () => { for (let i = 0; i < 5; i++) { await lgui.time.wait(16); await Promise.resolve(); await Promise.resolve(); steps.push(i); } })();
  await sim.advance(backend, 200);
  assert.deepEqual(steps, [0, 1, 2, 3, 4]);
});
