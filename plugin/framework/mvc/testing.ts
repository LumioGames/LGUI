// lgui.testing：只在 lgui test 里能用。用 headless 后端和假时钟启动 app，提供模拟操作和读控件属性。
// 路径写成「包/组件.控件路径」，列表子项用 list[序号]。
import type {Backend, Insets, UIComponent, UIController, UIList, UIObject, UIText, UIButton} from '../core/index';
import {LgRuntimeError} from '../core/index';
import type {AppDefinition, Snapshot, TestHarness} from './lgui';
import type {InputType, ParamsOf, ViewClass} from './types';
import type {RuntimeConfig} from './runtime';
import type {TextTable} from './i18n';
import {boot} from './boot';
import {inputType} from './input/input-type';
import type {UIManager} from './ui/manager';
import {snapshot} from './snapshot';
import {artTextOf} from './art-text';

/** lgui test 注入的测试环境（由生成的 .lgui/build/test/env.ts 设置）。 */
interface TestEnv {
  createBackend(): Backend & {state: {screen: {width: number; height: number}}};
  sim: Record<string, (...args: never[]) => Promise<void> | void>;
  deps: Record<string, string[]>;
  config: RuntimeConfig;
  texts: Record<string, TextTable>;
  /** 每个测试结束后记下当前快照（失败时 lgui test 附上它）。 */
  current: {snapshot(): Snapshot} | null;
}

type Sim = {
  click(b: Backend, o: UIObject, holdMs?: number, pointerType?: string): Promise<void>;
  doubleClick(b: Backend, o: UIObject): Promise<void>;
  hold(b: Backend, o: UIObject, ms: number): Promise<void>;
  drag(b: Backend, o: UIObject, dx: number, dy: number): Promise<void>;
  dragTo(b: Backend, from: UIObject, to: UIObject): Promise<void>;
  swipe(b: Backend, o: UIObject, dx: number, dy: number): Promise<void>;
  pinch(b: Backend, o: UIObject, scale: number): Promise<void>;
  wheel(b: Backend, o: UIObject, dy: number): Promise<void>;
  key(b: Backend, name: string): Promise<void>;
  setScreen(b: Backend, w: number, h: number): Promise<void>;
  setSafeArea(b: Backend, insets: Insets): Promise<void>;
  advance(b: Backend, ms: number): Promise<void>;
};

const env = (): TestEnv => {
  const found = (globalThis as {__lguiTest?: TestEnv}).__lguiTest;
  if (!found) throw new LgRuntimeError('LGUI-RT-110', 'lgui.testing 只能在 lgui test 里用。', '用 lgui test 跑 tests/ 里的测试。');
  return found;
};

class Harness implements TestHarness {
  constructor(private readonly backend: Backend, private readonly ui: UIManager, private readonly sim: Sim) {}

  /** 按路径找控件：「包/组件.控件路径」，列表子项写 list[序号]。 */
  private resolve(path: string): {object: UIObject | null; parent: UIComponent | null; last: string} {
    const dot = path.indexOf('.');
    const componentName = (dot < 0 ? path : path.slice(0, dot)).replace(/@portrait$/, '');
    const entry = this.ui.all().find(e => e.state === 'open' && e.cls.component === componentName && e.component);
    if (!entry || !entry.component) throw new LgRuntimeError('LGUI-RT-111', `${componentName} 没有打开（路径 ${path}）。`, '先用 t.open(View) 打开它，或者检查组件名。');
    if (dot < 0) return {object: entry.component, parent: null, last: ''};
    let current: UIObject = entry.component;
    let parent: UIComponent | null = null;
    let last = '';
    for (const part of path.slice(dot + 1).split('.')) {
      const match = /^(\w+)(?:\[(\d+)\])?$/.exec(part);
      if (!match) throw new LgRuntimeError('LGUI-RT-111', `路径 ${path} 写法不对。`, '写成 包/组件.控件.子控件，列表子项写 list[序号]。');
      parent = current as UIComponent;
      last = match[1];
      const next = 'child' in current ? (current as UIComponent).child(match[1]) : null;
      if (!next) return {object: null, parent, last};
      current = next;
      if (match[2] !== undefined) {
        const item = (current as UIList).itemAt(Number(match[2]));
        if (!item) throw new LgRuntimeError('LGUI-RT-111', `列表 ${match[1]} 没有第 ${match[2]} 项（路径 ${path}）。`, '检查列表的数据。');
        parent = current as unknown as UIComponent;
        current = item;
      }
    }
    return {object: current, parent, last};
  }

  private object(path: string): UIObject {
    const {object} = this.resolve(path);
    if (!object) throw new LgRuntimeError('LGUI-RT-111', `找不到控件 ${path}。`, '用 lgui ui list 查看真实的控件路径。');
    return object;
  }

