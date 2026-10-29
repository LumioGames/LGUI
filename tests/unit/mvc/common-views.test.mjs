import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

async function setup(config) {
  const ctx = await started({config});
  ctx.fw.setTexts({'zh-CN': {'bag.sold': '已售出 {count} 件', 'bag.sellTitle': '出售', 'bag.sellAsk': '确定出售？', 'lgui.requestFailed': '请求失败（{code}）'}}, 'zh-CN');
  const {View} = ctx.fw;
  let clicks = 0;
  class MainView extends View { static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true; bind = {sellButton: {click: () => { clicks++; }}}; }
  await ctx.fw.lgui.ui.open(MainView);
  return {...ctx, main: ctx.fw.lgui.ui.get(MainView), clicks: () => clicks};
}

const toastText = backend => backend.root.children.find(c => c.name === 'toast').children.find(c => c.componentName === 'Common/Toast')?.child('text').text ?? null;

test('toast：显示文本键对应的文字，不挡输入，2 秒后自动消失；新的替换旧的', async () => {
  const {fw, backend, sim, main, clicks} = await setup();
  const {lgui} = fw;
  lgui.toast('bag.sold', {count: 3});
  await sim.advance(backend, 0);
  assert.equal(toastText(backend), '已售出 3 件');
  await sim.click(backend, main.__component.child('sellButton'));
  assert.equal(clicks(), 1, 'toast 不挡输入');
  lgui.toast('bag.sold', {count: 4});
  await sim.advance(backend, 0);
  assert.equal(toastText(backend), '已售出 4 件');
  await sim.advance(backend, 2100);
  assert.equal(toastText(backend), null);
});

test('confirm：返回用户的选择；按返回键算取消；排在别的 modal 后面', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  const confirmView = () => lgui.ui.list('modal').find(v => v.constructor.name === 'ConfirmView');
  const yes = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await sim.advance(backend, 0);
  assert.equal(confirmView().__component.child('message').text, '确定出售？');
  await sim.click(backend, confirmView().__component.child('ok'));
  assert.equal(await yes, true);
  const no = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await sim.advance(backend, 0);
  await sim.click(backend, confirmView().__component.child('cancel'));
  assert.equal(await no, false);
  const back = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await sim.advance(backend, 0);
  await sim.key(backend, 'Escape');
  assert.equal(await back, false);
});

test('loading：多次 show 之后要全部 hide 才消失；不进 modal 队列，盖在最上面', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  const pending = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await sim.advance(backend, 0);
  lgui.loading.show();
  lgui.loading.show();
  await sim.advance(backend, 0);
  assert.equal(lgui.debug.snapshot().active, 'LoadingView');
  lgui.loading.hide();
  assert.equal(lgui.debug.snapshot().active, 'LoadingView');
  lgui.loading.hide();
  assert.equal(lgui.debug.snapshot().active, 'ConfirmView');
  lgui.loading.hide();   // 多余的 hide 不报错
  lgui.ui.close(lgui.ui.list('modal')[0].constructor);
  await pending;
});

test('lgui.request 失败时统一弹提示（requestErrorToast 默认开）', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  const req = lgui.request(async () => { throw new Error('boom'); });
  await req.run();
  await sim.advance(backend, 0);
  assert.equal(toastText(backend), '请求失败（LGUI-RT-101）');
});
