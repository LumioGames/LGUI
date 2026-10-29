// Shared H5 / IL2CPP Player acceptance. Start the real inventory app once in a
// fresh runtime (including its LocalInventoryService); do not inject Fake services.
import {format, lgui, LgRuntimeError} from 'lgui';
import type {TestHarness, UIComponent, UIList, UILoader, UIProgress} from 'lgui';
import {bagModel, initialState, itemsForSlot, visibleItems} from '../../../examples/inventory/src/modules/bag/BagModel';
import {bagController} from '../../../examples/inventory/src/modules/bag/BagController';
import {bagFxModel} from '../../../examples/inventory/src/modules/bag/BagFxModel';
import {BagView} from '../../../examples/inventory/src/modules/bag/BagView';
import {ItemDetailView} from '../../../examples/inventory/src/modules/bag/ItemDetailView';
import {ItemPickerView} from '../../../examples/inventory/src/modules/bag/ItemPickerView';
import {MainView} from '../../../examples/inventory/src/modules/main/MainView';
import {shopModel} from '../../../examples/inventory/src/modules/shop/ShopModel';
import {shopController} from '../../../examples/inventory/src/modules/shop/ShopController';
import {ShopView} from '../../../examples/inventory/src/modules/shop/ShopView';
import {rewardModel} from '../../../examples/inventory/src/modules/reward/RewardModel';
import {rewardController} from '../../../examples/inventory/src/modules/reward/RewardController';
import {RewardDialogView} from '../../../examples/inventory/src/modules/reward/RewardDialogView';
import {CoinDialogView} from '../../../examples/inventory/src/modules/reward/CoinDialogView';

