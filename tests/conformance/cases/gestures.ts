// 手势：长按满了才执行、没按满不执行；滑动和拖拽收到的方向一致（滑动也会触发一次拖拽）。
import { View, lgui } from 'lgui';
import type { Bind } from 'lgui';
import type { ShopPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const log = lgui.Model({ holds: 0, swipes: [] as string[], drags: [] as string[] }, (set, get) => ({
  hold() { set({ holds: get().holds + 1 }); },
  swipe(dx: number) { set({ swipes: [...get().swipes, dx > 0 ? 'right' : 'left'] }); },
  drag(phase: string, dy: number) { if (phase === 'end') set({ drags: [...get().drags, dy > 0 ? 'down' : 'up'] }); },
}));

class GestureView extends View<ShopPanelUI> {
  static component = 'Shop/ShopPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  bind: Bind<ShopPanelUI> = {
    closeButton: { hold: { ms: 600, action: () => log.hold() } },
    bg: { swipe: e => log.swipe(e.dx), drag: e => log.drag(e.phase, e.dy) },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(GestureView);
    await t.hold('Shop/ShopPanel.closeButton', 200);
    await t.hold('Shop/ShopPanel.closeButton', 900);
    await t.swipe('Shop/ShopPanel.bg', -300, 0);
    await t.drag('Shop/ShopPanel.bg', 0, 150);
    return log.get();
  },
};
export default c;
