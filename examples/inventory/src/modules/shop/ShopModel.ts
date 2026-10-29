// 商店的货架：卖什么、多少钱（价格是出售价的两倍，以服务器回的为准）。
import { lgui } from 'lgui';
import { definition, iconOf } from '../bag/CatalogModel';

export interface ShopItem { kind: string; icon: string; price: number }

const STOCK = ['redPotion', 'bluePotion', 'elixir', 'crystal', 'gem', 'shield', 'helmet', 'boots'];

export const shopModel = lgui.Model({
  items: STOCK.map(kind => ({ kind, icon: iconOf(kind), price: definition(kind).price * 2 })) as ShopItem[],
  /** 最近买到的道具（回到背包时选中它）。 */
  lastBought: null as string | null,
}, set => ({
  bought(kind: string) { set({ lastBought: kind }); },
  clearLastBought() { set({ lastBought: null }); },
}));
