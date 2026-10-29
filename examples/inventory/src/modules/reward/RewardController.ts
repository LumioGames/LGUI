// 领奖：每个能领的奖励发一次请求，成功后广播 rewardClaimed（背包收到后放进道具和金币）。
// 全部领完弹两个窗口：先「获得道具」，再「金币到账」；它们在 modal 层排队，前一个关掉后一个才弹出来。
import { Controller, lgui } from 'lgui';
import { rewardModel, readyRewards } from './RewardModel';
import type { RewardId } from './RewardModel';
import type { InventoryService } from '../bag/InventoryService';
import { RewardDialogView } from './RewardDialogView';
import { CoinDialogView } from './CoinDialogView';

const service = lgui.service<InventoryService>('inventory');

/** 领到了一个奖励。 */
export const rewardClaimed = lgui.defineEvent<{ id: RewardId; kind: string; quantity: number; coins: number }>('rewardClaimed');

export class RewardController extends Controller {
  claimRequest = lgui.request((id: RewardId) => service.claim(id));

  /** 领取全部能领的奖励。 */
  async claimAll() {
    const ready = readyRewards(rewardModel.get().rewards);
    if (!ready.length) { lgui.toast('reward.none'); return; }
    const items: { kind: string; quantity: number }[] = [];
    let coins = 0;
    for (const reward of ready) {
      const r = await this.claimRequest.run(reward.id);
      if (!r.ok) break;
      rewardModel.claimed(reward.id);
      lgui.emit(rewardClaimed, { id: reward.id, ...r.value });
      items.push({ kind: r.value.kind, quantity: r.value.quantity });
      coins += r.value.coins;
    }
    this.syncRedDot();
    if (!items.length) return;
    rewardModel.setLastClaim(items, coins);
    void lgui.ui.open(RewardDialogView);
    if (coins > 0) void lgui.ui.open(CoinDialogView);
  }
  closeItems() { lgui.ui.close(RewardDialogView); }
  closeCoins() { lgui.ui.close(CoinDialogView); }

  startEvent() { rewardModel.startEvent(lgui.time.now()); this.syncRedDot(); }
  tick(left: number) { rewardModel.tick(left); }
  endEvent() { rewardModel.endEvent(); this.syncRedDot(); }
  syncRedDot() { lgui.redDot.set('reward.ready', readyRewards(rewardModel.get().rewards).length); }
}
export const rewardController = new RewardController();
