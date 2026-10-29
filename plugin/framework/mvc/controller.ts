// Controller 基类：处理操作，改 Model、调服务、开关界面。不碰控件。
import type {EventDef} from './lgui';
import {bus} from './events';

export abstract class Controller {
  /** 收听广播站的事件（跟着整个游戏走）。 */
  protected on<P>(event: EventDef<P>, handler: (payload: P) => void): void { bus.on(event, handler); }
}
