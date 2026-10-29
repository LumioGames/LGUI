// UIManager：5 层、界面栈、激活和遮挡、打开和关闭、onClose。规则见方案 5.10 和 references/mvc-spec.md 第 9、10 节。
import type {Backend, Rect, UIComponent} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {InputMode, Layer, Orientation, ViewClass} from '../types';
import type {UIList, UIObject} from '../../core/index';
import {orientationState} from './orientation-state';
import {HintBar, canCreateHintBar, hintsFor} from './hint-bar';
import {actionForKey} from '../input/keys';
import {inputType} from '../input/input-type';
import type {KeyInput} from '../../core/index';
import {validateViewClass} from '../view';
import {asActor, currentActor} from '../actor';
import {bus, builtinEvents} from '../events';

/** 从下到上的 5 层。 */
export const LAYERS: readonly Layer[] = ['hud', 'page', 'popup', 'modal', 'toast'];

/** 方向相关的工程配置。 */
export interface OrientationSettings {
  designSize: {landscape: {width: number; height: number}; portrait: {width: number; height: number}};
  orientation: 'both' | 'landscape' | 'portrait';
  /** 界面缓存：最近关掉的 N 个界面不销毁，再打开时直接复用组件。默认 0。 */
  uiCache?: {keepClosedViews: number};
  /** 按平台的「按键 → 动作」。 */
  keyMap?: Record<string, Record<string, string>>;
}

/** 缓存着的、关掉的界面组件（连同它占着的包引用）。 */
interface Cached {
  cls: ViewClass;
  version: string;
  component: UIComponent;
  packages: string[];
}

/** 找出组件里所有列表（不进列表内部），记下滚动位置和选中项，按控件路径。 */
function listStates(component: UIComponent, prefix = ''): Map<string, {scroll: {x: number; y: number}; selected: number}> {
  const states = new Map<string, {scroll: {x: number; y: number}; selected: number}>();
  for (const name of component.childNames()) {
    const child = component.child(name) as UIObject | null;
    if (!child) continue;
    const path = prefix + name;
    if ('numItems' in child) states.set(path, {scroll: {...(child as UIList).scrollPosition}, selected: (child as UIList).selectedIndex});
    else if ('childNames' in child) for (const [k, v] of listStates(child as UIComponent, path + '.')) states.set(k, v);
  }
  return states;
}

function restoreLists(component: UIComponent, states: Map<string, {scroll: {x: number; y: number}; selected: number}>): void {
  for (const [path, state] of states) {
    const list = component.child(path) as UIList | null;
    if (!list || !('numItems' in list)) continue;
    list.selectedIndex = state.selected;
    list.scrollPosition = state.scroll;
  }
}

type Hook = 'onOpen' | 'onActivate' | 'onDeactivate' | 'onCovered' | 'onRevealed' | 'onClose' | 'onOrientationChange';

/** View 实例在框架里需要的部分。 */
interface ViewInstance {
  __mount(component: UIComponent, options: {isActive: () => boolean}): void;
  __dispose(): void;
  __timers: {pause(): void; resume(): void; size: number};
  __listeners: number;
  keys: Record<string, unknown>;
}

/** 一个打开的（或正在打开的）界面。 */
export interface Entry {
  cls: ViewClass;
  view: ViewInstance;
  layer: Layer;
  fullScreen: boolean;
  component: UIComponent | null;
  /** 当前用的是哪一版组件（组件名，竖版带 @portrait）。 */
  version: string;
  state: 'opening' | 'queued' | 'open' | 'closed';
  active: boolean;
  covered: boolean;
  /** 打开它的界面（在 main.ts 里打开的是 null）。 */
  opener: Entry | null;
  onClose: ((result: unknown) => void) | null;
  packages: string[];
  ready: Promise<ViewInstance>;
  /** 打开时从缓存里取到的组件。 */
  cached?: Cached;
  /** 排队中的 modal：轮到它时调用。 */
  show?: () => void;
}

