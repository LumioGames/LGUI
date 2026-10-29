// 齿轮和组：组 extra 挂着 gearDisplay（full 页才显示），组里的按钮跟着显隐；lockedText 再挂一个 gearDisplay2（还要 lock 在 on 页）。
// 显示出来以后组里的按钮能点。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ view: 'simple' as 'simple' | 'full', lock: 'off' as 'off' | 'on', more: 0 }, (set, get) => ({
  toggleView() { set({ view: get().view === 'simple' ? 'full' : 'simple' }); },
  toggleLock() { set({ lock: get().lock === 'off' ? 'on' : 'off' }); },
  more() { set({ more: get().more + 1 }); },
}));

class GearView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    view: { page: pick(m, s => s.view) },
    lock: { page: pick(m, s => s.lock) },
    fullButton: { click: () => m.toggleView() },
    lockButton: { click: () => m.toggleLock() },
    extraButton: { click: () => m.more() },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(GearView);
    const P = 'Controls/ControlsPanel';
    const read = () => ['simpleText', 'extraText', 'extraButton', 'lockedText'].map(n => t.visible(`${P}.${n}`));
    const steps = [read()];
    await t.click(`${P}.fullButton`);
    steps.push(read());
    await t.click(`${P}.lockButton`);
    steps.push(read());
    await t.click(`${P}.extraButton`);
    return { steps, model: m.get() };
  },
};
export default c;
