// 背包的操作：选中、分类、排序、使用 / 装备、出售（请求 + 确认框 + 提示）、分解、换武器（选道具界面用 onClose 交回）、存档。
import { Controller, lgui } from 'lgui';
import { bagModel, selectedItem } from './BagModel';
import type { BagError, Category } from './BagModel';
import { bagFxModel } from './BagFxModel';
import { definition } from './CatalogModel';
import type { InventoryService } from './InventoryService';
import { BagView } from './BagView';
import { ShopView } from '../shop/ShopView';
import { ItemDetailView } from './ItemDetailView';
import { ItemPickerView } from './ItemPickerView';
import { rewardClaimed } from '../reward/RewardController';
import { shopModel } from '../shop/ShopModel';

const service = lgui.service<InventoryService>('inventory');
const SAVE_KEY = 'bag';

/** 金币变了（背包界面收到后飘出数字）。 */
export const coinsChanged = lgui.defineEvent<{ delta: number }>('coinsChanged');

export class BagController extends Controller {
  sellRequest = lgui.request((kind: string, quantity: number) => service.sell(kind, quantity));

  constructor() {
    super();
    // 领到奖励：道具和金币放进背包（广播站，跟着整个游戏走）。
    this.on(rewardClaimed, e => {
      const added = bagModel.add(e.kind, e.quantity);
      if (!added.ok) lgui.toast('bag.error.bagFull');
      if (e.coins) { bagModel.addCoins(e.coins); lgui.emit(coinsChanged, { delta: e.coins }); }
      this.syncRedDots();
      this.persist();
    });
  }

  open() { return lgui.ui.open(BagView); }
  close() { lgui.ui.close(BagView); }
  select(id: string) { bagModel.select(id); this.syncRedDots(); this.persist(); }
  setCategory(category: Category) { bagModel.setCategory(category); }
  nextSort() { bagModel.nextSort(); this.persist(); }

  /** 主按钮：消耗品「使用」，装备「装备」。 */
  act() {
    const item = selectedItem(bagModel.get());
    if (!item || item.equipped) return;
    const name = lgui.t(`item.${item.kind}.name`);
    if (item.type === 'consumable') {
      const r = bagModel.use(item.id);
      this.report(r, () => lgui.toast('bag.used', { name }));
    } else if (item.type === 'equipment') {
      this.equip(item.id);
    }
  }

  equip(id: string) {
    const r = bagModel.equip(id);
    this.report(r, () => lgui.toast('bag.equipped', { name: lgui.t(`item.${definition(r.ok ? r.kind : 'sword').kind}.name`) }));
  }

  async sell() {
    const item = selectedItem(bagModel.get());
    if (!item || item.equipped) return;
    const check = bagModel.canSell(item.id, 1);
    if (!check.ok) { this.report(check, () => undefined); return; }
    const name = lgui.t(`item.${item.kind}.name`);
    if (!(await lgui.confirm({ title: 'bag.sellTitle', message: 'bag.sellAsk', params: { name, price: item.price } }))) return;
    const r = await this.sellRequest.run(item.kind, 1);
    if (!r.ok) return; // 失败时框架弹出统一的错误提示（工程配置 requestErrorToast）
    bagModel.sold(item.id, 1, r.value.earned);
    lgui.emit(coinsChanged, { delta: r.value.earned });
    lgui.toast('bag.sold', { earned: r.value.earned });
    this.persist();
  }

  /** 长按满 1 秒：分解装备，得到 1 个赤铁矿。 */
  salvage() {
    const item = selectedItem(bagModel.get());
    if (!item || item.equipped) return;
    const r = bagModel.salvage(item.id);
    this.report(r, () => lgui.toast('bag.salvaged', { name: lgui.t(`item.${item.kind}.name`) }));
  }

  openShop() { void lgui.ui.open(ShopView); }
  /** 从商店回来：切到全部，选中刚买的道具。 */
  reload() {
    const kind = shopModel.get().lastBought;
    if (!kind) return;
    shopModel.clearLastBought();
    bagModel.setCategory('all');
    const id = [...bagModel.get().newIds].reverse().find(x => bagModel.get().items.some(it => it.id === x && it.kind === kind));
    if (id) this.select(id);
  }

  openDetail() { if (bagModel.get().selectedId) void lgui.ui.open(ItemDetailView); }
  closeDetail() { lgui.ui.close(ItemDetailView); }

  /** 换武器：打开选道具界面，关闭时交回选中的道具。 */
  pickWeapon() {
    void lgui.ui.open(ItemPickerView, undefined, { onClose: picked => { if (picked) this.equip(picked.itemId); } });
  }
  choose(itemId: string) { lgui.ui.close(ItemPickerView, { itemId }); }
  cancelPick() { lgui.ui.close(ItemPickerView); }

  showCoinFx(delta: number) { bagFxModel.show(delta); }
  hideCoinFx() { bagFxModel.hide(); }

  /** 存档和恢复（平台的 Storage）。 */
  persist() { lgui.platform.storage.set(SAVE_KEY, bagModel.save()); }
  restore() {
    const saved = lgui.platform.storage.get(SAVE_KEY);
    if (saved && !bagModel.load(saved).ok) lgui.platform.storage.remove(SAVE_KEY);
    this.syncRedDots();
  }

  /** 新道具红点：每个新道具一个（值 1），背包入口上的 bag.new 显示合计。 */
  syncRedDots() {
    const now = new Set(bagModel.get().newIds.map(id => `bag.new.${id.replace(/[^A-Za-z0-9_]/g, '_')}`));
    for (const path of this.lit) if (!now.has(path)) lgui.redDot.set(path, false);
    for (const path of now) lgui.redDot.set(path, 1);
    this.lit = now;
  }
  private lit = new Set<string>();

  private report<T extends { ok: boolean }>(r: T | { ok: false; error: BagError }, done: () => void) {
    if (r.ok) { done(); this.syncRedDots(); this.persist(); return; }
    lgui.toast(`bag.error.${(r as { error: BagError }).error}`);
  }
}
export const bagController = new BagController();
