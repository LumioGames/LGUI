import { ItemView } from 'lgui';
import type { ItemBind } from 'lgui';
import type { ItemSlotUI } from 'lgui/ui';
import type { BagItem } from './BagModel';

/** 背包格子。 */
export class ItemSlotView extends ItemView<ItemSlotUI, BagItem> {
  static component = 'Bag/ItemSlot';

  bind: ItemBind<ItemSlotUI, BagItem> = {
    icon: { icon: it => it.icon },
    count: { text: it => (it.quantity > 1 ? String(it.quantity) : '') },
    rarity: { page: it => it.rarity },
    newMark: { visible: it => it.isNew },
  };
}
