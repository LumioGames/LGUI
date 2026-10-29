import { ItemView, lgui } from 'lgui';
import type { ItemBind } from 'lgui';
import type { PickerItemUI } from 'lgui/ui';
import { statLines } from './BagModel';
import type { BagItem } from './BagModel';

/** 选道具界面里的一项。 */
export class PickerItemView extends ItemView<PickerItemUI, BagItem> {
  static component = 'Bag/PickerItem';

  bind: ItemBind<PickerItemUI, BagItem> = {
    icon: { icon: it => it.icon },
    label: { text: it => lgui.t(`item.${it.kind}.name`) },
    statsText: { text: it => statLines(it.kind).slice(0, 1).map(l => `${lgui.t(`stat.${l.name}`)} ${l.value}`).join('') },
  };
}
