import { lgui } from 'lgui';
import { MainView } from './modules/main/MainView';
import { LocalInventoryService } from './modules/bag/InventoryService';
import { bagController } from './modules/bag/BagController';

export default lgui.app({
  backend: 'h5',
  services: { inventory: () => new LocalInventoryService() },
  async start() {
    bagController.restore();
    await lgui.ui.open(MainView);
  },
});
