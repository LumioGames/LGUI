// 横竖屏：打开背包 → 选中第 5 项 → 滚到下面 → 旋转 → 选中项和滚动位置都还在 → 定时器没被重置；onOpen 只调用一次。
import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

async function bagView(fw) {
  const {lgui, View, ItemView, pick} = fw;
  const bag = lgui.Model({items: Array.from({length: 12}, (_, i) => ({id: `i${i}`, count: i})), selected: null});
  const log = {open: 0, orientation: [], ticks: 0};
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {count: {text: it => String(it.count)}}; }
  class BagView extends View {
    static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true;
    bind = {list: {items: pick(bag, s => s.items), item: SlotView, key: it => it.id, selected: pick(bag, s => s.selected), select: id => bag.set({selected: id})}};
    onOpen() { log.open++; this.every(100, () => log.ticks++); }
    onOrientationChange(o) { log.orientation.push(o); }
  }
  return {BagView, bag, log};
}

test('旋转：换成 @portrait 版本，选中项和滚动位置保留，定时器不重置，onOpen 只调用一次', async () => {
  const {fw, backend, sim, ui} = await started();
  const {lgui} = fw;
  const {BagView, bag, log} = await bagView(fw);
  const events = [];
  lgui.events && fw.bus.on(lgui.events.orientationChange, e => events.push(e.orientation));
  const view = await lgui.ui.open(BagView);
  bag.set({selected: 'i4'});                       // 选中第 5 项
  const before = view.__component;
  before.child('list').scrollPosition = {x: 0, y: 480}; // 滚到下面
  await sim.advance(backend, 350);
  const ticksBefore = log.ticks;
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 100);
  assert.equal(view.__component, before, '防抖 150 毫秒内还没换版');
  await sim.advance(backend, 100);
  const after = view.__component;
  assert.notEqual(after, before);
  assert.equal(after.componentName, 'Bag/BagPanel@portrait');
  assert.equal(after.child('list').selectedIndex, 4);
  assert.deepEqual(after.child('list').scrollPosition, {x: 0, y: 480});
  assert.equal(after.child('list').itemAt(4).child('count').text, '4');
  assert.deepEqual([log.open, log.orientation, events], [1, ['portrait'], ['portrait']]);
  assert.ok(log.ticks > ticksBefore, '定时器接着走');
  assert.equal(lgui.debug.snapshot().orientation, 'portrait');
  assert.deepEqual(after.rect, {x: 0, y: 0, width: 1080, height: 1920});
  assert.equal(lgui.ui.list('page')[0], view, '界面栈不变，还是同一个实例');
  // 旋转回来
  await sim.setScreen(backend, 1920, 1080);
  await sim.advance(backend, 200);
  assert.deepEqual([view.__component.componentName, view.__component.child('list').selectedIndex, log.open], ['Bag/BagPanel', 4, 1]);
  void ui;
});

test('没有竖版的界面只重新摆放；打开时先判方向再加载对应的版本；锁定方向时只用一版', async () => {
  const {fw, backend, sim} = await started();
  const {lgui, View} = fw;
  class DetailView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  const {BagView} = await bagView(fw);
  const detail = await lgui.ui.open(DetailView);
  const component = detail.__component;
  assert.deepEqual(component.rect, {x: 896, y: 476, width: 128, height: 128});
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 200);
  assert.equal(detail.__component, component, '没有竖版，不换组件');
  assert.deepEqual(component.rect, {x: 476, y: 896, width: 128, height: 128});
  const bag = await lgui.ui.open(BagView);
  assert.equal(bag.__component.componentName, 'Bag/BagPanel@portrait', '竖屏时打开直接用竖版');

  const locked = await started({config: {orientation: 'landscape'}});
  const {BagView: LockedBag} = await bagView(locked.fw);
  await locked.sim.setScreen(locked.backend, 1080, 1920);
  await locked.sim.advance(locked.backend, 200);
  const v = await locked.fw.lgui.ui.open(LockedBag);
  assert.equal(v.__component.componentName, 'Bag/BagPanel');
  assert.equal(locked.fw.lgui.debug.snapshot().orientation, 'landscape');
});

test('旋转不算关闭：onClose 回调不调用', async () => {
  const {fw, backend, sim} = await started();
  const {lgui, View} = fw;
  const {BagView} = await bagView(fw);
  class PickerView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  await lgui.ui.open(BagView);
  let closed = 0;
  await lgui.ui.open(PickerView, undefined, {onClose: () => closed++});
  await sim.setScreen(backend, 1080, 1920);
  await sim.advance(backend, 200);
  assert.equal(closed, 0);
  assert.equal(lgui.ui.isOpen(PickerView), true);
});
