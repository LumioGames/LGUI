// 下拉框：items 是每一项的文字，selected 是 Model 里的序号；t.choose 在 h5 上真的点开下拉框、点弹出列表里的项，select 收到序号。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ modes: ['easy', 'normal', 'hard'], mode: 1, picks: [] as number[] }, (set, get) => ({
  setMode(mode: number) { set({ mode, picks: [...get().picks, mode] }); },
}));

class ComboView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    mode: { items: pick(m, s => s.modes), selected: pick(m, s => s.mode), select: i => m.setMode(i) },
    modeText: { text: pick(m, s => s.modes[s.mode] ?? '') },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(ComboView);
    const P = 'Controls/ControlsPanel';
    const before = t.text(`${P}.mode`);
    await t.choose(`${P}.mode`, 2);
    await t.choose(`${P}.mode`, 0);
    return { before, after: t.text(`${P}.mode`), model: m.get() };
  },
};
export default c;
