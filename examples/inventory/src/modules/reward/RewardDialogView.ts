import { View, pick, lgui } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { RewardDialogUI } from 'lgui/ui';
import { iconOf } from '../bag/CatalogModel';
import { rewardModel } from './RewardModel';
import { rewardController } from './RewardController';

/** 领奖窗口：获得的道具（modal：同时只显示一个，后面的排队）。图标放在 Bag 包的格子里，打开窗口时 Bag 包跟着加载，道具图标才显示得出来。 */
export class RewardDialogView extends View<RewardDialogUI> {
  static component = 'Reward/RewardDialog';
  static layer = 'modal' as const;

  bind: Bind<RewardDialogUI> = {
    slot: { icon: pick(rewardModel, s => (s.lastClaim.items[0] ? iconOf(s.lastClaim.items[0].kind) : '')) },
    itemText: { text: pick(rewardModel, s => s.lastClaim.items, items => items.map(it => lgui.t('reward.item', { name: lgui.t(`item.${it.kind}.name`), quantity: it.quantity })).join('\n')) },
    okButton: { click: () => rewardController.closeItems() },
  };
  keys: Keys = { back: 'close', confirm: { do: () => rewardController.closeItems(), hint: 'reward.ok' } };
}
