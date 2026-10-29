import { View, pick, format, lgui } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { BagPanelUI } from 'lgui/ui';
import { bagModel, equippedIn, selectedItem, statLines, visibleItems } from './BagModel';
import type { BagItem, Category } from './BagModel';
import { bagFxModel } from './BagFxModel';
import { bagController, coinsChanged } from './BagController';
import { ItemSlotView } from './ItemSlotView';
import { CurrencyBarView } from '../common/CurrencyBarView';

const sellable = (it: BagItem | null): boolean => it !== null && !it.equipped && it.type !== 'quest';

/** 背包：横版左右分栏，竖版上下堆叠。 */
export class BagView extends View<BagPanelUI> {
  static component = 'Bag/BagPanel';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<BagPanelUI> = {
    topBar: { view: CurrencyBarView },
    closeButton: { click: () => bagController.close() },
    coinFx: { text: pick(bagFxModel, s => s.coinFx), visible: pick(bagFxModel, s => s.coinFx !== '') },
    category: { page: pick(bagModel, s => s.category), change: (c: Category) => bagController.setCategory(c) },
    tabAll: { click: () => bagController.setCategory('all') },
    tabEquipment: { click: () => bagController.setCategory('equipment') },
    tabConsumable: { click: () => bagController.setCategory('consumable') },
    tabMaterial: { click: () => bagController.setCategory('material') },
    tabQuest: { click: () => bagController.setCategory('quest') },
    list: {
      items: pick(bagModel, visibleItems), item: ItemSlotView, key: (it: BagItem) => it.id,
      selected: pick(bagModel, s => s.selectedId), select: id => bagController.select(String(id)),
    },
    emptyTip: { visible: pick(bagModel, s => visibleItems(s).length === 0) },
    detailIcon: { icon: pick(bagModel, s => selectedItem(s)?.icon ?? ''), visible: pick(bagModel, s => s.selectedId !== null) },
    itemName: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? lgui.t(`item.${kind}.name`) : lgui.t('bag.noSelection'))) },
    rarityText: { text: pick(bagModel, selectedItem, it => (it ? lgui.t('bag.rarityLine', { rarity: lgui.t(`rarity.${it.rarity}`), type: lgui.t(`type.${it.type}`) }) : '')) },
    statsText: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? statLines(kind).map(l => `${lgui.t(`stat.${l.name}`)} ${l.value}`).join('\n') : '')) },
    descText: { text: pick(bagModel, s => selectedItem(s)?.kind ?? '', kind => (kind ? lgui.t(`item.${kind}.desc`) : '')) },
    actionButton: {
      text: pick(bagModel, selectedItem, it => lgui.t(it?.equipped ? 'bag.worn' : it?.type === 'consumable' ? 'bag.use' : it?.type === 'equipment' ? 'bag.equip' : 'bag.noAction')),
      enabled: pick(bagModel, s => { const it = selectedItem(s); return it !== null && !it.equipped && (it.type === 'consumable' || it.type === 'equipment'); }),
      click: () => bagController.act(),
    },
    sellButton: { enabled: pick(bagModel, s => sellable(selectedItem(s))), click: () => bagController.sell(), lockWhilePending: true },
    sellingTip: { visible: pick(bagController.sellRequest, r => r.status === 'pending') },
    salvageButton: {
      enabled: pick(bagModel, s => { const it = selectedItem(s); return it !== null && !it.equipped && it.type === 'equipment'; }),
      hold: { ms: 1000, action: () => bagController.salvage() },
    },
    detailButton: { enabled: pick(bagModel, s => s.selectedId !== null), click: () => bagController.openDetail() },
    weaponSlot: {
      text: pick(bagModel, s => equippedIn(s, 'weapon')?.kind ?? '', kind => (kind ? lgui.t('bag.weapon', { name: lgui.t(`item.${kind}.name`) }) : lgui.t('bag.weaponEmpty'))),
      icon: pick(bagModel, s => equippedIn(s, 'weapon')?.icon ?? ''),
      click: () => bagController.pickWeapon(),
    },
    capacityText: { text: pick(bagModel, s => `${format.number(s.items.length)} / ${format.number(s.capacity)}`) },
    capacityBar: { progress: pick(bagModel, s => Math.round((s.items.length / s.capacity) * 100)) },
    sortButton: { text: pick(bagModel, s => s.sort, sort => lgui.t(`bag.sort.${sort}`)), click: () => bagController.nextSort() },
    touchHint: { visibleOn: ['touch'] },
  };
  keys: Keys = { back: 'close', confirm: { do: () => bagController.sell(), hint: 'bag.sell' } };

  onOpen() {
    // 金币变了：飘出数字，1.2 秒后消失。
    this.on(coinsChanged, e => {
      bagController.showCoinFx(e.delta);
      this.after(1200, () => bagController.hideCoinFx());
    });
  }
}
