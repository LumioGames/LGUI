// lgui 对象：游戏代码用到的全部框架功能。写法见 references/mvc-spec.md。
import type {LgRuntimeError, NetService, Rect, StorageService} from '../core/index';
import type {InputMode, InputType, Layer, Orientation, ParamsOf, Readable, ResultOf, ViewClass} from './types';
import {todo} from './todo';

/** 入口 main.ts 的定义。 */
export interface AppDefinition {
  /** 默认后端；lgui test 换成 headless，导出 Unity 时换成 unity。 */
  backend: 'h5' | 'headless' | 'unity';
  /** 注册服务：名字 → 创建函数。 */
  services?: Record<string, () => object>;
  /** 启动：通常是打开第一个界面。 */
  start(): void | Promise<void>;
}

/** Model：数据加规则。 */
export type Model<State extends object, Rules extends object> = Readable<State> & Rules & {
  /** 只改给出的字段。 */
  set(partial: Partial<State>): void;
};

/** 请求状态。 */
export interface RequestState<T> {
  /** 没跑过、等待中、成功、失败。 */
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  /** 成功时的结果。 */
  value: T | undefined;
  /** 失败时的错误（带 LGUI-RT 错误码）。 */
  error: LgRuntimeError | null;
}

/** 一次请求的结果。 */
export type RequestResult<T> = {ok: true; value: T; error: null} | {ok: false; value: undefined; error: LgRuntimeError};

/** lgui.request 包好的请求。 */
export interface Request<Args extends unknown[], T> extends Readable<RequestState<T>> {
  /** 发请求。 */
  run(...args: Args): Promise<RequestResult<T>>;
}

/** 广播站的一个事件。 */
export interface EventDef<Payload> {
  /** 事件名。 */
  readonly name: string;
  /** 只用于类型。 */
  readonly __payload?: Payload;
}

/** 带着是哪个界面的事件参数。 */
export interface ViewEvent {
  /** 界面的类。 */
  view: ViewClass;
}

/** lgui.debug.snapshot() 的结果。 */
export interface Snapshot {
  /** 每一层的界面栈（界面名，从下到上）。 */
  layers: Record<Layer, string[]>;
  /** 激活的界面。 */
  active: string | null;
  /** 每个打开的界面的监听和定时器数量。 */
  views: {name: string; listeners: number; timers: number}[];
  /** 已加载的界面包和引用数。 */
  packages: {name: string; refs: number}[];
  /** 当前方向。 */
  orientation: Orientation;
  /** 当前语言。 */
  language: string;
  /** 当前输入类型。 */
  inputType: InputType;
}

/** lgui.testing.start 返回的测试对象。路径写成「包/组件.控件路径」，列表子项用 list[序号]。 */
export interface TestHarness {
  /** 打开界面。 */
  open<V extends ViewClass>(view: V, params?: ParamsOf<V>): Promise<InstanceType<V>>;
  /** 点击。 */
  click(path: string): Promise<void>;
  /** 长按。 */
  hold(path: string, ms: number): Promise<void>;
  /** 拖拽。 */
  drag(path: string, dx: number, dy: number): Promise<void>;
  /** 滑动。 */
  swipe(path: string, dx: number, dy: number): Promise<void>;
  /** 双指缩放。 */
  pinch(path: string, scale: number): Promise<void>;
  /** 滚轮。 */
  wheel(path: string, dy: number): Promise<void>;
  /** 按键。 */
  key(name: string): Promise<void>;
  /** 读文字。 */
  text(path: string): string;
  /** 是否显示。 */
  visible(path: string): boolean;
  /** 是否可用。 */
  enabled(path: string): boolean;
  /** 控制器当前页。 */
  page(path: string): string;
  /** 列表项数。 */
  items(path: string): number;
  /** 模拟屏幕尺寸（旋转）。 */
  setScreen(width: number, height: number): Promise<void>;
  /** 切换语言。 */
  setLanguage(language: string): Promise<void>;
  /** 切换输入设备。 */
  setInputType(type: InputType): void;
  /** 让假时钟往前走。 */
  advance(ms: number): Promise<void>;
  /** 当前快照。 */
  snapshot(): Snapshot;
  /** 关闭所有界面，检查监听和定时器都已清理。 */
  end(): void;
}

/** 打开界面时的选项。 */
export interface OpenOptions<V> {
  /** 这个界面关闭时调用；没交回东西时参数是 undefined。 */
  onClose?: (result: ResultOf<V> | undefined) => void;
}

const event = <P>(name: string): EventDef<P> => ({name});

