import { View, pick, lgui } from 'lgui';
import type { Bind } from 'lgui';
import type { HudUI } from 'lgui/ui';
import { rewardModel } from '../reward/RewardModel';
import { rewardController } from '../reward/RewardController';

const clock = (ms: number): string => {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * HUD：最底下一层，场景背景和顶部的限时活动倒计时（不收界面输入）。
 * 背包、商店这些全屏界面打开时把它盖住，倒计时暂停；露出来时按结束时间重新算，不会走偏。
 */
export class HudView extends View<HudUI> {
  static component = 'Main/Hud';
  static layer = 'hud' as const;
  static fullScreen = true;

  bind: Bind<HudUI> = {
    eventText: { text: pick(rewardModel, s => s.eventLeft, left => (left > 0 ? lgui.t('hud.event', { time: clock(left) }) : lgui.t('hud.eventOver'))) },
  };

  onOpen() {
    this.countdown(rewardModel.get().eventEndsAt, left => rewardController.tick(left), () => rewardController.endEvent());
  }
}
