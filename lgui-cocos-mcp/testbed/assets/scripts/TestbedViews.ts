// 测试 View：验证五层栈/横竖屏换版/modal。组件都在 sync 灌进来的包里。
import {View} from '../lgui-framework/index';

export class MainView extends View {
  static override layer = 'page';
  static override component = 'Main/MainView';
}

export class ConfirmView extends View {
  static override layer = 'modal';
  static override component = 'Common/Confirm';
}
