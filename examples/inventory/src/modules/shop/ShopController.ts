// 商店的操作：买东西（确认 → 请求 → 扣金币、放进背包、红点、提示）。
import { Controller, lgui } from 'lgui';
import { shopModel } from './ShopModel';
import { bagModel } from '../bag/BagModel';
import { bagController, coinsChanged } from '../bag/BagController';
import type { InventoryService } from '../bag/InventoryService';
import { ShopView } from './ShopView';

const service = lgui.service<InventoryService>('inventory');

export class ShopController extends Controller {
  buyRequest = lgui.request((kind: string) => service.buy(kind));

  open() { void lgui.ui.open(ShopView); }
  close() { lgui.ui.close(ShopView); }

  async buy(kind: string) {
    const item = shopModel.get().items.find(it => it.kind === kind);
    if (!item) return;
    if (bagModel.get().coins < item.price) { lgui.toast('bag.error.notEnoughCoins'); return; }
    const name = lgui.t(`item.${kind}.name`);
    if (!(await lgui.confirm({ title: 'shop.buyTitle', message: 'shop.buyAsk', params: { name, price: item.price } }))) return;
    const r = await this.buyRequest.run(kind);
    if (!r.ok) return;
    const paid = bagModel.spend(r.value.cost);
    if (!paid.ok) { lgui.toast('bag.error.notEnoughCoins'); return; }
    const added = bagModel.add(kind, 1);
    if (!added.ok) { bagModel.addCoins(r.value.cost); lgui.toast('bag.error.bagFull'); return; }
    shopModel.bought(kind);
    lgui.emit(coinsChanged, { delta: -r.value.cost });
    lgui.toast('shop.bought', { name });
    bagController.syncRedDots();
    bagController.persist();
  }
}
export const shopController = new ShopController();
