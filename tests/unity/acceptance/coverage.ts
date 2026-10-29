import {lgui, LgRuntimeError, pick, View} from 'lgui';
import type {Bind, DragGesture, Keys, TestHarness, UILoader} from 'lgui';
import type {BagPanelUI, ItemDetailUI} from 'lgui/ui';
import {BagView} from '../../../examples/inventory/src/modules/bag/BagView';

const PAGE = 'Bag/BagPanel';
const POPUP = 'Bag/ItemDetail';
const PLACEHOLDER = 'ui://Common/placeholder';

const probe = lgui.Model({imageURL: '', graphClicks: 0, buttonClicks: 0,
  dragPhases: [] as DragGesture['phase'][], dragEnd: null as {dx: number; dy: number} | null}, (set, get) => ({
  reset() { set({imageURL: '', graphClicks: 0, buttonClicks: 0, dragPhases: [], dragEnd: null}); },
  image(imageURL: string) { set({imageURL}); },
  graphClick() { set({graphClicks: get().graphClicks + 1}); },
  buttonClick() { set({buttonClicks: get().buttonClicks + 1}); },
  drag(event: DragGesture) {
    const phases = get().dragPhases;
    // Compare semantic phases, not the host's frame-dependent move callback count.
    if (phases[phases.length - 1] !== event.phase) set({dragPhases: [...phases, event.phase]});
    if (event.phase === 'end') set({dragEnd: {dx: Math.round(event.dx), dy: Math.round(event.dy)}});
  },
}));

/** Test-only bindings on real exported inventory components. No game rules change. */
class BindingCoverageView extends View<BagPanelUI> {
  static component = PAGE;
  static layer = 'page' as const;
  static fullScreen = true;
  bind: Bind<BagPanelUI> = {
    // panel's center (1500,545) is clear of buttons and the icon. The overlaid
    // ordinary description text is non-interactive in both FairyGUI backends.
    panel: {click: () => probe.graphClick(), drag: event => probe.drag(event)},
    detailIcon: {icon: pick(probe, state => state.imageURL), placeholder: PLACEHOLDER},
    touchHint: {visibleOn: ['touch']},
    sortButton: {text: 'Coverage action', visibleOn: ['keyboardMouse'], click: () => probe.buttonClick()},
    closeButton: {click: () => lgui.ui.close(BindingCoverageView)},
  };
  keys: Keys = {back: 'close'};
}

class BindingCoveragePopup extends View<ItemDetailUI> {
  static component = POPUP;
  static layer = 'popup' as const;
  bind: Bind<ItemDetailUI> = {
    itemName: {text: 'Coverage popup'},
    closeButton: {click: () => lgui.ui.close(BindingCoveragePopup)},
  };
  keys: Keys = {back: 'close'};
}

export type CoverageCheckpoint = 'placeholder-pending' | 'external-image-loaded';

export interface BindingCoverageOptions {
  /** Fresh HTTP image request held pending by the host's fixture. */
  imageURL: string;
  /** Releases the fixture gate; the image must not complete before this request. */
  releaseURL: string;
  /** Test host may pause at these exact rendered-image evidence boundaries. */
  onCheckpoint?(name: CoverageCheckpoint): Promise<void>;
}

