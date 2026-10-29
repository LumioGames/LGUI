// View 基类：一个界面、列表子项、部件。写法见 references/mvc-spec.md 第 6 节。
import type {Bind, ItemBind, Keys, Layer, InputMode} from './types';
import type {EventDef} from './lgui';
import {todo} from './todo';
import {bus} from './events';
import {Scope} from './scope';

/** 三种 View 共用的部分：定时器和收听都跟着界面走，关闭时自动清理。 */
abstract class ViewBase<UI> {
  /** 内部用：这个界面的清理清单，关闭时由框架清理。 */
  readonly __scope = new Scope();
  /** 控件（只在生命周期钩子里的特殊情况用；平时写绑定表）。 */
  protected get ui(): UI { return todo('View.ui'); }
  /** 延时执行一次。 */
  protected after(ms: number, handler: () => void): void { void ms; void handler; todo('定时器 after'); }
  /** 重复执行。 */
  protected every(ms: number, handler: () => void): void { void ms; void handler; todo('定时器 every'); }
  /** 倒计时：每秒回调剩余毫秒数，到点调用 done。 */
  protected countdown(endsAt: number, tick: (leftMs: number) => void, done: () => void): void { void endsAt; void tick; void done; todo('定时器 countdown'); }
  /** 每帧执行。 */
  protected onUpdate(handler: (deltaMs: number) => void): void { void handler; todo('定时器 onUpdate'); }
  /** 收听广播站的事件，关闭时自动取消。 */
  protected on<P>(event: EventDef<P>, handler: (payload: P) => void): void { this.__scope.add(bus.on(event, handler)); }
}

/** 一个界面。UI 是 ui/ 生成的控件类型（比如 BagPanelUI）。 */
export abstract class View<UI> extends ViewBase<UI> {
  /** 对应的「包/组件」。 */
  static component: string;
  /** 放在哪一层。 */
  static layer: Layer;
  /** 是不是全屏。 */
  static fullScreen?: boolean;
  /** 打开时能传的参数。 */
  static params?: object;
  /** 关闭时可以交回的东西（只写类型）。 */
  static result?: unknown;
  /** 游戏场景要不要同时接收输入。 */
  static inputMode?: InputMode;
  /** 全屏又没有竖版时写 true。 */
  static bothOrientations?: boolean;
  /** 绑定表。 */
  bind: Bind<UI> = {};
  /** 按键表。 */
  keys: Keys = {};
}

/** 列表的子项。Data 是这一项的数据类型。 */
export abstract class ItemView<UI, Data> extends ViewBase<UI> {
  /** 对应的「包/组件」。 */
  static component: string;
  /** 绑定表：值是函数，传入这一项的数据。 */
  bind: ItemBind<UI, Data> = {};
}

/** 好几个界面共用的部件，跟着所在界面一起打开和关闭。 */
export abstract class PartView<UI> extends ViewBase<UI> {
  /** 对应的「包/组件」。 */
  static component: string;
  /** 绑定表。 */
  bind: Bind<UI> = {};
}