export class UIManager {
  /** 每层的界面，按栈的顺序（modal 层第一个是正在显示的，后面的在排队）。 */
  readonly stacks: Record<Layer, Entry[]> = {hud: [], page: [], popup: [], modal: [], toast: []};
  private containers = new Map<Layer, UIComponent>();
  private refs = new Map<string, number>();
  private loading = new Map<string, Promise<void>>();
  private visible: Rect;
  private cache: Cached[] = [];
  private hintBar: HintBar | null = null;
  /** 不进 modal 队列、直接盖在最上面的界面（loading）。 */
  readonly overlays = new Set<ViewClass>();
  /** 框架常驻用到的包，永远不释放。 */
  private pinned = new Set<string>();

  /** 当前方向。 */
  orientation: Orientation;

  constructor(private readonly backend: Backend, private readonly deps: Record<string, string[]>, private readonly settings: OrientationSettings) {
    this.orientation = this.decideOrientation();
    orientationState.current = this.orientation;
    this.visible = backend.platform.screen.applyDesignSize(this.design());
    // 屏幕尺寸一变：防抖 150 毫秒（拖动窗口时不来回切换）再判方向、换版。
    // 输入路由：按键只送给激活的界面；输入类型按最近一次输入判断。
    backend.platform.input.onKey(e => this.onKey(e));
    backend.platform.input.onPointer(e => { if (e.type === 'down') inputType.set(e.pointerType === 'mouse' ? 'keyboardMouse' : 'touch'); });
    inputType.subscribe(() => this.updateHints());
    let waiting = 0;
    let stopWaiting: (() => void) | null = null;
    backend.platform.screen.onResize(() => {
      waiting = 0;
      if (stopWaiting) return;
      stopWaiting = backend.platform.time.onFrame(dt => {
        waiting += dt;
        if (waiting < 150) return;
        stopWaiting?.();
        stopWaiting = null;
        this.applyOrientation();
      });
    });
    for (const layer of LAYERS) {
      // 层容器不设尺寸：只是容器，不能挡住下面层的点击（浏览器里一个铺满屏幕的空容器会吃掉所有指针事件）。
      const container = backend.createContainer(layer);
      if (layer === 'toast') container.touchable = false;
      backend.root.addChild(container);
      this.containers.set(layer, container);
    }
  }

  // ---------- 按键和操作提示栏 ----------

  private onKey(e: KeyInput): void {
    if (e.type !== 'down' || e.repeat || this.backend.platform.textInput.isComposing()) return;
    inputType.set('keyboardMouse');
    const action = actionForKey(e.key, this.backend.name, this.settings.keyMap ?? {});
    if (!action || action === 'none') return;
    if (action === 'back') { this.back(); return; }
    const active = this.all().find(x => x.active);
    if (!active) return;
    const def = active.view.keys[action];
    if (def === 'close') this.closeEntry(active);
    else if (typeof def === 'function') asActor(active.view, () => (def as () => unknown)());
    else if (def && typeof def === 'object' && typeof (def as {do?: unknown}).do === 'function') asActor(active.view, () => (def as {do: () => unknown}).do());
  }

  /** 内部用：建操作提示栏（Common 包里有 ActionHintBar 时）。启动时调用。 */
  async startHintBar(): Promise<void> {
    // 提示栏常驻：它用的包算框架自己的（pinned），不计入界面的引用数，也不会被释放。
    try {
      if (!this.backend.platform.resource.hasPackage('Common')) await this.backend.loadPackage('Common');
    } catch {
      return; // 工程里没有 Common 包：不建提示栏（lgui check 会报 LGUI-UI-014）
    }
    if (!canCreateHintBar(this.backend)) return;
    this.pinned.add('Common');
    const component = this.backend.create('Common', 'ActionHintBar');
    component.touchable = false;
    (this.containers.get('toast') as UIComponent).addChild(component);
    this.hintBar = new HintBar(component);
    this.updateHints();
  }

  /** 内部用：重新算操作提示栏的内容（激活界面、输入类型、语言变化时）。 */
  updateHints(): void {
    if (!this.hintBar) return;
    const active = this.all().find(x => x.active);
    const canGoBack = Boolean(active) && !(active?.layer === 'page' && this.shown('page')[0] === active);
    this.hintBar.update(active ? hintsFor(active.view.keys, canGoBack, this.backend.name, this.settings.keyMap ?? {}) : [], this.visible);
  }

  // ---------- 横竖屏 ----------