export const lgui = {
  /** 定义入口。 */
  app(definition: AppDefinition): AppDefinition { return definition; },

  /** 定义一个 Model：初始数据加规则。 */
  Model<State extends object, Rules extends object = Record<never, never>>(initial: State, rules?: (set: (partial: Partial<State>) => void, get: () => State) => Rules): Model<State, Rules> {
    void initial; void rules;
    return todo('lgui.Model');
  },

  /** 把一个请求包一层，自带状态。 */
  request<Args extends unknown[], T>(run: (...args: Args) => Promise<T>): Request<Args, T> { void run; return todo('lgui.request'); },

  /** 拿一个在 main.ts（或测试）里注册的服务。 */
  service<T>(name: string): T { void name; return todo('lgui.service'); },

  /** UIManager。 */
  ui: {
    /** 压栈打开。 */
    open<V extends ViewClass>(view: V, params?: ParamsOf<V>, options?: OpenOptions<V>): Promise<InstanceType<V>> { void view; void params; void options; return todo('lgui.ui.open'); },
    /** 替换当前栈顶。 */
    replace<V extends ViewClass>(view: V, params?: ParamsOf<V>): Promise<InstanceType<V>> { void view; void params; return todo('lgui.ui.replace'); },
    /** 关闭，可以顺带交回 static result 声明的东西。 */
    close<V extends ViewClass>(view: V, result?: ResultOf<V>): void { void view; void result; todo('lgui.ui.close'); },
    /** 和按返回键一样。 */
    back(): void { todo('lgui.ui.back'); },
    /** 一直关到指定界面。 */
    popTo(view: ViewClass): void { void view; todo('lgui.ui.popTo'); },
    /** 关闭某一层的全部界面。 */
    closeAll(layer: Layer): void { void layer; todo('lgui.ui.closeAll'); },
    /** 有没有打开。 */
    isOpen(view: ViewClass): boolean { void view; return todo('lgui.ui.isOpen'); },
    /** 已经打开的实例。 */
    get<V extends ViewClass>(view: V): InstanceType<V> | undefined { void view; return todo('lgui.ui.get'); },
    /** 最上层的界面，或某一层最上面的界面。 */
    top(layer?: Layer): object | undefined { void layer; return todo('lgui.ui.top'); },
    /** 某一层的全部界面，按栈的顺序。 */
    list(layer: Layer): object[] { void layer; return todo('lgui.ui.list'); },
    /** 控件在设计尺寸下的位置和大小，只读。 */
    find(path: string): Rect | null { void path; return todo('lgui.ui.find'); }
  },

  /** 短提示（文本键）。 */
  toast(key: string, params?: Record<string, string | number>): void { void key; void params; todo('lgui.toast'); },
  /** 确认框，参数都是文本键。 */
  confirm(options: {title: string; message: string; ok?: string; cancel?: string; params?: Record<string, string | number>}): Promise<boolean> { void options; return todo('lgui.confirm'); },
  /** 加载中，按次数计数。 */
  loading: {
    /** 显示。 */
    show(): void { todo('lgui.loading.show'); },
    /** 隐藏（最后一次才真正隐藏）。 */
    hide(): void { todo('lgui.loading.hide'); }
  },
  /** 红点。 */
  redDot: {
    /** 点亮（true 或数字）或熄灭（false）。 */
    set(path: string, value: boolean | number): void { void path; void value; todo('lgui.redDot.set'); },
    /** 当前值（数字是合计）。 */
    get(path: string): boolean | number { void path; return todo('lgui.redDot.get'); }
  },
  /** 取文本，占位符写成 {count}。 */
  t(key: string, params?: Record<string, string | number>): string { void key; void params; return todo('lgui.t'); },
  /** 切换语言。 */
  setLanguage(language: string): Promise<void> { void language; return todo('lgui.setLanguage'); },
  /** 当前语言。 */
  language(): string { return todo('lgui.language'); },
  /** 时间。 */
  time: {
    /** 当前时间（毫秒，和服务器对齐过）。 */
    now(): number { return todo('lgui.time.now'); },
    /** 设置和服务器的时间差。 */
    setServerOffset(ms: number): void { void ms; todo('lgui.time.setServerOffset'); }
  },
  /** 声明一个事件。 */
  defineEvent<P>(name: string): EventDef<P> { return event<P>(name); },
  /** 广播一个事件。 */
  emit<P>(definition: EventDef<P>, payload: P): void { void definition; void payload; todo('lgui.emit'); },
  /** 框架自己的事件。 */
  events: {
    /** 界面打开了。 */
    viewOpened: event<ViewEvent>('viewOpened'),
    /** 界面关闭了。 */
    viewClosed: event<ViewEvent>('viewClosed'),
    /** 界面被全屏界面盖住了。 */
    viewCovered: event<ViewEvent>('viewCovered'),
    /** 界面重新露出来了。 */
    viewRevealed: event<ViewEvent>('viewRevealed'),
    /** 屏幕方向变了。 */
    orientationChange: event<{orientation: Orientation}>('orientationChange'),
    /** 语言变了。 */
    languageChange: event<{language: string}>('languageChange'),
    /** 输入设备类型变了。 */
    inputTypeChange: event<{inputType: InputType}>('inputTypeChange'),
    /** 激活界面的输入模式变了（游戏场景代码收听它）。 */
    inputModeChange: event<{inputMode: InputMode}>('inputModeChange')
  },
  /** 平台服务里给游戏代码用的部分。 */
  platform: {
    /** 网络（只在 Service 里用）。 */
    get net(): NetService { return todo('lgui.platform.net'); },
    /** 本地存储。 */
    get storage(): StorageService { return todo('lgui.platform.storage'); }
  },
  /** 调试。 */
  debug: {
    /** 当前的界面栈、监听、定时器、已加载的包。 */
    snapshot(): Snapshot { return todo('lgui.debug.snapshot'); }
  },
  /** 测试（只在 lgui test 里能用）。 */
  testing: {
    /** 用 headless 后端和假时钟启动。 */
    start(app: AppDefinition, options?: {services?: Record<string, () => object>; language?: string; screen?: {width: number; height: number}}): Promise<TestHarness> { void app; void options; return todo('lgui.testing.start'); }
  }
};
