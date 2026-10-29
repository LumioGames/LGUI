// 通用弹窗：lgui.toast、lgui.confirm、lgui.loading。用 Common 包里的 Toast、Confirm、Loading 组件。
import type {UIButton, UIComponent, UIText} from '../core/index';
import type {Bind, Keys} from './types';
import {View} from './view';
import {t} from './i18n';
import {runtime} from './runtime';
import type {UIManager} from './ui/manager';
import {requestHooks} from './request';
import {LgRuntimeError} from '../core/index';

const TOAST_MS = 2000;

interface ToastUI { readonly __component: 'Common/Toast'; text: UIText }
interface ConfirmUI { readonly __component: 'Common/Confirm'; title: UIText; message: UIText; ok: UIButton; cancel: UIButton }
interface LoadingUI { readonly __component: 'Common/Loading'; text: UIText }

const text = (component: UIComponent | null, name: string): UIText | null => component?.child(name) as UIText | null;

/** 短提示：放在 toast 层，不挡输入，2 秒后自动关掉。 */
class ToastView extends View<ToastUI> {
  static component = 'Common/Toast';
  static layer = 'toast' as const;
  onOpen(params: {message: string}): void {
    const label = text(this.__component, 'text');
    if (label) label.text = params.message;
    this.after(TOAST_MS, () => manager().close(ToastView));
  }
}

/** 确认框：放在 modal 层，排队。 */
class ConfirmView extends View<ConfirmUI> {
  static component = 'Common/Confirm';
  static layer = 'modal' as const;
  keys: Keys = {back: () => manager().close(ConfirmView, false), confirm: {do: () => manager().close(ConfirmView, true)}};
  onOpen(params: {title: string; message: string; ok?: string; cancel?: string}): void {
    const c = this.__component;
    const title = text(c, 'title');
    const message = text(c, 'message');
    if (title) title.text = params.title;
    if (message) message.text = params.message;
    const ok = c?.child('ok') as UIButton | null;
    const cancel = c?.child('cancel') as UIButton | null;
    if (ok && params.ok) ok.title = params.ok;
    if (cancel && params.cancel) cancel.title = params.cancel;
  }
  bind: Bind<ConfirmUI> = {ok: {click: () => manager().close(ConfirmView, true)}, cancel: {click: () => manager().close(ConfirmView, false)}};
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

/** 内部用：启动时登记 loading 为「不排队的 modal」，并接上请求失败的统一提示。 */
export function setupCommonViews(ui: UIManager): void {
  ui.overlays.add(LoadingView);
  loadingCount = 0;
  requestHooks.onError = error => toast('lgui.requestFailed', {code: error.code});
}

/** 短提示（文本键）。同一时间只显示一条，新的替换旧的。 */
export function toast(key: string, params?: Record<string, string | number>): void {
  const ui = manager();
  ui.close(ToastView, undefined, true);
  void ui.open(ToastView, {message: t(key, params)});
}

/** 确认框，参数都是文本键。用户点确定返回 true，点取消或按返回键返回 false。 */
export function confirm(options: {title: string; message: string; ok?: string; cancel?: string; params?: Record<string, string | number>}): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    manager().open(ConfirmView, {
      title: t(options.title, options.params), message: t(options.message, options.params),
      ok: options.ok ? t(options.ok) : undefined, cancel: options.cancel ? t(options.cancel) : undefined
    }, {onClose: result => resolve(result === true)}).catch(reject);
  });
}

let loadingCount = 0;

/** 加载中：按调用次数计数，最后一次 hide 才真正隐藏。 */
export const loading = {
  show(): void {
    loadingCount++;
    if (loadingCount === 1) void manager().open(LoadingView);
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