  /** 宽 ≥ 高就是横屏；工程配置锁定了方向时只用那一版。 */
  private decideOrientation(): Orientation {
    if (this.settings.orientation !== 'both') return this.settings.orientation;
    const {width, height} = this.backend.platform.screen.size();
    return width >= height ? 'landscape' : 'portrait';
  }

  private design(): {width: number; height: number} {
    return this.orientation === 'portrait' ? this.settings.designSize.portrait : this.settings.designSize.landscape;
  }

  /** 当前方向用哪一版组件：竖屏时有 @portrait 版本就用它。 */
  private versionOf(cls: ViewClass): string {
    const [pkg, name] = cls.component.split('/');
    return this.orientation === 'portrait' && this.backend.has(pkg, `${name}@portrait`) ? `${name}@portrait` : name;
  }

  /** 按层和是否全屏摆放界面。 */
  private place(entry: Entry, component: UIComponent): void {
    if (entry.fullScreen) component.rect = {x: 0, y: 0, width: this.visible.width, height: this.visible.height};
    else if (entry.layer === 'popup' || entry.layer === 'modal' || entry.layer === 'toast') {
      const r = component.rect;
      component.rect = {x: Math.round((this.visible.width - r.width) / 2), y: Math.round((this.visible.height - r.height) / 2), width: r.width, height: r.height};
    }
  }

  /** 内部用：现在就按屏幕尺寸判方向并换版（平时由尺寸变化触发，测试里可以直接调用）。 */
  applyOrientation(): void {
    const next = this.decideOrientation();
    const changed = next !== this.orientation;
    this.orientation = next;
    orientationState.current = next;
    this.visible = this.backend.platform.screen.applyDesignSize(this.design());
    for (const entry of this.all()) {
      if (entry.state !== 'open' || !entry.component) continue;
      const [pkg] = entry.cls.component.split('/');
      const version = this.versionOf(entry.cls);
      if (version !== entry.version) {
        // 换版：记下列表的滚动位置和选中项，建另一版组件，用同一个 View 实例重新绑定，再恢复。
        const lists = listStates(entry.component);
        const old = entry.component;
        const component = this.backend.create(pkg, version);
        entry.component = component;
        entry.version = version;
        this.place(entry, component);
        component.visible = !entry.covered;
        component.touchable = entry.active;
        (this.containers.get(entry.layer) as UIComponent).addChild(component);
        entry.view.__mount(component, {isActive: () => entry.active && entry.state === 'open'});
        restoreLists(component, lists);
        old.dispose();
      } else {
        this.place(entry, entry.component);
      }
      if (changed) this.hook(entry, 'onOrientationChange', next);
    }
    // 换版的组件是后加进去的，按栈的顺序重新排一遍，层内的上下关系不变。
    for (const layer of LAYERS) {
      const container = this.containers.get(layer) as UIComponent;
      for (const entry of this.stacks[layer]) if (entry.component) { container.removeChild(entry.component); container.addChild(entry.component); }
    }
    this.updateHints();
    if (changed) bus.emit(builtinEvents.orientationChange, {orientation: next});
  }

  // ---------- 资源：按需加载界面包（连同它依赖的包），记录有几个界面在用 ----------

  private packagesOf(pkg: string, seen = new Set<string>()): string[] {
    if (seen.has(pkg)) return [];
    seen.add(pkg);
    return [...(this.deps[pkg] ?? []).flatMap(dep => this.packagesOf(dep, seen)), pkg];
  }

  private async acquire(packages: string[]): Promise<void> {
    for (const pkg of packages) this.refs.set(pkg, (this.refs.get(pkg) ?? 0) + 1);
    for (const pkg of packages) {
      if (this.backend.platform.resource.hasPackage(pkg)) continue;
      let pending = this.loading.get(pkg);
      if (!pending) { pending = this.backend.loadPackage(pkg).finally(() => this.loading.delete(pkg)); this.loading.set(pkg, pending); }
      await pending;
    }
  }

  private release(packages: string[]): void {
    for (const pkg of [...packages].reverse()) {
      const left = (this.refs.get(pkg) ?? 0) - 1;
      if (left > 0) { this.refs.set(pkg, left); continue; }
      this.refs.delete(pkg);
      if (!this.pinned.has(pkg)) this.backend.releasePackage(pkg);
    }
  }

