// 拖放：从一个按钮拖到写了 drop 的按钮上，drop 收到 dragData；松在没写 drop 的地方，什么也不改。
import { View, lgui } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ dropped: [] as string[] }, (set, get) => ({ drop(data: string) { set({ dropped: [...get().dropped, data] }); } }));

class DragView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    lockButton: { dragData: 'lock' },
    fullButton: { drop: (data: string) => m.drop(data) },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(DragView);
    const P = 'Controls/ControlsPanel';
    await t.dragTo(`${P}.lockButton`, `${P}.fullButton`);
    await t.dragTo(`${P}.lockButton`, `${P}.bg`);
    return m.get();
  },
};
export default c;
