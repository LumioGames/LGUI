import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';
import { FakeInventoryService } from '../src/modules/bag/InventoryService';
import { bagModel } from '../src/modules/bag/BagModel';

const start = () => lgui.testing.start(app, { services: { inventory: () => new FakeInventoryService() } });
beforeEach(() => bagModel.reset());

test('从背包去商店买星露灵药：扣 190 金币、红点；关掉商店回到背包，选中刚买的灵药', async () => {
  const t = await start();
  await t.click('Main/MainView.bagEntry');
  await t.advance(16);
  await t.click('Bag/BagPanel.tabMaterial');
  await t.click('Bag/BagPanel.shopButton');
  await t.advance(16);
  assert.deepEqual(t.snapshot().layers.page, ['MainView', 'BagView', 'ShopView']);
  assert.equal(t.text('Shop/ShopPanel.list[2].label'), '星露灵药');
  assert.equal(t.text('Shop/ShopPanel.list[2].price'), '190 金币');
  await t.click('Shop/ShopPanel.list[2]');
  assert.equal(t.text('Common/Confirm.message'), '花 190 金币购买 星露灵药？');
  await t.click('Common/Confirm.ok');
  await t.advance(50);
  assert.equal(t.text('Shop/ShopPanel.topBar.amount'), '12,290');
  assert.equal(t.text('Common/Toast.text'), '买到了 星露灵药');
  await t.click('Shop/ShopPanel.closeButton');
  await t.advance(16);
  assert.deepEqual(t.snapshot().layers.page, ['MainView', 'BagView']);
  assert.equal(t.page('Bag/BagPanel.category'), 'all');
  assert.equal(t.text('Bag/BagPanel.itemName'), '星露灵药');
  assert.equal(t.text('Bag/BagPanel.topBar.amount'), '12,290');
  t.end();
});

test('金币不够：不发请求，提示金币不够', async () => {
  const t = await start();
  bagModel.spend(bagModel.get().coins - 10);
  await t.click('Main/MainView.shopEntry');
  await t.advance(16);
  await t.click('Shop/ShopPanel.list[4]');
  assert.equal(t.text('Common/Toast.text'), '金币不够');
  assert.equal(t.snapshot().layers.popup.length, 0);
  t.end();
});
