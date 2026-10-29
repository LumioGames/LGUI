import { View, pick } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { ShopPanelUI } from 'lgui/ui';
import { shopModel } from './ShopModel';
import type { ShopItem } from './ShopModel';
import { shopController } from './ShopController';
import { ShopItemView } from './ShopItemView';
import { CurrencyBarView } from '../common/CurrencyBarView';

/** 商店：和背包共用货币栏；关闭时背包收到 viewClosed，选中刚买的道具。 */
export class ShopView extends View<ShopPanelUI> {
  static component = 'Shop/ShopPanel';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<ShopPanelUI> = {
    topBar: { view: CurrencyBarView },
    closeButton: { click: () => shopController.close() },
    list: { items: pick(shopModel, s => s.items), item: ShopItemView, key: (it: ShopItem) => it.kind, select: kind => shopController.buy(String(kind)) },
    buyingTip: { visible: pick(shopController.buyRequest, r => r.status === 'pending') },
  };
  keys: Keys = { back: 'close' };
}
