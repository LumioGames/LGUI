// 滚动量保持输入像素，不随设计尺寸缩放；只有滚轮落点坐标需要转换。
import {View, lgui} from 'lgui';
import type {Bind} from 'lgui';
import type {ShopPanelUI} from 'lgui/ui';
import type {Case} from '../harness';

const log = lgui.Model({deltaY: 0}, set => ({wheel(deltaY: number) { set({deltaY}); }}));

class WheelView extends View<ShopPanelUI> {
  static component = 'Shop/ShopPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  bind: Bind<ShopPanelUI> = {bg: {wheel: event => log.wheel(event.dy)}};
}

const c: Case = {
  screen: {width: 1280, height: 720},
  async run(t) {
    await t.open(WheelView);
    await t.wheel('Shop/ShopPanel.bg', 120);
    return log.get();
  }
};
export default c;
