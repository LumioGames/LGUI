import { ItemView, lgui, format } from 'lgui';
import type { ItemBind } from 'lgui';
import type { ShopItemUI } from 'lgui/ui';
import type { ShopItem } from './ShopModel';

/** 商品一行。 */
export class ShopItemView extends ItemView<ShopItemUI, ShopItem> {
  static component = 'Bag/ShopItem';

  bind: ItemBind<ShopItemUI, ShopItem> = {
    icon: { icon: it => it.icon },
    label: { text: it => lgui.t(`item.${it.kind}.name`) },
    price: { text: it => lgui.t('shop.price', { price: format.number(it.price) }) },
  };
}
