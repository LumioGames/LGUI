import { View, pick } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { CoinDialogUI } from 'lgui/ui';
import { rewardModel } from './RewardModel';
import { rewardController } from './RewardController';

/** 领奖窗口：金币到账（美术字），排在「获得道具」后面弹出。 */
export class CoinDialogView extends View<CoinDialogUI> {
  static component = 'Reward/CoinDialog';
  static layer = 'modal' as const;

  bind: Bind<CoinDialogUI> = {
    amount: { text: pick(rewardModel, s => `+${s.lastClaim.coins}`) },
    okButton: { click: () => rewardController.closeCoins() },
  };
  keys: Keys = { back: 'close', confirm: { do: () => rewardController.closeCoins(), hint: 'reward.ok' } };
}
