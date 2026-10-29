import { View } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { MainViewUI } from 'lgui/ui';
import { mainController } from './MainController';

/** 营地：最底下的主界面，几个功能的入口。 */
export class MainView extends View<MainViewUI> {
  static component = 'Main/MainView';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<MainViewUI> = {
    bagEntry: { click: () => mainController.openBag(), redDot: 'bag.new' },
  };
  keys: Keys = { back: 'none' };
}