  /** 已加载的包和引用数。 */
  packageRefs(): {name: string; refs: number}[] { return [...this.refs].map(([name, refs]) => ({name, refs})); }

  // ---------- 查询 ----------

  all(): Entry[] { return LAYERS.flatMap(layer => this.stacks[layer]); }
  entryOf(cls: ViewClass): Entry | undefined { return this.all().find(e => e.cls === cls && e.state !== 'closed'); }
  private entryOfInstance(instance: object | null): Entry | null { return instance ? this.all().find(e => e.view === instance) ?? null : null; }
  /** 正在显示的界面（不含排队中的 modal、正在打开的）。 */
  shown(layer: Layer): Entry[] { return this.stacks[layer].filter(e => e.state === 'open'); }
  top(layer?: Layer): Entry | undefined {
    // 不指定层时不算 toast（短暂提示，不接收输入）。
    for (const l of layer ? [layer] : (['modal', 'popup', 'page', 'hud'] as const)) {
      const list = this.shown(l);
      if (list.length) return list[list.length - 1];
    }
    return undefined;
  }

  // ---------- 激活与遮挡 ----------

  private hook(entry: Entry, name: Hook, arg?: unknown): void {
    const fn = (entry.view as unknown as Record<string, unknown>)[name];
    if (typeof fn === 'function') asActor(entry.view, () => (fn as (a?: unknown) => void).call(entry.view, arg));
  }

  /** 重新计算谁是激活的、谁被盖住了。 */
  private refresh(): void {
    // 激活：所有层合起来最上面那个可交互的界面（toast 不参与）。modal 打开时下面所有层都停用。
    let active: Entry | undefined;
    for (const layer of ['modal', 'popup', 'page', 'hud'] as const) {
      const list = this.shown(layer);
      if (list.length) { active = list[list.length - 1]; break; }
    }
    // 遮挡：全屏界面盖住它下面的所有界面（包括下面层的）。
    const ordered = (['hud', 'page', 'popup', 'modal'] as const).flatMap(layer => this.shown(layer));
    let coveredBelow = -1;
    ordered.forEach((e, i) => { if (e.fullScreen) coveredBelow = i; });
    const deactivated: Entry[] = [];
    const activated: Entry[] = [];
    ordered.forEach((e, i) => {
      const covered = i < coveredBelow;
      if (covered !== e.covered) {
        e.covered = covered;
        if (e.component) e.component.visible = !covered;
        if (covered) { e.view.__timers.pause(); this.hook(e, 'onCovered'); bus.emit(builtinEvents.viewCovered, {view: e.cls}); }
        else { e.view.__timers.resume(); this.hook(e, 'onRevealed'); bus.emit(builtinEvents.viewRevealed, {view: e.cls}); }
      }
      const isActive = e === active;
      if (e.component) e.component.touchable = isActive;
      if (isActive !== e.active) { e.active = isActive; (isActive ? activated : deactivated).push(e); }
    });
    for (const e of deactivated) this.hook(e, 'onDeactivate');
    for (const e of activated) this.hook(e, 'onActivate');
    this.updateHints();
    if (activated.length) {
      const mode: InputMode = active?.cls.inputMode ?? (active?.layer === 'hud' ? 'game' : 'ui');
      this.backend.platform.input.setInputMode(mode);
      bus.emit(builtinEvents.inputModeChange, {inputMode: mode});
    }
  }

  // ---------- 打开 ----------

