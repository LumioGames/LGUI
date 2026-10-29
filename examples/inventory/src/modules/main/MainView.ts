import { View } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { MainViewUI } from 'lgui/ui';
import { mainController } from './MainController';

/** 营地：page 层最底下的主界面（返回键关不掉）。透明，下面露出 HUD 的场景；背包、商店打开时把两者都盖住。 */
export class MainView extends View<MainViewUI> {
  static component = 'Main/MainView';
  static layer = 'page' as const;

  bind: Bind<MainViewUI> = {
    bagEntry: { click: () => mainController.openBag(), redDot: 'bag.new' },
    shopEntry: { click: () => mainController.openShop() },
    rewardEntry: { click: () => mainController.claimRewards(), redDot: 'reward.ready', lockWhilePending: true },
  };
  keys: Keys = { back: 'none' };
}
