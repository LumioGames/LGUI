import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

test('lgui.request：成功、失败、超时三种状态都能被 pick 读到', async () => {
  const {fw, backend, sim} = await started({config: {requestTimeoutMs: 1000}});
  const {lgui, pick} = fw;
  let mode = 'ok';
  let resolveSlow;
  const req = lgui.request(async id => {
    if (mode === 'ok') return {sold: id};
    if (mode === 'fail') throw new Error('库存不足');
    return new Promise(r => { resolveSlow = r; });
  });
  const status = pick(req, r => r.status);
  const seen = [];
  status.subscribe(() => seen.push(status.get()));
  assert.equal(status.get(), 'idle');
  assert.deepEqual(await req.run('a'), {ok: true, value: {sold: 'a'}, error: null});
  mode = 'fail';
  const failed = await req.run('b');
  assert.deepEqual([failed.ok, failed.error.code, req.get().error.code], [false, 'LGUI-RT-101', 'LGUI-RT-101']);
  mode = 'slow';
  const pending = req.run('c');
  await sim.advance(backend, 1100);
  const timedOut = await pending;
  assert.deepEqual([timedOut.ok, timedOut.error.code], [false, 'LGUI-RT-100']);
  resolveSlow?.({late: true});
  assert.deepEqual(seen, ['pending', 'succeeded', 'pending', 'failed', 'pending', 'failed']);
  assert.ok(backend.state.logs.some(l => l.level === 'warn' && l.event === 'lgui_rt_100'));
});

test('按钮在请求等待中保持锁住（lockWhilePending + lgui.request）', async () => {
  const {fw, backend, sim} = await started();
  const {lgui, View, Controller} = fw;
  let finish;
  class ShopController extends Controller {
    sellRequest = lgui.request(() => new Promise(r => { finish = r; }));
    sell() { return this.sellRequest.run(); }
  }
  const shop = new ShopController();
  class BagView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {sellButton: {click: () => shop.sell(), lockWhilePending: true}}; }
  const view = await lgui.ui.open(BagView);
  const button = view.__component.child('sellButton');
  await sim.click(backend, button);
  assert.deepEqual([button.enabled, shop.sellRequest.get().status], [false, 'pending']);
  finish(1);
  await new Promise(r => setTimeout(r, 0));
  assert.deepEqual([button.enabled, shop.sellRequest.get().status], [true, 'succeeded']);
});

test('await 之后目标界面已关：close 跳过，只记日志', async () => {
  const {fw, backend} = await started();
  const {lgui, View, Controller} = fw;
  let finish;
  class PickerView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  class PickerController extends Controller { async confirm() { await new Promise(r => { finish = r; }); lgui.ui.close(PickerView); } }
  const c = new PickerController();
  await lgui.ui.open(PickerView);
  const done = c.confirm();
  lgui.ui.close(PickerView);          // 用户先按了返回
  finish();
  await done;
  assert.equal(backend.state.logs.at(-1).event, 'lgui_rt_082');
});

test('lgui.service：main.ts 注册真实实现，测试里换成假实现；没注册报 LGUI-RT-102', async () => {
  const {fw, backend, deps} = await started();
  const {lgui, boot, defaultConfig} = fw;
  class Real { sell() { return 'real'; } }
  class Fake { sell() { return 'fake'; } }
  const shop = lgui.service('shop');      // 模块顶层就拿，用到时才创建
  const app = {backend: 'h5', services: {shop: () => new Real()}, start() {}};
  await boot(backend, app, defaultConfig, deps);
  assert.equal(shop.sell(), 'real');
  await boot(backend, app, defaultConfig, deps, {services: {shop: () => new Fake()}});
  assert.equal(shop.sell(), 'fake');
  assert.throws(() => lgui.service('nope').x, e => e.code === 'LGUI-RT-102');
});
