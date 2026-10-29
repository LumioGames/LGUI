import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';
import { FakeInventoryService } from '../src/modules/bag/InventoryService';
import { bagModel } from '../src/modules/bag/BagModel';
import { rewardModel } from '../src/modules/reward/RewardModel';

const start = () => lgui.testing.start(app, { services: { inventory: () => new FakeInventoryService() } });
beforeEach(() => { bagModel.reset(); rewardModel.reset(); });

test('领奖：两个窗口在 modal 层排队，先道具后金币；道具和金币进背包（广播站），红点变化', async () => {
  const t = await start();
  assert.equal(t.text('Main/MainView.rewardEntry.redDot.count'), '3');
  await t.click('Main/MainView.rewardEntry');
  await t.advance(100); // 三个请求各一帧，弹窗再一帧
  // 同一时间只显示一个：金币窗口在后面排队
  assert.equal(t.snapshot().active, 'RewardDialogView');
  assert.deepEqual(t.snapshot().layers.modal, ['RewardDialogView']);
  assert.equal(t.text('Reward/RewardDialog.itemText'), '星露灵药 ×1\n霜蓝水晶 ×3\n星辉法杖 ×1');
  await t.click('Reward/RewardDialog.okButton');
  await t.advance(16);
  assert.equal(t.snapshot().active, 'CoinDialogView');
  assert.equal(t.text('Reward/CoinDialog.amount'), '+170');
  await t.key('Enter');
  assert.equal(t.snapshot().layers.modal.length, 0);
  assert.equal(t.visible('Main/MainView.rewardEntry.redDot'), false);
  assert.equal(bagModel.get().coins, 12480 + 170);
  assert.equal(t.text('Main/MainView.bagEntry.redDot.count'), '3', '三件新道具');
  await t.click('Main/MainView.rewardEntry');
  assert.equal(t.text('Common/Toast.text'), '没有可以领的奖励');
  t.end();
});

test('限时活动倒计时：每秒更新；结束后限时奖励过期，只能领两个', async () => {
  const t = await start();
  assert.equal(t.text('Main/Hud.eventText'), '限时活动 剩余 10:00');
  await t.advance(61_000);
  assert.equal(t.text('Main/Hud.eventText'), '限时活动 剩余 08:59');
  await t.advance(9 * 60_000);
  assert.equal(t.text('Main/Hud.eventText'), '限时活动已结束');
  assert.equal(t.text('Main/MainView.rewardEntry.redDot.count'), '2');
  await t.click('Main/MainView.rewardEntry');
  await t.advance(100);
  assert.equal(t.text('Reward/RewardDialog.itemText'), '星露灵药 ×1\n星辉法杖 ×1');
  await t.click('Reward/RewardDialog.okButton');
  await t.advance(16);
  await t.click('Reward/CoinDialog.okButton');
  t.end();
});

test('被背包盖住时倒计时暂停显示，回来按结束时间重新算，不会走偏', async () => {
  const t = await start();
  await t.click('Main/MainView.bagEntry');
  await t.advance(16);
  await t.advance(120_000);
  await t.key('Escape');
  await t.advance(1000);
  assert.equal(t.text('Main/Hud.eventText'), '限时活动 剩余 07:59');
  t.end();
});
