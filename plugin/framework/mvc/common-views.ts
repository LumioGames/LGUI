// 通用弹窗：lgui.toast、lgui.confirm、lgui.loading。用 Common 包里的 Toast、Confirm、Loading 组件。
// 文字都写在绑定表里（每次绑定时按当前语言取文本），旋转、换语言重建组件后照样显示、并换成新语言。
import type {UIButton, UIText} from '../core/index';
import type {Bind, Keys, Readable} from './types';
import {View} from './view';
import {t} from './i18n';
import {pick} from './pick';
import {runtime} from './runtime';
import type {UIManager} from './ui/manager';
import {requestHooks} from './request';
import {LgRuntimeError} from '../core/index';

const TOAST_MS = 2000;

interface ToastUI { readonly __component: 'Common/Toast'; text: UIText }
interface ConfirmUI { readonly __component: 'Common/Confirm'; title: UIText; message: UIText; ok: UIButton; cancel: UIButton }
interface LoadingUI { readonly __component: 'Common/Loading'; text: UIText }

type Params = Record<string, string | number>;

/** 一段要翻译的文字：每次绑定（打开、旋转、换语言）时按当前语言重新取。 */
const unchanging: Readable<null> = {get: () => null, subscribe: () => () => {}};
const translated = (key: string, params?: Params) => pick(unchanging, () => t(key, params));

/** 框架自己关掉的（LGUI-RT-081）不算错误，别的错误照常抛出。 */
const cancelledByFramework = (error: unknown): boolean => error instanceof LgRuntimeError && error.code === 'LGUI-RT-081';
const ignoreCancelled = (error: unknown): void => { if (!cancelledByFramework(error)) throw error; };

// 新建的 View 实例在构造时取走自己要显示的内容（UIManager 用 new cls() 创建，不带参数）。
let nextToast: {key: string; params?: Params} = {key: ''};

/** 短提示：放在 toast 层，不挡输入，2 秒后自动关掉。 */
class ToastView extends View<ToastUI> {
  static component = 'Common/Toast';
  static layer = 'toast' as const;
  private readonly request = nextToast;
  bind: Bind<ToastUI> = {text: {text: translated(this.request.key, this.request.params)}};
  onOpen(): void { this.after(TOAST_MS, () => manager().close(ToastView)); }
}

/** 一次 lgui.confirm。 */
interface ConfirmRequest {
  options: {title: string; message: string; ok?: string; cancel?: string; params?: Params};
  resolve(ok: boolean): void;
  reject(error: unknown): void;
}

/** 确认框的队列：第一个正在显示（或正在打开），后面的等它答完。 */
const confirms: ConfirmRequest[] = [];
let nextConfirm: ConfirmRequest | null = null;

/** 确认框：放在 modal 层，一次只显示一个。 */
class ConfirmView extends View<ConfirmUI> {
  static component = 'Common/Confirm';
  static layer = 'modal' as const;
  private readonly request = nextConfirm as ConfirmRequest;
  /** 用户的回答；被代码关掉时是 null。 */
  private answer: boolean | null = null;
  keys: Keys = {back: () => this.choose(false), confirm: {do: () => this.choose(true)}};
  bind: Bind<ConfirmUI> = confirmBindings(this.request.options, ok => this.choose(ok));
  private choose(ok: boolean): void {
    this.answer = ok;
    manager().close(ConfirmView);
  }
  onClose(): void { confirmClosed(this.request, this.answer); }
}

function confirmBindings(o: ConfirmRequest['options'], choose: (ok: boolean) => void): Bind<ConfirmUI> {
  // ok、cancel 只在调用方传了自己的文字时才绑 text，否则用 ui/ 里的。
  return {
    title: {text: translated(o.title, o.params)},
    message: {text: translated(o.message, o.params)},
    ok: {click: () => choose(true), ...(o.ok ? {text: translated(o.ok, o.params)} : {})},
    cancel: {click: () => choose(false), ...(o.cancel ? {text: translated(o.cancel, o.params)} : {})}
  };
}

/** 队列里的确认框全部当 false。 */
function cancelConfirms(): void {
  for (const request of confirms.splice(0)) request.resolve(false);
}

/** 显示队列里的第一个确认框。 */
function showConfirm(): void {
  const request = confirms[0];
  if (!request) return;
  let opening: Promise<object>;
  nextConfirm = request;
  try {
    opening = manager().open(ConfirmView);
  } catch (error) {
    opening = Promise.reject(error);
  } finally {
    nextConfirm = null;
  }
  opening.catch((error: unknown) => {
    if (confirms[0] !== request) return; // 已经有结果了（比如重新启动时清掉了）
    // 在排队或打开的路上被关掉：它和后面的都当 false。打开失败：这一个报错，接着显示下一个。
    if (cancelledByFramework(error)) { cancelConfirms(); return; }
    confirms.shift();
    request.reject(error);
    showConfirm();
  });
}

/** 确认框关掉了：用户答了就交回答案并显示下一个；被代码关掉（closeAll、popTo、close）就全部当 false。 */
function confirmClosed(request: ConfirmRequest, answer: boolean | null): void {
  if (confirms[0] !== request) return;
  if (answer === null) { cancelConfirms(); return; }
  confirms.shift();
  request.resolve(answer);
  showConfirm();
}

/** 加载中：放在 modal 层，不进队列，盖在最上面。 */
class LoadingView extends View<LoadingUI> {
  static component = 'Common/Loading';
  static layer = 'modal' as const;
  keys: Keys = {back: 'none'};
}

const manager = (): UIManager => {
  const ui = runtime().ui as UIManager | null;
  if (!ui) throw new LgRuntimeError('LGUI-RT-050', '框架还没启动。', '用 lgui dev 预览，或者在测试里先调用 lgui.testing.start(app)。');
  return ui;
};

/** 内部用：启动时登记 loading 为「不排队的 modal」，并接上请求失败的统一提示；还没答的确认框都当 false。 */
export function setupCommonViews(ui: UIManager): void {
  ui.overlays.add(LoadingView);
  loadingCount = 0;
  cancelConfirms();
  requestHooks.onError = error => toast('lgui.requestFailed', {code: error.code});
}

/** 短提示（文本键）。同一时间只显示一条，新的替换旧的。 */
export function toast(key: string, params?: Params): void {
  const ui = manager();
  ui.close(ToastView, undefined, true);
  nextToast = {key, params};
  void ui.open(ToastView).catch(ignoreCancelled);
}

/** 确认框，参数都是文本键。用户点确定返回 true，点取消或按返回键返回 false；被代码关掉或取消也返回 false。一次只显示一个，后来的排队。 */
export function confirm(options: ConfirmRequest['options']): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    manager();
    confirms.push({options, resolve, reject});
    if (confirms.length === 1) showConfirm();
  });
}

let loadingCount = 0;

/** 加载中：按调用次数计数，最后一次 hide 才真正隐藏。 */
export const loading = {
  show(): void {
    loadingCount++;
    if (loadingCount === 1) void manager().open(LoadingView).catch(ignoreCancelled);
  },
  hide(): void {
    if (loadingCount === 0) return;
    loadingCount--;
    if (loadingCount === 0) manager().close(LoadingView, undefined, true);
  },
  /** 当前计数（测试用）。 */
  get count(): number { return loadingCount; }
};

export {ToastView, ConfirmView, LoadingView};