  async open<V extends ViewClass>(view: V, params?: ParamsOf<V>): Promise<InstanceType<V>> {
    const { lgui } = await import('./lgui');
    return lgui.ui.open(view, params);
  }
  click(path: string): Promise<void> { return this.sim.click(this.backend, this.object(path), 50, inputType.get() === 'touch' ? 'touch' : 'mouse'); }
  hold(path: string, ms: number): Promise<void> { return this.sim.hold(this.backend, this.object(path), ms); }
  drag(path: string, dx: number, dy: number): Promise<void> { return this.sim.drag(this.backend, this.object(path), dx, dy); }
  dragTo(from: string, to: string): Promise<void> { return this.sim.dragTo(this.backend, this.object(from), this.object(to)); }
  swipe(path: string, dx: number, dy: number): Promise<void> { return this.sim.swipe(this.backend, this.object(path), dx, dy); }
  pinch(path: string, scale: number): Promise<void> { return this.sim.pinch(this.backend, this.object(path), scale); }
  wheel(path: string, dy: number): Promise<void> { return this.sim.wheel(this.backend, this.object(path), dy); }
  key(name: string): Promise<void> { return this.sim.key(this.backend, name); }
  text(path: string): string {
    const o = this.object(path);
    if ('title' in o) return (o as UIButton).title;
    if ('componentName' in o && (o as UIComponent).componentName === 'Common/ArtText') return artTextOf(o as UIComponent) ?? '';
    if ('text' in o) return (o as UIText).text;
    throw new LgRuntimeError('LGUI-RT-111', `${path} 不是文字或按钮，读不了文字。`, '换一个文字控件的路径。');
  }
  visible(path: string): boolean { return this.object(path).visible; }
  enabled(path: string): boolean { return this.object(path).enabled; }
  page(path: string): string {
    const {parent, last} = this.resolve(path);
    const controller: UIController | null = parent ? parent.controller(last) : null;
    if (!controller) throw new LgRuntimeError('LGUI-RT-111', `${path} 不是控制器。`, '路径的最后一段写控制器名。');
    return controller.selectedPage;
  }
  items(path: string): number {
    const o = this.object(path);
    if (!('numItems' in o)) throw new LgRuntimeError('LGUI-RT-111', `${path} 不是列表。`, '换一个列表的路径。');
    return (o as UIList).numItems;
  }
  /** 换屏幕尺寸，等防抖（150 毫秒）结束、换版完成后返回。 */
  async setScreen(width: number, height: number): Promise<void> { await this.sim.setScreen(this.backend, width, height); await this.sim.advance(this.backend, 200); }
  /** 换安全区（屏幕像素的边距），等重新摆放完成后返回。 */
  async setSafeArea(insets: Insets): Promise<void> { await this.sim.setSafeArea(this.backend, insets); await this.sim.advance(this.backend, 200); }
  async setLanguage(language: string): Promise<void> {
    const {lgui} = await import('./lgui');
    await lgui.setLanguage(language);
  }
  setInputType(type: InputType): void { inputType.set(type); }
  advance(ms: number): Promise<void> { return this.sim.advance(this.backend, ms); }
  snapshot(): Snapshot { return snapshot(this.ui); }
  end(): void {
    // 关闭时钩子里又打开的界面（比如 onClose 里弹 toast）也关掉：一直关到没有界面为止，最多 10 轮。
    for (let round = 0; round < 10 && this.ui.all().length; round++) {
      for (const layer of ['toast', 'modal', 'popup', 'page', 'hud'] as const) this.ui.closeAll(layer);
    }
    const left = this.snapshot();
    const leaked = left.views.length || left.packages.length;
    if (leaked) throw new LgRuntimeError('LGUI-RT-112', `关闭所有界面后还有没清理的东西：${JSON.stringify({views: left.views, packages: left.packages})}。`, '检查是不是有界面没走 lgui.ui 关闭，或者在框架外面加了监听。');
  }
}

/** lgui.testing.start(app, 选项?)。 */
export async function startTest(app: AppDefinition, options: {services?: Record<string, () => object>; language?: string; screen?: {width: number; height: number}} = {}): Promise<TestHarness> {
  const e = env();
  const backend = e.createBackend();
  await backend.init({projectName: e.config.name, defaultFont: null, uiBase: ''});
  if (options.screen) backend.state.screen = {...options.screen};
  inputType.set('keyboardMouse');
  const ui = await boot(backend, app, e.config, e.deps, {texts: e.texts, language: options.language ?? e.config.defaultLanguage, services: options.services, wallBase: Date.UTC(2026, 0, 1)});
  const harness = new Harness(backend, ui, e.sim as unknown as Sim);
  e.current = harness;
  return harness;
}
