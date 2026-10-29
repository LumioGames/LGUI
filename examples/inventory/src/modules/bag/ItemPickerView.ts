import { View, pick } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { ItemPickerUI } from 'lgui/ui';
import { bagModel, itemsForSlot } from './BagModel';
import type { BagItem } from './BagModel';
import { bagController } from './BagController';
import { PickerItemView } from './PickerItemView';

/** 选武器：点一项就关闭，并把选中的道具交回给打开它的一方（onClose）。 */
export class ItemPickerView extends View<ItemPickerUI> {
  static component = 'Bag/ItemPicker';
  static layer = 'popup' as const;
  static result: { itemId: string };

  bind: Bind<ItemPickerUI> = {
    list: {
      items: pick(bagModel, s => itemsForSlot(s, 'weapon')), item: PickerItemView, key: (it: BagItem) => it.id,
      select: id => bagController.choose(String(id)),
    },
    emptyTip: { visible: pick(bagModel, s => itemsForSlot(s, 'weapon').length === 0) },
    closeButton: { click: () => bagController.cancelPick() },
  };
  keys: Keys = { back: 'close' };
}
