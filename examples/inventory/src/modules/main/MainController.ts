import { Controller } from 'lgui';
import { bagController } from '../bag/BagController';

export class MainController extends Controller {
  openBag() { void bagController.open(); }
}
export const mainController = new MainController();
