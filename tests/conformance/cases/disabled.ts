// 不可用的控件：enabled 绑成 false 以后变灰、点了不触发 click（h5 上点击落到下面的背景上，headless 报 LGUI-RT-032，两边都不调用 click）；
// 再改回可用，点击照常。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ locked: false, clicks: 0 }, (set, get) => ({
  toggle() { set({ locked: !get().locked }); },
  click() { set({ clicks: get().clicks + 1 }); },
}));

class DisabledView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    lockButton: { enabled: pick(m, s => !s.locked), click: () => m.click() },
    fullButton: { click: () => m.toggle() },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(DisabledView);
    const P = 'Controls/ControlsPanel';
    await t.click(`${P}.lockButton`);
    await t.click(`${P}.fullButton`);
    const enabled = t.enabled(`${P}.lockButton`);
    try { await t.click(`${P}.lockButton`); } catch { /* headless：点不到（LGUI-RT-032） */ }
    const whileLocked = m.get().clicks;
    await t.click(`${P}.fullButton`);
    await t.click(`${P}.lockButton`);
    return { enabled, whileLocked, model: m.get() };
  },
};
export default c;