  open(cls: ViewClass, params?: object, options: {onClose?: (result: unknown) => void} = {}): Promise<object> {
    validateViewClass(cls);
    const existing = this.entryOf(cls);
    if (existing) return existing.ready; // 正在打开或已经打开：合并成一次
    const opener = this.entryOfInstance(currentActor());
    const layer = cls.layer;
    const [pkg] = cls.component.split('/');
    const view = new cls() as ViewInstance;
    const entry: Entry = {
      cls, view, layer, fullScreen: cls.fullScreen === true, component: null, version: '', state: 'opening', active: false, covered: false,
      opener, onClose: options.onClose ?? null, packages: this.packagesOf(pkg), ready: Promise.resolve(view)
    };
    this.stacks[layer].push(entry);
    const cachedIndex = this.cache.findIndex(c => c.cls === cls);
    if (cachedIndex >= 0) [entry.cached] = this.cache.splice(cachedIndex, 1);
    entry.ready = (async () => {
      const cancelled = (how: string): LgRuntimeError => {
        entry.cached?.component.dispose();
        entry.cached = undefined;
        this.release(entry.packages);
        return new LgRuntimeError('LGUI-RT-081', `${cls.name} 在${how}时被关闭了，这次打开已取消。`, '不需要处理；不想看到这个错误，就不要在打开完成之前关闭它。');
      };
      try {
        if (!entry.cached) await this.acquire(entry.packages); // 缓存里的组件还占着包引用
      } catch (error) {
        this.remove(entry);
        this.release(entry.packages);
        throw new LgRuntimeError('LGUI-RT-080', `打开 ${cls.name} 失败：${error instanceof Error ? error.message : String(error)}`, '确认界面包已经生成（lgui dev 会自动生成），包名和组件名都对。');
      }
      if (entry.state === 'closed') throw cancelled('加载资源');
      // modal 层同一时间只显示一个，后来的排队。
      if (layer === 'modal' && !this.overlays.has(cls) && this.stacks.modal.some(e => e !== entry && !this.overlays.has(e.cls) && (e.state === 'open' || e.state === 'opening'))) {
        entry.state = 'queued';
        await new Promise<void>(resolve => { entry.show = resolve; });
        if ((entry.state as Entry['state']) === 'closed') throw cancelled('排队');
      }
      try {
        this.show(entry, params);
      } catch (error) {
        this.remove(entry);
        entry.state = 'closed';
        entry.view.__dispose();
        entry.component?.dispose();
        this.release(entry.packages);
        throw new LgRuntimeError('LGUI-RT-080', `打开 ${cls.name} 失败：${error instanceof Error ? error.message : String(error)}`, '按报错改；不会显示打开了一半的界面。');
      }
      return view;
    })();
    return entry.ready;
  }

  private show(entry: Entry, params?: object): void {
    const [pkg] = entry.cls.component.split('/');
    // 打开时先判方向，再加载对应的版本。
    const version = this.versionOf(entry.cls);
    let component: UIComponent;
    if (entry.cached && entry.cached.version === version) {
      component = entry.cached.component;
      component.visible = true;
    } else {
      entry.cached?.component.dispose();
      component = this.backend.create(pkg, version);
    }
    entry.cached = undefined;
    entry.component = component;
    entry.version = version;
    const container = this.containers.get(entry.layer) as UIComponent;
    this.place(entry, component);
    container.addChild(component);
    entry.view.__mount(component, {isActive: () => entry.active && entry.state === 'open'});
    entry.state = 'open';
    this.hook(entry, 'onOpen', params ?? (entry.cls.params ? {...entry.cls.params} : undefined));
    bus.emit(builtinEvents.viewOpened, {view: entry.cls});
    this.refresh();
  }

  /** 关闭后的组件：配置了界面缓存就留着（连同包引用），否则销毁并释放资源。 */
  private discard(entry: Entry): void {
    const component = entry.component;
    entry.component = null;
    const keep = this.settings.uiCache?.keepClosedViews ?? 0;
    if (component && keep > 0) {
      (this.containers.get(entry.layer) as UIComponent).removeChild(component);
      this.cache.push({cls: entry.cls, version: entry.version, component, packages: entry.packages});
      while (this.cache.length > keep) this.evict(this.cache.shift() as Cached);
      return;
    }
    component?.dispose();
    this.release(entry.packages);
  }

  private evict(cached: Cached): void {
    cached.component.dispose();
    this.release(cached.packages);
  }

  /** 清空界面缓存（切换语言时用：缓存的组件是旧语言的）。 */
  clearCache(): void {
    for (const cached of this.cache.splice(0)) this.evict(cached);
  }

  /** 缓存着几个关掉的界面。 */
  cachedCount(): number { return this.cache.length; }

  private remove(entry: Entry): void {
    const stack = this.stacks[entry.layer];
    const index = stack.indexOf(entry);
    if (index >= 0) stack.splice(index, 1);
  }

  // ---------- 关闭 ----------