export async function runBindingCoverage(t: TestHarness, {imageURL, releaseURL, onCheckpoint}: BindingCoverageOptions): Promise<object> {
  let step = 'prepare';
  const checkpoints: object[] = [];
  const off: (() => void)[] = [];
  const fail = (message: string): never => {
    throw new LgRuntimeError('LGUI-RT-001', `S3-04 binding coverage / ${step}: ${message}`,
      '保留原始输入、HTTP gate 请求和真实界面日志；不要用假加载器、人工时钟或点击业务方法替代此探针。');
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
  const loader = (): UILoader => {
    const object = lgui.ui.get(BindingCoverageView)?.__component?.child('detailIcon');
    if (!object || !('url' in object)) return fail('detailIcon 不是实际 core UILoader。');
    return object as UILoader;
  };
  const capture = (name: string, extra: object = {}): void => {
    const s = t.snapshot();
    checkpoints.push(JSON.parse(JSON.stringify({step: name, data: probe.get(),
      stack: {layers: s.layers, active: s.active, orientation: s.orientation, language: s.language, inputType: s.inputType},
      ui: lgui.ui.isOpen(BindingCoverageView) ? {loaderUrl: loader().url, touchHint: t.visible(`${PAGE}.touchHint`),
        actionVisible: t.visible(`${PAGE}.sortButton`), actionEnabled: t.enabled(`${PAGE}.sortButton`)} : null, ...extra})) as object);
  };
  let imageLoaded = false;
  let imageError: string | null = null;
  try {
    check(/^https?:\/\//.test(imageURL) && /^https?:\/\//.test(releaseURL), '必须提供真实 HTTP(S) imageURL 和 releaseURL gate。');
    // Avoid two open View classes sharing Bag/BagPanel, which would make the
    // TestHarness component path ambiguous after the business acceptance case.
    if (lgui.ui.isOpen(BagView)) {
      check(t.snapshot().active === 'BagView', '已有 BagView 必须处于激活状态。');
      await t.click(`${PAGE}.closeButton`);
      await wait('业务背包关闭', () => !lgui.ui.isOpen(BagView));
    }
    await wait('临时 toast 关闭', () => t.snapshot().layers.toast.length === 0);
    check(t.snapshot().layers.popup.length === 0 && t.snapshot().layers.modal.length === 0, '探针开始前不能有其他 popup/modal。');
    probe.reset();
    await t.setScreen(1280, 720);
    t.setInputType('keyboardMouse');
    await t.open(BindingCoverageView);
    await wait('测试 page 激活', () => t.snapshot().active === 'BindingCoverageView');

    step = 'real external image placeholder / gated success';
    off.push(loader().onLoad(() => { if (loader().url === imageURL) imageLoaded = true; }));
    off.push(loader().onError(url => { if (url === imageURL) imageError = url; }));
    probe.image(imageURL);
    same(loader().url, PLACEHOLDER, 'gate 释放前必须显示真实 placeholder URL');
    await t.advance(16);
    same(loader().url, PLACEHOLDER, 'gate 持续关闭的一帧后仍应为 placeholder');
    const pendingObserved = true;
    capture('placeholder-pending', {pendingObserved});
    if (onCheckpoint) await onCheckpoint('placeholder-pending');
    const gate = {settled: false, ok: false, status: 0, error: null as string | null};
    void lgui.platform.net.fetch(releaseURL).then(response => {
      gate.ok = response.ok; gate.status = response.status; gate.settled = true;
    }, error => { gate.error = error instanceof Error ? error.message : String(error); gate.settled = true; });
    await wait('HTTP gate 释放响应', () => gate.settled);
    check(gate.ok, `HTTP gate 失败：${JSON.stringify(gate)}`);
    await wait('加载器真实成功事件和最终 URL', () => imageError !== null || (imageLoaded && loader().url === imageURL));
    check(imageError === null, `外链加载失败：${imageError}`);
    capture('external-image-loaded', {pendingObserved, imageLoaded, gate: {ok: gate.ok, status: gate.status}});
    if (onCheckpoint) await onCheckpoint('external-image-loaded');

    step = 'visibleOn input modes';
    check(!t.visible(`${PAGE}.touchHint`) && t.visible(`${PAGE}.sortButton`), '键鼠模式显示规则不正确。');
    t.setInputType('touch');
    check(t.visible(`${PAGE}.touchHint`) && !t.visible(`${PAGE}.sortButton`), 'touch 模式显示规则不正确。');
    capture('touch-visibility');
    t.setInputType('keyboardMouse');
    check(!t.visible(`${PAGE}.touchHint`) && t.visible(`${PAGE}.sortButton`), '切回键鼠未恢复显示规则。');
    capture('keyboard-mouse-visibility');

    step = 'clickable graph / original-input drag';
    await t.click(`${PAGE}.panel`);
    await wait('graph 原始点击', () => probe.get().graphClicks === 1);
    await t.drag(`${PAGE}.panel`, 180, 90);
    await wait('drag end', () => probe.get().dragEnd !== null);
    same(probe.get().dragPhases, ['start', 'move', 'end'], 'graph drag 阶段');
    same(probe.get().dragEnd, {dx: 180, dy: 90}, 'graph drag 位移');
    same(probe.get().graphClicks, 1, 'drag 不能同时触发 click');
    t.setInputType('keyboardMouse');
    await t.click(`${PAGE}.sortButton`);
    await wait('激活 page 按钮', () => probe.get().buttonClicks === 1);
    capture('graph-drag-complete');

    step = 'popup blocks lower page / back reactivates';
    await t.open(BindingCoveragePopup);
    await wait('popup 激活', () => t.snapshot().active === 'BindingCoveragePopup');
    const beforeBlockedClick = JSON.stringify(probe.get());
    // sortButton center is below the popup's panel/closeButton, inside its full
    // screen mask. These coordinates must reach the overlay, not the page.
    await t.click(`${PAGE}.sortButton`);
    await t.click(`${PAGE}.panel`);
    same(JSON.stringify(probe.get()), beforeBlockedClick, 'inactive page 的业务数据必须不变');
    same(t.snapshot().active, 'BindingCoveragePopup', '下层点击不能抢回 active');
    capture('popup-blocks-lower-page');
    await t.key('Escape');
    await wait('back 重新激活 page', () => !lgui.ui.isOpen(BindingCoveragePopup) && t.snapshot().active === 'BindingCoverageView');
    await t.click(`${PAGE}.sortButton`);
    await t.click(`${PAGE}.panel`);
    await wait('恢复后的两个点击', () => probe.get().buttonClicks === 2 && probe.get().graphClicks === 2);
    capture('page-reactivated');
    step = 'close / logical release';
    await t.click(`${PAGE}.closeButton`);
    await wait('测试 page 关闭', () => !lgui.ui.isOpen(BindingCoverageView));
    await t.advance(16);
    capture('closed');
    return {checkpoints, data: JSON.parse(JSON.stringify(probe.get())) as object, pendingObserved, imageLoaded,
      coverage: ['clickable graph', 'drag start/move/end', 'gated external image placeholder and native loader success',
        'touch / keyboardMouse visibleOn', 'popup blocks inactive page', 'back reactivates input'],
      evidenceBoundary: 'The host records HTTP request counts and screenshots; URL/event success alone does not assert final image pixels.'};
  } catch (error) {
    if (error instanceof LgRuntimeError && error.code === 'LGUI-RT-001') throw error;
    return fail(error instanceof Error ? error.message : String(error));
  } finally {
    for (const stop of off.reverse()) stop();
    if (lgui.ui.isOpen(BindingCoveragePopup)) lgui.ui.close(BindingCoveragePopup);
    if (lgui.ui.isOpen(BindingCoverageView)) lgui.ui.close(BindingCoverageView);
  }
}
