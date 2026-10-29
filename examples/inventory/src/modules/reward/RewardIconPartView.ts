import { PartView, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ItemIconUI } from 'lgui/ui';
import { iconOf } from '../bag/CatalogModel';
import { rewardModel } from './RewardModel';

/** 实际显示奖励图标的背包部件；静态组件引用保证图片所属包已加载。 */
export class RewardIconPartView extends PartView<ItemIconUI> {
  static component = 'Bag/ItemIcon';
  bind: Bind<ItemIconUI> = {
    image: { icon: pick(rewardModel, s => (s.lastClaim.items[0] ? iconOf(s.lastClaim.items[0].kind) : '')) },
  };
}
