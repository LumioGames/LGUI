// View 基类：一个界面、列表子项、部件。写法见 references/mvc-spec.md 第 6 节。
import type {UIComponent} from '../core/index';
import {LgRuntimeError} from '../core/index';
import type {Bind, ItemBind, Keys, Layer, InputMode} from './types';
import type {EventDef} from './lgui';
import {bus} from './events';
import {Scope} from './scope';
import {ViewTimers} from './timers';
import {applyBindings} from './binding/index';

type Table = Record<string, Record<string, unknown> | undefined>;

/** 三种 View 共用的部分：绑定、定时器和收听都跟着界面走，关闭时自动清理。 */
abstract class ViewBase<UI> {
  /** 内部用：这个界面的清理清单，关闭时由框架清理。 */
  readonly __scope = new Scope();
  /** 内部用：这个界面的定时器。 */
  readonly __timers = new ViewTimers(this.__scope);
  /** 内部用：当前绑定的组件。 */
  __component: UIComponent | null = null;
  /** 内部用：当前这一次绑定的清理清单（换版重新绑定时只清这一份）。 */
  private __bindScope: Scope | null = null;
  /** 绑定表（子类覆盖）。 */
  abstract bind: object;

  /** 控件（只在生命周期钩子里的特殊情况用；平时写绑定表）。 */
  protected get ui(): UI {
    const component = this.__component;
    if (!component) throw new LgRuntimeError('LGUI-RT-065', `${this.constructor.name} 还没打开或已经关闭，不能用 this.ui。`, '只在生命周期钩子里用 this.ui。');
    return new Proxy({}, {
      get: (_, key) => typeof key === 'string' ? component.child(key) ?? component.controller(key) ?? undefined : undefined
    }) as UI;
  }

  /** 内部用：绑到一个组件上。已经绑过就先把旧组件的绑定全部清掉（换版时同一个实例重新绑定）。 */
  __mount(component: UIComponent, options: {isActive?: () => boolean; item?: {data: unknown}; owner?: object} = {}): void {
    this.__unmount();
    this.__component = component;
    const scope = new Scope();
    this.__bindScope = scope;
    applyBindings(component, this.bind as Table, {owner: options.owner ?? this, scope, isActive: options.isActive ?? (() => true), item: options.item, where: this.constructor.name});
  }

  /** 内部用：解绑。 */
  __unmount(): void {
    this.__bindScope?.dispose();
    this.__bindScope = null;
    this.__component = null;
  }

  /** 内部用：彻底清理（解绑、取消定时器和收听）。 */
  __dispose(): void {
    this.__unmount();
    this.__scope.dispose();
  }

  /** 内部用：绑定和清理清单里一共登记了多少项（给调试快照用）。 */
  get __listeners(): number { return (this.__bindScope?.size ?? 0) + this.__scope.size; }

  /** 延时执行一次。 */
  protected after(ms: number, handler: () => void): void { this.__timers.after(ms, handler); }
  /** 重复执行。 */
  protected every(ms: number, handler: () => void): void { this.__timers.every(ms, handler); }
  /** 倒计时：每秒回调剩余毫秒数，到点调用 done。 */
  protected countdown(endsAt: number, tick: (leftMs: number) => void, done: () => void): void { this.__timers.countdown(endsAt, tick, done); }
  /** 每帧执行。 */
  protected onUpdate(handler: (deltaMs: number) => void): void { this.__timers.onUpdate(handler); }
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

  /** 内部用：渲染列表里的一项（数据变了就重新绑定）。 */
  __render(component: UIComponent, data: unknown, isActive: () => boolean, owner: object): void {
    this.__mount(component, {item: {data}, isActive, owner});
  }
}

/** 好几个界面共用的部件，跟着所在界面一起打开和关闭。 */
export abstract class PartView<UI> extends ViewBase<UI> {
  /** 对应的「包/组件」。 */
  static component: string;
  /** 绑定表。 */
  bind: Bind<UI> = {};
}

const viewStatics = ['component', 'layer', 'fullScreen', 'params', 'result', 'inputMode', 'bothOrientations'];
const layers: readonly Layer[] = ['hud', 'page', 'popup', 'modal', 'toast'];
const ownStatics = (cls: object): string[] => Object.getOwnPropertyNames(cls).filter(name => !['length', 'name', 'prototype'].includes(name));

/** 内部用：打开界面前检查 View 的 7 项固定信息（lgui check 会提前查出来）。 */
export function validateViewClass(cls: object & {name: string; prototype: object; component?: unknown; layer?: unknown; inputMode?: unknown}): void {
  const isItemOrPart = cls.prototype instanceof ItemView || cls.prototype instanceof PartView;
  const allowed = isItemOrPart ? ['component'] : viewStatics;
  for (const name of ownStatics(cls)) {
    if (!allowed.includes(name)) throw new LgRuntimeError('LGUI-RT-061', `${cls.name} 写了清单以外的 static ${name}。`, `能写的只有：${allowed.join('、')}。`);
  }
  if (typeof cls.component !== 'string' || !/^[A-Z][A-Za-z0-9]*\/[A-Z][A-Za-z0-9]*$/.test(cls.component)) {
    throw new LgRuntimeError('LGUI-RT-060', `${cls.name} 缺少必填的 static component（「包/组件」），或者写法不对。`, "写成 static component = 'Bag/BagPanel';");
  }
  if (!isItemOrPart) {
    if (!layers.includes(cls.layer as Layer)) throw new LgRuntimeError('LGUI-RT-060', `${cls.name} 缺少必填的 static layer，或者不是 5 层之一。`, `写成 static layer = 'page' as const;（能用：${layers.join('、')}）`);
    if (cls.inputMode !== undefined && !['ui', 'game', 'all'].includes(cls.inputMode as string)) throw new LgRuntimeError('LGUI-RT-060', `${cls.name} 的 static inputMode 只能是 ui、game、all。`, '改成其中一个，或者不写。');
  }
}
