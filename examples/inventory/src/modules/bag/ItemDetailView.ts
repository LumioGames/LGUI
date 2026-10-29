import { View, pick, lgui } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { ItemDetailUI } from 'lgui/ui';
import { bagModel, selectedItem, statLines } from './BagModel';
import { bagController } from './BagController';

/** 道具详情弹窗（横竖共用一版）。 */
export class ItemDetailView extends View<ItemDetailUI> {
  static component = 'Bag/ItemDetail';
  static layer = 'popup' as const;

  bind: Bind<ItemDetailUI> = {
    icon: { icon: pick(bagModel, s => selectedItem(s)?.icon ?? '') },
    itemName: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? lgui.t(`item.${kind}.name`) : '')) },
    rarityText: { text: pick(bagModel, s => selectedItem(s), it => (it ? lgui.t('bag.rarityLine', { rarity: lgui.t(`rarity.${it.rarity}`), type: lgui.t(`type.${it.type}`) }) : '')) },
    statsText: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? statLines(kind).map(l => `${lgui.t(`stat.${l.name}`)} ${l.value}`).join('\n') : '')) },
    descText: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? lgui.t(`item.${kind}.desc`) : '')) },
    closeButton: { click: () => bagController.closeDetail() },
  };
  keys: Keys = { back: 'close' };
}
