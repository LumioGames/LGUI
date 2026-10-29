import { View, pick, lgui } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { MainViewUI } from 'lgui/ui';
import { mainModel } from './MainModel';
import { mainController } from './MainController';

export class MainView extends View<MainViewUI> {
  static component = 'Main/MainView';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<MainViewUI> = {
    title:  { text: pick(mainModel, s => s.clicks, n => (n === 0 ? lgui.t('main.hello') : lgui.t('main.clicked', { count: n }))) },
    button: { click: () => mainController.click() },
  };
  keys: Keys = { back: 'none' };
}
