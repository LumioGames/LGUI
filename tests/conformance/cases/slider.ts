// 滑动条：value 显示 Model 的值；t.setValue 在 h5 上真的拖滑块，change 收到取整后的新值（每次拖动通知一次），Model 改了再显示回来。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ volume: 40, changes: [] as number[] }, (set, get) => ({
  setVolume(volume: number) { set({ volume, changes: [...get().changes, volume] }); },
}));

class SliderView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    volume: { value: pick(m, s => s.volume), change: v => m.setVolume(v) },
    volumeText: { text: pick(m, s => String(s.volume)) },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(SliderView);
    const P = 'Controls/ControlsPanel';
    await t.setValue(`${P}.volume`, 80);
    await t.setValue(`${P}.volume`, 25);
    await t.setValue(`${P}.volume`, 150);
    return { value: t.value(`${P}.volume`), model: m.get() };
  },
};
export default c;
