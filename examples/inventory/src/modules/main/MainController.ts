import { Controller } from 'lgui';
import { bagController } from '../bag/BagController';
import { shopController } from '../shop/ShopController';
import { rewardController } from '../reward/RewardController';

export class MainController extends Controller {
  openBag() { void bagController.open(); }
  openShop() { shopController.open(); }
  claimRewards() { return rewardController.claimAll(); }
}
export const mainController = new MainController();
