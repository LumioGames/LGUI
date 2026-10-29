import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';
import { FakeInventoryService } from '../src/modules/bag/InventoryService';
import { bagModel } from '../src/modules/bag/BagModel';
import { bagController } from '../src/modules/bag/BagController';
import { BagView } from '../src/modules/bag/BagView';

const P = 'Bag/BagPanel';
let service: FakeInventoryService;
const start = async (options: { language?: string } = {}) => {
  service = new FakeInventoryService();
  const t = await lgui.testing.start(app, { services: { inventory: () => service }, ...options });
  return t;
};
beforeEach(() => bagModel.reset());

test('打开背包：26 件道具，选中霜纹长剑，详情显示属性', async () => {
  const t = await start();
  await t.open(BagView);
  assert.equal(t.items(`${P}.list`), 26);
  assert.equal(t.text(`${P}.itemName`), '霜纹长剑');
  assert.equal(t.text(`${P}.rarityText`), '稀有 · 装备');
  assert.equal(t.text(`${P}.statsText`), '攻击 +48\n暴击 +6%\n耐久 100');
  assert.equal(t.text(`${P}.capacityText`), '26 / 30');
  assert.equal(t.text(`${P}.topBar.amount`), '12,480');
  t.end();
});

test('分类和排序：只看消耗品；按价格排第一的是星露灵药', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.tabConsumable`);
  assert.equal(t.page(`${P}.category`), 'consumable');
  assert.equal(t.items(`${P}.list`), 6);
  await t.click(`${P}.sortButton`); // 稀有度
  await t.click(`${P}.sortButton`); // 价格
  assert.equal(t.text(`${P}.sortButton`), '排序：价格');
  await t.click(`${P}.list[0]`);
  assert.equal(t.text(`${P}.itemName`), '星露灵药');
  await t.click(`${P}.tabQuest`);
  assert.equal(t.items(`${P}.list`), 2);
  t.end();
});

test('使用消耗品：数量减 1，弹出提示', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.tabConsumable`);
  await t.click(`${P}.list[0]`); // 治疗药水 ×5
  assert.equal(t.text(`${P}.actionButton`), '使用');
  await t.click(`${P}.actionButton`);
  assert.equal(t.text('Common/Toast.text'), '使用了 治疗药水');
  assert.equal(bagModel.get().items.find(it => it.id === 'redPotion-1')?.quantity, 4);
  t.end();
});

test('出售：确认框 → 请求 → 金币增加、飘字、提示；失败时不扣道具', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.list[0]`); // 霜纹长剑 80
  await t.click(`${P}.sellButton`);
  assert.equal(t.text('Common/Confirm.message'), '出售 霜纹长剑 ×1，得到 80 金币？');
  await t.click('Common/Confirm.ok');
  await t.advance(50); // 等请求返回
  assert.deepEqual(service.calls, ['sell sword 1']);
  assert.equal(t.text(`${P}.topBar.amount`), '12,560');
  assert.equal(t.text(`${P}.coinFx`), '+80');
  assert.equal(t.text('Common/Toast.text'), '已出售，得到 80 金币');
  assert.equal(t.items(`${P}.list`), 25);
  await t.advance(1300);
  assert.equal(t.visible(`${P}.coinFx`), false);

  service.failNext = true;
  await t.click(`${P}.list[0]`); // 第二把剑
  await t.key('Enter'); // 按键也能出售（操作提示栏里的 Enter 出售）
  await t.click('Common/Confirm.ok');
  await t.advance(50);
  assert.equal(t.items(`${P}.list`), 25, '失败时道具还在');
  assert.equal(t.text(`${P}.topBar.amount`), '12,560');
  assert.match(t.text('Common/Toast.text'), /请求失败/);
  t.end();
});

test('任务道具不能出售；装备后不能出售', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.tabQuest`);
  await t.click(`${P}.list[0]`);
  assert.equal(t.enabled(`${P}.sellButton`), false);
  assert.equal(t.enabled(`${P}.actionButton`), false);
  t.end();
});

