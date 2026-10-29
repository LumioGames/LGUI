import { Controller } from 'lgui';
import { mainModel } from './MainModel';

export class MainController extends Controller {
  click() { mainModel.addClick(); }
}
export const mainController = new MainController();