  close(cls: ViewClass, result?: unknown, quiet = false): void {
    const entry = this.entryOf(cls);
    if (!entry) {
      if (!quiet) this.backend.platform.log.write('info', `LGUI-RT-082  ${cls.name} 没有打开，跳过关闭。`);
      return;
    }
    this.closeEntry(entry, result);
  }

  private closeEntry(entry: Entry, result?: unknown): void {
    const wasOpen = entry.state === 'open';
    const wasQueued = entry.state === 'queued';
    entry.state = 'closed';
    this.remove(entry);
    if (wasQueued) entry.show?.();
    if (!wasOpen) return; // 正在打开时被关闭：资源到了也不显示（打开那边会报 LGUI-RT-081 并释放资源）
    if (entry.active) { entry.active = false; this.hook(entry, 'onDeactivate'); }
    this.hook(entry, 'onClose');
    entry.view.__dispose();
    this.discard(entry);
    // 打开者已经关了的界面不再通知；它打开的界面的回调全部取消。
    for (const other of this.all()) if (other.opener === entry) { other.opener = null; other.onClose = null; }
    const notify = entry.onClose;
    entry.onClose = null;
    bus.emit(builtinEvents.viewClosed, {view: entry.cls});
    if (notify) notify(result);
    // modal 排队：前一个关掉，下一个弹出来。
    if (entry.layer === 'modal') {
      this.stacks.modal.find(e => e.state === 'queued')?.show?.();
    }
    this.refresh();
  }

  /** 用新界面替换某一层的栈顶。 */
  async replace(cls: ViewClass, params?: object): Promise<object> {
    const current = this.top(cls.layer);
    if (current) this.closeEntry(current);
    return this.open(cls, params);
  }

  /** 和按返回键一样：关闭当前激活、可以返回的界面。page 层最底下的主界面关不掉。 */
  back(): void {
    const active = this.all().find(e => e.active);
    if (!active) return;
    const back = active.view.keys.back ?? 'close';
    if (back === 'none') return;
    if (typeof back === 'function') { asActor(active.view, () => (back as () => void)()); return; }
    if (active.layer === 'page' && this.shown('page')[0] === active) return;
    this.closeEntry(active);
  }

  /** 一直关到指定界面为止（它上面的界面全部关掉）。 */
  popTo(cls: ViewClass): void {
    const target = this.entryOf(cls);
    if (!target) throw new LgRuntimeError('LGUI-RT-083', `${cls.name} 没有打开，不能 popTo。`, '先确认它已经打开（lgui.ui.isOpen）。');
    const ordered = (['hud', 'page', 'popup', 'modal'] as const).flatMap(layer => this.stacks[layer]);
    const index = ordered.indexOf(target);
    for (const e of ordered.slice(index + 1).reverse()) if (e.layer !== 'hud' || target.layer === 'hud') this.closeEntry(e);
  }

  /** 关闭某一层的全部界面。 */
  closeAll(layer: Layer): void {
    for (const e of [...this.stacks[layer]].reverse()) this.closeEntry(e);
  }

  /** 控件在设计尺寸下的位置和大小：路径写成「包/组件.控件路径」。找不到返回 null。 */
  find(path: string): Rect | null {
    const dot = path.indexOf('.');
    const componentName = dot < 0 ? path : path.slice(0, dot);
    const entry = this.all().find(e => e.state === 'open' && e.component && e.cls.component === componentName.replace(/@portrait$/, ''));
    if (!entry || !entry.component) return null;
    let {x, y, width, height} = entry.component.rect;
    if (dot < 0) return {x, y, width, height};
    const parts = path.slice(dot + 1).split('.');
    for (let i = 1; i <= parts.length; i++) {
      const object = entry.component.child(parts.slice(0, i).join('.'));
      if (!object) return null;
      const r = object.rect;
      x += r.x;
      y += r.y;
      width = r.width;
      height = r.height;
    }
    return {x, y, width, height};
  }

  /** 内部用：每个界面的监听和定时器数量。 */
  views(): {name: string; listeners: number; timers: number}[] {
    return this.all().filter(e => e.state === 'open').map(e => ({name: e.cls.name, listeners: e.view.__listeners, timers: e.view.__timers.size}));
  }
}
