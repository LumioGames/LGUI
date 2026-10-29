import { lgui } from 'lgui';
import { MainView } from './modules/main/MainView';
import { LocalInventoryService } from './modules/bag/InventoryService';
import { bagController } from './modules/bag/BagController';
import { rewardController } from './modules/reward/RewardController';
import { HudView } from './modules/main/HudView';

export default lgui.app({
  backend: 'h5',
  services: { inventory: () => new LocalInventoryService() },
  async start() {
    bagController.restore();
    rewardController.startEvent();
    await lgui.ui.open(HudView);
    await lgui.ui.open(MainView);
  },
});