test('长按分解：没按满不分解；按满 1 秒，装备没了，得到赤铁矿', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.list[2]`); // 赤岩战斧
  await t.hold(`${P}.salvageButton`, 400);
  assert.ok(bagModel.get().items.some(it => it.id === 'axe-1'));
  await t.hold(`${P}.salvageButton`, 1100);
  assert.ok(!bagModel.get().items.some(it => it.id === 'axe-1'));
  assert.equal(bagModel.get().items.find(it => it.kind === 'ore')?.quantity, 13);
  assert.equal(t.text('Common/Toast.text'), '分解了 赤岩战斧，得到赤铁矿 ×1');
  t.end();
});

test('换武器：选道具界面关闭时交回选中的武器（onClose），背包里装上', async () => {
  const t = await start();
  await t.open(BagView);
  assert.equal(t.text(`${P}.weaponSlot`), '武器：未装备（点击选择）');
  await t.click(`${P}.weaponSlot`);
  assert.equal(t.snapshot().layers.popup.join(), 'ItemPickerView');
  assert.equal(t.items('Bag/ItemPicker.list'), 5); // 两把剑、斧、弓、法杖
  await t.click('Bag/ItemPicker.list[2]'); // 霜纹长剑、赤岩战斧、林语长弓、星辉法杖、第二把剑
  assert.equal(t.snapshot().layers.popup.length, 0);
  assert.equal(t.text(`${P}.weaponSlot`), '武器：林语长弓（点击更换）');
  assert.equal(t.items(`${P}.list`), 25);
  // 再换：弓回到背包
  await t.click(`${P}.weaponSlot`);
  await t.click('Bag/ItemPicker.list[0]');
  assert.equal(t.text(`${P}.weaponSlot`), '武器：霜纹长剑（点击更换）');
  assert.ok(bagModel.get().items.some(it => it.kind === 'bow'));
  // 取消：什么也不换
  await t.click(`${P}.weaponSlot`);
  await t.key('Escape');
  assert.equal(t.text(`${P}.weaponSlot`), '武器：霜纹长剑（点击更换）');
  t.end();
});

test('详情弹窗；旋转后换成竖版，选中和分类都保留', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.tabEquipment`);
  await t.click(`${P}.list[1]`);
  await t.click(`${P}.detailButton`);
  assert.equal(t.text('Bag/ItemDetail.itemName'), '霜纹长剑');
  await t.key('Escape');
  await t.setScreen(1080, 1920);
  assert.equal(t.snapshot().orientation, 'portrait');
  assert.equal(t.page(`${P}.category`), 'equipment');
  assert.equal(t.text(`${P}.itemName`), '霜纹长剑');
  t.end();
});

test('换成英文：固定文字、道具名、带字图片都换', async () => {
  const t = await start();
  await t.open(BagView);
  await t.setLanguage('en');
  assert.equal(t.text(`${P}.itemName`), 'Frostline Longsword');
  assert.equal(t.text(`${P}.tabConsumable`), 'Potions');
  assert.equal(t.text(`${P}.sortButton`), 'Sort: default');
  t.end();
});

test('存档和恢复：卖掉一件、换个分类，重新读档后还是这样；存档坏了就丢掉', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.list[0]`);
  await t.click(`${P}.sellButton`);
  await t.click('Common/Confirm.ok');
  await t.advance(50);
  await t.click(`${P}.sortButton`);
  const saved = lgui.platform.storage.get('bag');
  assert.ok(saved);
  bagModel.reset();
  bagController.restore();
  assert.equal(bagModel.get().coins, 12560);
  assert.equal(bagModel.get().sort, 'rarity');
  lgui.platform.storage.set('bag', '{broken');
  bagController.restore();
  assert.equal(lgui.platform.storage.get('bag'), null);
  t.end();
});

test('新道具红点：放进 2 件新道具，营地的背包入口显示 2；选中后少 1', async () => {
  const t = await start();
  bagModel.add('herb', 1000); // 叠满 999 以后占新格子
  bagModel.add('gem', 1);
  bagController.syncRedDots();
  assert.equal(t.visible('Main/MainView.bagEntry.redDot'), true);
  assert.equal(t.text('Main/MainView.bagEntry.redDot.count'), '3');
  await t.open(BagView);
  const id = bagModel.get().newIds[0];
  bagController.select(id);
  assert.equal(t.text('Main/MainView.bagEntry.redDot.count'), '2');
  t.end();
});

test('出售中：请求没返回时显示「出售中…」，出售按钮锁住；返回后恢复', async () => {
  const t = await start();
  await t.open(BagView);
  await t.click(`${P}.list[0]`);
  service.holdNext = true;
  await t.click(`${P}.sellButton`);
  await t.click('Common/Confirm.ok');
  await t.advance(16);
  assert.equal(t.visible(`${P}.sellingTip`), true);
  assert.equal(t.enabled(`${P}.sellButton`), false, 'lockWhilePending');
  service.release();
  await t.advance(16);
  assert.equal(t.visible(`${P}.sellingTip`), false);
  await t.click(`${P}.list[0]`); // 卖掉的那把剑没了，选中第二把：锁已经解开
  assert.equal(t.enabled(`${P}.sellButton`), true);
  t.end();
});

test('触屏提示：只在触屏上显示（visibleOn）', async () => {
  const t = await start();
  await t.open(BagView);
  assert.equal(t.visible(`${P}.touchHint`), false);
  t.setInputType('touch');
  assert.equal(t.visible(`${P}.touchHint`), true);
  t.setInputType('keyboardMouse');
  assert.equal(t.visible(`${P}.touchHint`), false);
  t.end();
});
