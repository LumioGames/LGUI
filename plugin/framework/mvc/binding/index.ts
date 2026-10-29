// 绑定引擎：把 View 的绑定表接到控件上。每个绑定的订阅、手势识别都登记在 scope 里，解绑时一次清掉。
// 词表和写法见 references/mvc-spec.md 第 6.4 节。
import type {UIButton, UIComponent, UIController, UIImage, UIList, UILoader, UIObject, UIProgress, UIText} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import {isPicked} from '../pick';
import type {Scope} from '../scope';
import {runtime} from '../runtime';
import {asActor} from '../actor';
import {inputType} from '../input/input-type';
import {recognize} from '../input/gestures';
import type {GestureHandlers} from '../input/gestures';
import type {InputType} from '../types';
import {bindList} from './list';
import {bindPart} from './part';
import {applyIcon} from './icon';
import {pick} from '../pick';
import {redDots, redDotState} from '../red-dot';
import {renderArtText} from '../art-text';

/** 绑定时要知道的事。 */
export interface BindContext {
  /** 发起动作的界面（View、ItemView 或 PartView 实例）。 */
  owner: object;
  /** 绑定的清理清单。 */
  scope: Scope;
  /** 这个界面现在能不能接收输入（UIManager 提供；只有激活的界面能）。 */
  isActive: () => boolean;
  /** ItemView 里这一项的数据；值写成函数时传给它。 */
  item?: {data: unknown};
  /** 界面名，报错时用。 */
  where: string;
}

type Table = Record<string, Record<string, unknown> | undefined>;

const displayWords = ['text', 'visible', 'enabled', 'icon', 'progress', 'redDot'];
const listWords = ['items', 'item', 'key', 'selected', 'select'];
const actionWords = ['click', 'doubleClick', 'hold', 'drag', 'swipe', 'pinch', 'wheel', 'hover'];
const modifierWords = ['lockWhilePending', 'visibleOn', 'placeholder'];
const controllerWords = ['page', 'change'];

const fail = (code: string, message: string, next: string): never => { throw new LgRuntimeError(code, message, next); };

/** 解析绑定表的键：控件名、控制器名，或者用「.」连起来的路径。 */
function resolve(component: UIComponent, key: string, where: string): {kind: 'controller'; target: UIController} | {kind: 'object'; target: UIObject} {
  const dot = key.lastIndexOf('.');
  const parent = dot < 0 ? component : component.child(key.slice(0, dot));
  const last = dot < 0 ? key : key.slice(dot + 1);
  if (parent && 'controller' in parent) {
    const controller = (parent as UIComponent).controller(last);
    if (controller) return {kind: 'controller', target: controller};
  }
  const target = component.child(key);
  if (!target) fail('LGUI-RT-062', `${where} 的绑定表里写了 ${key}，但组件 ${component.componentName} 里没有这个控件或控制器。`, '用 lgui ui list 查看真实的控件名；改了 ui/ 之后要重新生成。');
  return {kind: 'object', target: target as UIObject};
}

/** 读一个显示类的值：固定值、pick，或者 ItemView 里的函数；变化时重新调用 apply。 */
export function watch<T>(value: unknown, ctx: BindContext, apply: (value: T) => void): void {
  if (isPicked(value)) {
    apply(value.get() as T);
    ctx.scope.add(value.subscribe(() => apply(value.get() as T)));
  } else if (typeof value === 'function' && ctx.item) {
    apply((value as (data: unknown) => T)(ctx.item.data));
  } else {
    apply(value as T);
  }
}

function setText(target: UIObject, text: string, where: string, key: string): void {
  if ('title' in target) (target as UIButton).title = text;
  else if ('text' in target) (target as UIText).text = text;
  else if ((target as UIComponent).componentName === 'Common/ArtText') renderArtText(target as UIComponent, text, `${where} 的 ${key}`);
  else fail('LGUI-RT-063', `${where} 的 ${key} 不能绑定 text（它不是文字、按钮或 ArtText）。`, '换成文字控件，或者去掉 text。');
}

