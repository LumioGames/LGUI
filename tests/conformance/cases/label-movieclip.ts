// 标签和序列帧动画：标签的 text 跟着 Model，序列帧动画的 playing 为真就播、为假就停。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ spinning: true }, (set, get) => ({ toggle() { set({ spinning: !get().spinning }); } }));

class FxView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    badge: { text: pick(m, s => (s.spinning ? 'spinning' : 'stopped')) },
    spin: { playing: pick(m, s => s.spinning) },
    fullButton: { click: () => m.toggle() },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(FxView);
    const P = 'Controls/ControlsPanel';
    const before = [t.text(`${P}.badge`), t.playing(`${P}.spin`)];
    await t.click(`${P}.fullButton`);
    return { before, after: [t.text(`${P}.badge`), t.playing(`${P}.spin`)] };
  },
};
export default c;
