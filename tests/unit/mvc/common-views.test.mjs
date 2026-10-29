import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

async function setup(config) {
  const ctx = await started({config});
  ctx.fw.setTexts({'zh-CN': {'bag.sold': '已售出 {count} 件', 'bag.sellTitle': '出售', 'bag.sellAsk': '确定出售？', 'lgui.requestFailed': '请求失败（{code}）', 'lgui.back': '返回'}}, 'zh-CN');
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

const texts = {
  'zh-CN': {'bag.sold': '已售出 {count} 件', 'bag.sellTitle': '出售', 'bag.sellAsk': '确定出售 {name}？', 'bag.yes': '卖', 'shop.ask': '确定购买？', 'lgui.back': '返回'},
  en: {'bag.sold': 'Sold {count}', 'bag.sellTitle': 'Sell', 'bag.sellAsk': 'Sell {name}?', 'bag.yes': 'Sell it', 'shop.ask': 'Buy it?', 'lgui.back': 'Back'}
};
const confirmView = fw => fw.lgui.ui.list('modal').find(v => v.constructor.name === 'ConfirmView');
const track = promise => { const state = {done: false, value: undefined}; promise.then(v => { state.done = true; state.value = v; }); return state; };

test('confirm 排队：同时只显示一个，前一个答完下一个才弹出；每个都有自己的结果', async () => {
  const {fw, backend, sim} = await setup();
  fw.setTexts(texts, 'zh-CN');
  const {lgui} = fw;
  const first = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk', params: {name: '剑'}});
  const second = lgui.confirm({title: 'bag.sellTitle', message: 'shop.ask'});
  await sim.advance(backend, 0);
  assert.equal(lgui.ui.list('modal').length, 1);
  assert.equal(confirmView(fw).__component.child('message').text, '确定出售 剑？');
  await sim.click(backend, confirmView(fw).__component.child('ok'));
  assert.equal(await first, true);
  await sim.advance(backend, 0);
  assert.equal(confirmView(fw).__component.child('message').text, '确定购买？');
  await sim.click(backend, confirmView(fw).__component.child('cancel'));
  assert.equal(await second, false);
  await sim.advance(backend, 0);
  assert.equal(confirmView(fw), undefined);
});

test('confirm 总会有结果：被代码关掉（closeAll）时，它和后面排队的都当 false', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  const all = [1, 2, 3].map(() => lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'}));
  await sim.advance(backend, 0);
  lgui.ui.closeAll('modal');
  assert.deepEqual(await Promise.all(all), [false, false, false]);
});

test('confirm 总会有结果：排在别的 modal 后面时被取消（LGUI-RT-081）也当 false；在加载中被取消也一样', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View} = fw;
  class RewardView extends View { static component = 'Bag/ItemSlot'; static layer = 'modal'; }
  await lgui.ui.open(RewardView);
  const queued = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  const pending = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await sim.advance(backend, 0);
  lgui.ui.closeAll('modal');
  assert.deepEqual([await queued, await pending], [false, false]);
  const loading = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  lgui.ui.closeAll('modal');   // 还在打开的路上
  assert.equal(await loading, false);
});

test('confirm：打开它的界面先关了，用户答了照样有结果', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui, View} = fw;
  let answer = null;
  class AskView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; onOpen() { answer = track(lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'})); } }
  await lgui.ui.open(AskView);
  await sim.advance(backend, 0);
  lgui.ui.close(AskView);
  await sim.click(backend, confirmView(fw).__component.child('ok'));
  await sim.advance(backend, 0);
  assert.deepEqual(answer, {done: true, value: true});
});

test('toast、loading 被自己取消时不产生未处理的 rejection（同一轮里两条 toast；loading 一开就关）', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  lgui.toast('bag.sold', {count: 1});
  lgui.toast('bag.sold', {count: 2});
  lgui.loading.show();
  lgui.loading.hide();
  await sim.advance(backend, 0);
  assert.equal(toastText(backend), '已售出 2 件');
  assert.equal(lgui.ui.list('modal').length, 0);
});

test('toast、confirm 的文字经得起旋转和换语言：按新语言重新取文本', async () => {
  const {fw, backend, sim} = await setup();
  fw.setTexts(texts, 'zh-CN');
  const {lgui} = fw;
  lgui.toast('bag.sold', {count: 3});
  const answer = lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk', ok: 'bag.yes', params: {name: '剑'}});
  await sim.advance(backend, 0);
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 200);
  assert.equal(toastText(backend), '已售出 3 件');
  await lgui.setLanguage('en');
  const c = confirmView(fw).__component;
  assert.deepEqual([toastText(backend), c.child('title').text, c.child('message').text, c.child('ok').title, c.child('cancel').title],
    ['Sold 3', 'Sell', 'Sell 剑?', 'Sell it', '取消'], '没传 cancel 时用 ui/ 里的文字');
  await sim.key(backend, 'Escape');
  assert.equal(await answer, false);
  await lgui.setLanguage('zh-CN');
});

test('重新启动（setupCommonViews）时，还没答的 confirm 都当 false', async () => {
  const first = await setup();
  const answer = first.fw.lgui.confirm({title: 'bag.sellTitle', message: 'bag.sellAsk'});
  await first.sim.advance(first.backend, 0);
  await setup();
  assert.equal(await answer, false);
});

test('lgui.request 失败时统一弹提示（requestErrorToast 默认开）', async () => {
  const {fw, backend, sim} = await setup();
  const {lgui} = fw;
  const req = lgui.request(async () => { throw new Error('boom'); });
  await req.run();
  await sim.advance(backend, 0);
  assert.equal(toastText(backend), '请求失败（LGUI-RT-101）');
});