const BAG = 'Bag/BagPanel';
const SHOP = 'Shop/ShopPanel';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** All business actions use the same TestHarness original-input operations. */
export async function runInventoryAcceptance(t: TestHarness): Promise<object> {
  let step = 'fresh runtime';
  const checkpoints: object[] = [];
  const rawTiming: object[] = [];
  const off: (() => void)[] = [];
  const fail = (message: string): never => {
    throw new LgRuntimeError('LGUI-RT-001', `S3-04 inventory / ${step}: ${message}`, '保留此步骤的输入、界面和运行日志，修复后从干净运行时重跑同一串动作。');
  };
  const check = (condition: boolean, message: string): void => { if (!condition) fail(message); };
  const same = (actual: unknown, expected: unknown, message: string): void => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${message}: ${JSON.stringify({actual, expected})}`);
  };
  const wait = async (label: string, condition: () => boolean): Promise<void> => {
    const started = lgui.time.now();
    while (!condition()) {
      if (lgui.time.now() - started >= 10000) fail(`等待 ${label} 超过 10 秒。`);
      await t.advance(16);
    }
  };
  const component = (view: {__component: UIComponent | null} | undefined): UIComponent => {
    const found = view?.__component;
    if (!found) return fail('目标 View 没有已挂载的 core UIComponent。');
    return found;
  };
  const bag = (): UIComponent => component(lgui.ui.get(BagView));
  const list = (): UIList => {
    const found = bag().child('list');
    if (!found || !('numItems' in found)) return fail('背包 list 不是 core UIList。');
    return found as UIList;
  };
  const durableStack = (): object => {
    const s = t.snapshot();
    // Toast lifetime and per-view timer counts are real-time observations, not
    // cross-backend business equality. The four persistent layers are compared.
    return {hud: s.layers.hud, page: s.layers.page, popup: s.layers.popup, modal: s.layers.modal,
      active: s.active, orientation: s.orientation, language: s.language, inputType: s.inputType};
  };
  const bagUI = (): object | null => {
    if (!lgui.ui.isOpen(BagView)) return null;
    const l = list();
    const bar = bag().child('capacityBar') as UIProgress | null;
    const title = bag().child('titleImage') as UILoader | null;
    return {itemName: t.text(`${BAG}.itemName`), rarity: t.text(`${BAG}.rarityText`), stats: t.text(`${BAG}.statsText`),
      description: t.text(`${BAG}.descText`), amount: t.text(`${BAG}.topBar.amount`), capacity: t.text(`${BAG}.capacityText`),
      capacityProgress: bar ? {value: bar.value, max: bar.max} : null,
      action: {text: t.text(`${BAG}.actionButton`), enabled: t.enabled(`${BAG}.actionButton`)},
      sellEnabled: t.enabled(`${BAG}.sellButton`), salvageEnabled: t.enabled(`${BAG}.salvageButton`),
      detailEnabled: t.enabled(`${BAG}.detailButton`), weapon: t.text(`${BAG}.weaponSlot`),
      category: t.page(`${BAG}.category`), sort: t.text(`${BAG}.sortButton`), titleUrl: title?.url ?? null,
      count: l.numItems, selectedIndex: l.selectedIndex, scroll: {...l.scrollPosition},
      empty: t.visible(`${BAG}.emptyTip`), touchHint: t.visible(`${BAG}.touchHint`)};
  };
  const capture = (name: string, extra: object = {}): void => {
    const reward = rewardModel.get();
    checkpoints.push(clone({step: name, bag: bagModel.get(), save: JSON.parse(bagModel.save()) as object,
      persisted: lgui.platform.storage.get('bag'), shop: shopModel.get(),
      rewards: {rewards: reward.rewards, lastClaim: reward.lastClaim},
      requests: {sell: bagController.sellRequest.get().status, buy: shopController.buyRequest.get().status, claim: rewardController.claimRequest.get().status},
      redDots: {bag: lgui.redDot.get('bag.new'), reward: lgui.redDot.get('reward.ready')},
      stack: durableStack(), ui: bagUI(), ...extra}));
    rawTiming.push({step: name, now: lgui.time.now(), eventEndsAt: reward.eventEndsAt, eventLeft: reward.eventLeft,
      hudText: t.text('Main/Hud.eventText'), toast: [...t.snapshot().layers.toast]});
  };
  const select = async (id: string): Promise<void> => {
    const index = visibleItems(bagModel.get()).findIndex(item => item.id === id);
    check(index >= 0, `当前分类里没有道具 ${id}。`);
    list().scrollToView(index);
    await wait(`列表 ${id} 创建可见子项`, () => list().itemAt(index) !== null);
    await t.click(`${BAG}.list[${index}]`);
    await wait(`选中 ${id}`, () => bagModel.get().selectedId === id && list().selectedIndex === index);
    const cell = list().itemAt(index);
    if (!cell) return fail(`${id} 选中后没有已渲染子项。`);
    const item = visibleItems(bagModel.get())[index];
    same(t.text(`${BAG}.list[${index}].count`), item.quantity > 1 ? String(item.quantity) : '', '子项数量文字');
    same(t.page(`${BAG}.list[${index}].rarity`), item.rarity, '子项品质 controller');
    same(t.visible(`${BAG}.list[${index}].newMark`), item.isNew, '子项新道具标记');
    const icon = cell.child('icon') as UILoader | null;
    same(icon?.url, item.icon, '子项图标绑定');
  };
  const fxSamples: object[] = [];
  const pending = {sell: [] as object[], buy: [] as object[], claim: [] as object[]};
  const observe = (target: object[], read: () => object): void => {
    try { target.push(clone(read())); } catch (error) { target.push({observationError: String(error)}); }
  };

  try {
    check(lgui.ui.isOpen(MainView), '必须先启动真实 examples/inventory app。');
    check(bagController.sellRequest.get().status === 'idle' && shopController.buyRequest.get().status === 'idle'
      && rewardController.claimRequest.get().status === 'idle', '必须使用未执行过请求的新运行时和真实 LocalInventoryService。');
    lgui.platform.storage.remove('bag');
    bagModel.reset(); bagFxModel.hide(); bagController.syncRedDots();
    shopModel.clearLastBought();
    // main.start already started the real countdown before opening HudView.
    // Starting it again here would leave HudView timing the original deadline.
    check(rewardModel.get().rewards.every(reward => reward.state === 'ready')
      && rewardModel.get().lastClaim.items.length === 0, '奖励必须来自新的真实 app，不能复用已领奖的运行时。');
    await t.setLanguage('zh-CN');
    await t.setScreen(1280, 720);
    t.setInputType('keyboardMouse');
    await wait('营地已激活', () => t.snapshot().active === 'MainView');
    same(bagModel.get(), initialState(), '干净背包');
    same(lgui.platform.storage.get('bag'), null, '干净平台存档');
    capture('clean-camp', {rewardDotVisible: t.visible('Main/MainView.rewardEntry.redDot')});

    step = 'open / parts / visibleOn';
    await t.click('Main/MainView.bagEntry');
    await wait('背包已激活', () => t.snapshot().active === 'BagView');
    same(t.text(`${BAG}.topBar.amount`), format.number(12480), 'CurrencyBar 部件');
    same(t.page(`${BAG}.category`), 'all', '初始分类');
    check(!t.visible(`${BAG}.touchHint`), '键鼠模式 touchHint 应隐藏。');
    t.setInputType('touch'); check(t.visible(`${BAG}.touchHint`), 'touch 模式 touchHint 应显示。');
    capture('bag-touch-visible');
    t.setInputType('keyboardMouse');
    capture('bag-open');

    // Existing bindings subscribe first; observe the real UI while each transient
    // model/request transition is delivered, even if the driver reply arrives late.
    off.push(bagController.sellRequest.subscribe(() => {
      if (bagController.sellRequest.get().status === 'pending') observe(pending.sell, () => ({tip: t.visible(`${BAG}.sellingTip`), enabled: t.enabled(`${BAG}.sellButton`)}));
    }));
    off.push(bagFxModel.subscribe(() => {
      if (step === 'sell confirmation / real pending / ArtText' && bagFxModel.get().coinFx && lgui.ui.isOpen(BagView)) {
        observe(fxSamples, () => ({text: t.text(`${BAG}.coinFx`), visible: t.visible(`${BAG}.coinFx`)}));
      }
    }));

    step = 'selection / detail / back / use';
    await select('redPotion-1');
    await t.click(`${BAG}.detailButton`);
    await wait('详情 popup', () => lgui.ui.isOpen(ItemDetailView));
    capture('item-detail', {detail: {name: t.text('Bag/ItemDetail.itemName'), stats: t.text('Bag/ItemDetail.statsText'), description: t.text('Bag/ItemDetail.descText')}});
    await t.key('Escape');
    await wait('详情返回背包', () => !lgui.ui.isOpen(ItemDetailView) && t.snapshot().active === 'BagView');
    await t.click(`${BAG}.actionButton`);
    await wait('使用红药', () => bagModel.get().items.find(item => item.id === 'redPotion-1')?.quantity === 4);
    capture('use-red-potion');

    step = 'equip / picker onClose result';
    await select('sword-1');
    await t.click(`${BAG}.actionButton`);
    await wait('装备长剑', () => bagModel.get().equipment.weapon?.id === 'sword-1');
    check(!t.enabled(`${BAG}.actionButton`), '已装备道具的主操作应禁用。');
    capture('equip-sword');
    await t.click(`${BAG}.weaponSlot`);
    await wait('武器选择 popup', () => lgui.ui.isOpen(ItemPickerView));
    const bow = itemsForSlot(bagModel.get(), 'weapon').findIndex(item => item.id === 'bow-1');
    check(bow >= 0, '武器选择列表没有 bow-1。');
    await t.click(`Bag/ItemPicker.list[${bow}]`);
    await wait('onClose 交回并装备弓', () => !lgui.ui.isOpen(ItemPickerView) && bagModel.get().equipment.weapon?.id === 'bow-1');
    check(bagModel.get().items.some(item => item.id === 'sword-1'), '换武器没有把原长剑放回背包。');
    capture('picker-equips-bow');

    step = 'sell confirmation / real pending / ArtText';
    await select('sword-1');
    const beforeSale = bagModel.save();
    await t.click(`${BAG}.sellButton`);
    await wait('出售确认', () => t.snapshot().active === 'ConfirmView');
    capture('sell-confirm', {confirmation: {title: t.text('Common/Confirm.title'), message: t.text('Common/Confirm.message')}});
    await t.click('Common/Confirm.cancel');
    await wait('取消出售', () => t.snapshot().active === 'BagView' && t.enabled(`${BAG}.sellButton`));
    same(bagModel.save(), beforeSale, '取消出售不能改变背包');
    await t.click(`${BAG}.sellButton`);
    await wait('第二次出售确认', () => t.snapshot().active === 'ConfirmView');
    await t.click('Common/Confirm.ok');
    await wait('真实出售请求完成', () => bagController.sellRequest.get().status !== 'idle' && bagController.sellRequest.get().status !== 'pending');
    check(bagController.sellRequest.get().status === 'succeeded', `真实出售失败：${bagController.sellRequest.get().error?.message ?? 'unknown'}`);
    await wait('出售数据与按钮更新', () => bagModel.get().coins === 12560 && t.enabled(`${BAG}.sellButton`) === false);
    same(pending.sell, [{tip: true, enabled: false}], 'sellingTip / lockWhilePending');
    check(fxSamples.some(sample => JSON.stringify(sample) === JSON.stringify({text: '+80', visible: true})), '未观察到真实 +80 ArtText。');
    capture('sold-sword', {pending: clone(pending.sell), coinFxObserved: clone(fxSamples)});
    await wait('coinFx 定时清空', () => bagFxModel.get().coinFx === '' && !t.visible(`${BAG}.coinFx`));
    same(t.text(`${BAG}.coinFx`), '', 'ArtText 清空');
    capture('coin-fx-cleared');

    step = 'short / completed salvage hold';
    await select('axe-1');
    const beforeSalvage = bagModel.save();
    await t.hold(`${BAG}.salvageButton`, 400);
    same(bagModel.save(), beforeSalvage, '短按不应分解');
    capture('salvage-short');
    await t.hold(`${BAG}.salvageButton`, 1200);
    await wait('长按分解完成', () => !bagModel.get().items.some(item => item.id === 'axe-1'));
    same(bagModel.get().items.find(item => item.id === 'ore-1')?.quantity, 13, '分解得到赤铁矿');
    capture('salvage-complete');

    step = 'category / sort / real scroll / rotate / language';
    await t.click(`${BAG}.tabMaterial`);
    await wait('材料 controller 和列表更新', () => t.page(`${BAG}.category`) === 'material' && list().numItems === visibleItems(bagModel.get()).length);
    check(visibleItems(bagModel.get()).every(item => item.type === 'material'), '材料过滤错误。');
    capture('filter-material');
    await t.click(`${BAG}.tabAll`);
    await t.click(`${BAG}.sortButton`);
    await wait('稀有度排序', () => bagModel.get().sort === 'rarity');
    await select('redPotion-1');
    list().scrollPosition = {x: 0, y: 0};
    await wait('列表回到顶部', () => list().scrollPosition.y === 0);
    // This UI explicitly sets scrollBar="hidden". Both FairyGUI backends
    // disable mouse-wheel scrolling in that mode, while touch dragging is on.
    await t.drag(`${BAG}.list`, 0, -120);
    await wait('原始触摸拖动实际滚动', () => list().scrollPosition.y > 0);
    rawTiming.push({step: 'native-touch-scroll', scroll: {...list().scrollPosition}});
    // A fixed in-range design position makes preservation exact across both
    // engines, while the preceding raw drag must have really moved the list.
    list().scrollPosition = {x: 0, y: 40};
    await t.advance(16);
    same(list().scrollPosition.y, 40, '设置位置经过实际帧后应仍为 40');
    await wait('设计位置 40', () => list().scrollPosition.y === 40);
    const selectedIndex = list().selectedIndex;
    capture('scrolled-landscape');
    await t.setScreen(450, 800);
    await wait('portrait 版和列表状态', () => t.snapshot().orientation === 'portrait' && list().scrollPosition.y === 40 && list().selectedIndex === selectedIndex);
    capture('scrolled-portrait');
    await t.setLanguage('en');
    await wait('英文重建和列表状态', () => t.snapshot().language === 'en' && list().scrollPosition.y === 40 && list().selectedIndex === selectedIndex);
    same((bag().child('titleImage') as UILoader).url, 'ui://Bag/title@en', '英文带字图片');
    same(t.text(`${BAG}.itemName`), lgui.t('item.redPotion.name'), '语言切换文字');
    capture('scrolled-english');
    await t.setScreen(1280, 720);
    await wait('横版恢复列表状态', () => t.snapshot().orientation === 'landscape' && list().scrollPosition.y === 40 && list().selectedIndex === selectedIndex);
    await t.setLanguage('zh-CN');
    same(list().scrollPosition.y, 40, '中文重建滚动位置');
    same(list().selectedIndex, selectedIndex, '中文重建选中序号');
    capture('scrolled-chinese');

    step = 'shop buy / pending / red dot / return selection';
    await t.click(`${BAG}.shopButton`);
    await wait('商店页面', () => t.snapshot().active === 'ShopView');
    off.push(shopController.buyRequest.subscribe(() => {
      if (shopController.buyRequest.get().status === 'pending') observe(pending.buy, () => ({tip: t.visible(`${SHOP}.buyingTip`)}));
    }));
    same(t.text(`${SHOP}.topBar.amount`), format.number(12560), '商店共用 CurrencyBar');
    const elixir = shopModel.get().items.findIndex(item => item.kind === 'elixir');
    check(elixir >= 0, '真实商店没有 elixir。');
    await t.click(`${SHOP}.list[${elixir}]`);
    await wait('购买确认', () => t.snapshot().active === 'ConfirmView');
    await t.click('Common/Confirm.ok');
    await wait('购买请求完成', () => shopController.buyRequest.get().status !== 'idle' && shopController.buyRequest.get().status !== 'pending');
    check(shopController.buyRequest.get().status === 'succeeded', `购买失败：${shopController.buyRequest.get().error?.message ?? 'unknown'}`);
    await wait('购买落库和红点', () => shopModel.get().lastBought === 'elixir' && bagModel.get().coins === 12370 && lgui.redDot.get('bag.new') === 1);
    same(pending.buy, [{tip: true}], 'buyingTip pending');
    capture('bought-elixir', {pending: clone(pending.buy), shopAmount: t.text(`${SHOP}.topBar.amount`), newIds: [...bagModel.get().newIds]});
    await t.key('Escape');
    await wait('商店 onClose reload', () => !lgui.ui.isOpen(ShopView) && t.snapshot().active === 'BagView' && bagModel.get().selectedId === 'elixir-1' && shopModel.get().lastBought === null);
    same(bagModel.get().category, 'all', '从商店回来应切全部');
    same(bagModel.get().items.find(item => item.id === 'elixir-1')?.quantity, 6, '购买数量');
    same(lgui.redDot.get('bag.new'), false, '选中刚买道具应清红点');
    await select('elixir-1');
    capture('shop-return-selection');
    await wait('购买 coinFx 清空', () => bagFxModel.get().coinFx === '');
    await t.key('Escape');
    await wait('返回营地', () => t.snapshot().active === 'MainView');

    step = 'claim / request lock / modal queue / stable ArtText';
    off.push(rewardController.claimRequest.subscribe(() => {
      if (rewardController.claimRequest.get().status === 'pending') observe(pending.claim, () => ({status: 'pending'}));
    }));
    await t.click('Main/MainView.rewardEntry');
    await wait('三项奖励和第一个 modal', () => rewardModel.get().rewards.every(reward => reward.state === 'claimed') && t.snapshot().active === 'RewardDialogView');
    same(pending.claim.length, 3, '真实 sequential claim 请求数');
    same(t.snapshot().layers.modal, ['RewardDialogView'], '后一个 modal 尚在队列');
    same(rewardModel.get().lastClaim, {items: [{kind: 'elixir', quantity: 1}, {kind: 'crystal', quantity: 3}, {kind: 'staff', quantity: 1}], coins: 170}, '奖励结果');
    same(bagModel.get().coins, 12540, '奖励金币');
    same(lgui.redDot.get('bag.new'), 3, '奖励新道具合计');
    same(bagModel.get().items.find(item => item.id === 'redPotion-1')?.quantity, 4, '已使用的红药保持');
    same(bagModel.get().items.find(item => item.id === 'elixir-1')?.quantity, 7, '购买和奖励灵药叠加');
    same(bagModel.get().items.find(item => item.id === 'crystal-1')?.quantity, 15, '奖励水晶叠加');
    same(bagModel.get().items.filter(item => item.kind === 'staff').length, 2, '不可叠加装备奖励占新格');
    same(bagModel.get().newIds, ['elixir-1', 'crystal-1', 'staff-n1'], '奖励新道具 ID');
    same(bagModel.get().equipment.weapon?.id, 'bow-1', '已换上的武器保持');
    same(bagModel.get().items.length, 24, '完整动作后的占用格数');
    const rewardIcon = component(lgui.ui.get(RewardDialogView)).child('icon.image') as UILoader | null;
    same(rewardIcon?.url, 'ui://Bag/elixir', '奖励 PartView 的真实跨包图标');
    capture('reward-items-modal', {itemsText: t.text('Reward/RewardDialog.itemText'), pending: clone(pending.claim)});
    await t.click('Reward/RewardDialog.okButton');
    await wait('队列中的金币 modal', () => t.snapshot().active === 'CoinDialogView');
    same(t.snapshot().layers.modal, ['CoinDialogView'], '金币 modal 接替道具 modal');
    same(t.text('Reward/CoinDialog.amount'), '+170', '真实 ArtText 金币');
    check(t.visible('Reward/CoinDialog.amount'), '金币 ArtText 应可见。');
    capture('coin-modal-chinese', {title: t.text('Reward/CoinDialog.title'), amount: t.text('Reward/CoinDialog.amount')});
    await t.setLanguage('en');
    same(t.text('Reward/CoinDialog.amount'), '+170', 'ArtText 语言重建后保留');
    same(t.text('Reward/CoinDialog.title'), 'Gold received', 'modal 英文');
    capture('coin-modal-english', {title: t.text('Reward/CoinDialog.title'), amount: t.text('Reward/CoinDialog.amount')});
    await t.setLanguage('zh-CN');
    await t.key('Enter');
    await wait('modal 队列结束', () => t.snapshot().layers.modal.length === 0 && t.snapshot().active === 'MainView');
    check(!t.visible('Main/MainView.rewardEntry.redDot'), '领取后奖励入口红点应熄灭。');
    check(t.visible('Main/MainView.bagEntry.redDot'), '奖励后背包入口红点应点亮。');
    capture('reward-queue-complete');

    step = 'save / reset / platform restore';
    await t.click('Main/MainView.bagEntry');
    await wait('重新打开背包', () => t.snapshot().active === 'BagView');
    bagController.persist();
    const saved = bagModel.save();
    same(lgui.platform.storage.get('bag'), saved, '平台 Storage 保存完整 schema');
    capture('saved');
    bagModel.reset(); bagController.syncRedDots();
    same(bagModel.get(), initialState(), 'reset 真实 Model');
    same(lgui.platform.storage.get('bag'), saved, 'reset 不应改平台存档');
    capture('reset-with-save-retained');
    bagController.restore();
    same(bagModel.save(), saved, 'restore 必须精确恢复所有字段');
    same(t.text(`${BAG}.topBar.amount`), format.number(12540), '恢复后的部件文字');
    same(lgui.redDot.get('bag.new'), 3, '恢复红点');
    capture('restored');
    return {schemaVersion: 1, checkpoints, pending, coinFxObserved: fxSamples, rawTiming,
      coverage: {businessService: 'real LocalInventoryService', artText: 'logical text / visibility / language rebuild; glyph pixels require screenshots',
        notInInventory: ['drag binding (independent probe required)', 'placeholder binding (independent probe required)']}};
  } catch (error) {
    if (error instanceof LgRuntimeError && error.code === 'LGUI-RT-001') throw error;
    return fail(error instanceof Error ? error.message : String(error));
  } finally {
    for (const stop of off.reverse()) stop();
  }
}
