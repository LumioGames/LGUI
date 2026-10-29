// 滚轮只认落在控件上的事件：两个按钮各绑一个 wheel，在一个上面滚，另一个不触发。
import { View, lgui } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ log: [] as string[] }, (set, get) => ({ wheel(name: string, dy: number) { set({ log: [...get().log, `${name} ${dy > 0 ? 'down' : 'up'}`] }); } }));

class WheelView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    lockButton: { wheel: e => m.wheel('lock', e.dy) },
    fullButton: { wheel: e => m.wheel('full', e.dy) },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(WheelView);
    const P = 'Controls/ControlsPanel';
    await t.wheel(`${P}.lockButton`, 120);
    await t.wheel(`${P}.fullButton`, -120);
    await t.wheel(`${P}.bg`, 120);
    return m.get();
  },
};
export default c;