/** 绑定一个控件。 */
function bindObject(component: UIComponent, key: string, target: UIObject, binding: Record<string, unknown>, ctx: BindContext): void {
  for (const word of Object.keys(binding)) {
    if (![...displayWords, ...listWords, ...actionWords, ...modifierWords, 'view'].includes(word)) {
      fail('LGUI-RT-063', `${ctx.where} 的 ${key} 用了词表以外的词 ${word}。`, `能用的词见 references/mvc-spec.md 第 6.4 节。`);
    }
  }
  // 显示
  let visible = true;
  let allowedOn: readonly InputType[] | null = null;
  const applyVisible = (): void => { target.visible = visible && (!allowedOn || allowedOn.includes(inputType.get())); };
  if ('visible' in binding) watch<boolean>(binding.visible, ctx, v => { visible = v; applyVisible(); });
  if ('visibleOn' in binding) {
    allowedOn = binding.visibleOn as readonly InputType[];
    if (!('visible' in binding)) visible = target.visible;
    applyVisible();
    ctx.scope.add(inputType.subscribe(applyVisible));
  }
  let enabled = true;
  let pending = false;
  const applyEnabled = (): void => { target.enabled = enabled && !pending; };
  if ('enabled' in binding) watch<boolean>(binding.enabled, ctx, v => { enabled = v; applyEnabled(); });
  if ('text' in binding) watch<string>(binding.text, ctx, v => setText(target, String(v), ctx.where, key));
  if ('icon' in binding) {
    if (!('url' in target) && !('icon' in target)) fail('LGUI-RT-063', `${ctx.where} 的 ${key} 不能绑定 icon（它不是加载器或按钮）。`, '换成加载器，或者去掉 icon。');
    watch<string>(binding.icon, ctx, v => applyIcon(target as UILoader | UIButton, v, binding.placeholder as string | undefined, ctx));
  }
  if ('progress' in binding) {
    if (!('max' in target)) fail('LGUI-RT-063', `${ctx.where} 的 ${key} 不能绑定 progress（它不是进度条）。`, '换成进度条组件，或者去掉 progress。');
    watch<number>(binding.progress, ctx, v => { const bar = target as UIProgress; bar.value = (Math.max(0, Math.min(100, v)) / 100) * bar.max; });
  }
  if ('redDot' in binding) {
    const dot = 'child' in target ? (target as UIComponent).child('redDot') : null;
    if (!dot) fail('LGUI-UI-012', `${ctx.where} 的 ${key} 绑定了 redDot，但它里面没有名为 redDot 的子控件。`, '在 ui/ 里给这个控件放一个 Common/RedDot 的实例，名字叫 redDot（UI 开发规范第 10 节）。');
    const path = String(binding.redDot);
    watch<{lit: boolean; count: number}>(pick(redDots, () => redDotState(path), s => s), ctx, s => {
      (dot as UIObject).visible = s.lit;
      const count = (dot as UIComponent).child?.('count') as UIText | null;
      if (count && 'text' in count) count.text = s.count > 0 ? String(s.count) : '';
    });
  }
  // 列表、部件
  if (listWords.some(word => word in binding)) {
    if (!('numItems' in target)) fail('LGUI-RT-063', `${ctx.where} 的 ${key} 不是列表，不能用 ${listWords.join('、')}。`, '换成列表控件。');
    bindList(target as UIList, binding, ctx, key);
  }
  if ('view' in binding) {
    if (!('componentName' in target)) fail('LGUI-RT-063', `${ctx.where} 的 ${key} 不是组件，不能用 view。`, '换成子组件。');
    bindPart(target as UIComponent, binding.view, ctx);
  }
  // 动作
  const actions = actionWords.filter(word => word in binding);
  if (actions.length) {
    const lock = binding.lockWhilePending === true;
    const run = (action: unknown, ...args: unknown[]): void => {
      if (!ctx.isActive() || pending || !target.enabled) return;
      const sound = runtime().config.sounds.click;
      if (sound && action === binding.click) runtime().backend.platform.audio.play(sound);
      const result = asActor(ctx.owner, () => (action as (...a: unknown[]) => unknown)(...args));
      if (lock && result instanceof Promise) {
        pending = true;
        applyEnabled();
        const done = (): void => { pending = false; applyEnabled(); };
        result.then(done, done);
      }
    };
    const handlers: GestureHandlers = {pointer: e => inputType.set(e.pointerType === 'mouse' ? 'keyboardMouse' : 'touch')};
    if (binding.click) handlers.click = () => run(binding.click);
    if (binding.doubleClick) handlers.doubleClick = () => run(binding.doubleClick);
    if (binding.hold) {
      const hold = binding.hold as {ms: number; action: () => unknown};
      const bar = 'child' in target ? (target as UIComponent).child('holdProgress') as UIProgress | null : null;
      handlers.hold = {ms: hold.ms, action: () => run(hold.action), progress: ratio => { if (bar && 'max' in bar && ctx.isActive()) bar.value = ratio * bar.max; }};
    }
    if (binding.drag) handlers.drag = g => run(binding.drag, g);
    if (binding.swipe) handlers.swipe = g => run(binding.swipe, g);
    if (binding.pinch) handlers.pinch = g => run(binding.pinch, g);
    if (binding.hover) handlers.hover = inside => run(binding.hover, inside);
    const platform = runtime().backend.platform;
    ctx.scope.add(recognize(target, platform.input, platform.time, handlers));
    if (binding.wheel) ctx.scope.add(platform.input.onWheel(e => run(binding.wheel, {dx: e.deltaX, dy: e.deltaY})));
  } else if (binding.lockWhilePending) {
    fail('LGUI-RT-063', `${ctx.where} 的 ${key} 写了 lockWhilePending，但没有动作。`, '和 click 一起用。');
  }
}

/** 绑定一个控制器：page 显示当前页，change 在用户切页时调用。 */
function bindController(controller: UIController, key: string, binding: Record<string, unknown>, ctx: BindContext): void {
  for (const word of Object.keys(binding)) {
    if (!controllerWords.includes(word)) fail('LGUI-RT-063', `${ctx.where} 的 ${key} 是控制器，只能用 page 和 change，不能用 ${word}。`, '控制器只写 page 和 change。');
  }
  let setting = false;
  if ('page' in binding) watch<string>(binding.page, ctx, page => { setting = true; try { controller.selectedPage = page; } finally { setting = false; } });
  if (binding.change) {
    const change = binding.change as (page: string) => unknown;
    ctx.scope.add(controller.onChange(page => { if (!setting && ctx.isActive()) asActor(ctx.owner, () => change(page)); }));
  }
}

/** 把一张绑定表接到组件上。 */
export function applyBindings(component: UIComponent, table: Table, ctx: BindContext): void {
  for (const [key, binding] of Object.entries(table)) {
    if (!binding) continue;
    const resolved = resolve(component, key, ctx.where);
    if (resolved.kind === 'controller') bindController(resolved.target, key, binding, ctx);
    else bindObject(component, key, resolved.target, binding, ctx);
  }
}

export type {UIImage};
