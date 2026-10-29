// headless 后端的 UI 对象：按 headless 描述建控件树，只模拟属性，不算布局、不渲染。
import type {
  PointerInput, Rect, UIObject, UIComponent, UIText, UIInput, UIButton, UIImage, UILoader, UIList, UIController, UITransition, UIProgress, UIGraph, UIKind, Unsubscribe
} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {ChildDescriptor, ComponentDescriptor} from './descriptor';

// 一组回调。
export class Handlers<T> {
  private set = new Set<(value: T) => void>();
  add(handler: (value: T) => void): Unsubscribe { this.set.add(handler); return () => { this.set.delete(handler); }; }
  emit(value: T): void { for (const handler of [...this.set]) handler(value); }
  get size(): number { return this.set.size; }
}

/** 按「包/组件」名找组件描述；找不到报错。 */
export type Lookup = (name: string) => ComponentDescriptor;

export class HeadlessObject implements UIObject {
  visible = true;
  enabled = true;
  touchable = true;
  rect: Rect = {x: 0, y: 0, width: 0, height: 0};
  customData = '';
  parent: HeadlessComponent | null = null;
  readonly pointer = new Handlers<PointerInput>();
  constructor(readonly name: string, readonly kind: UIKind | 'container') {}
  onPointer(handler: (event: PointerInput) => void): Unsubscribe { return this.pointer.add(handler); }
  /** 模拟操作最后一次把指针事件发给了哪个控件（headless 不算布局，「指针下面是谁」就是它）。 */
  static pointerTarget: HeadlessObject | null = null;
  hitDepth(): number {
    let depth = 0;
    for (let o = HeadlessObject.pointerTarget; o; o = o.parent, depth++) if (o === this) return depth;
    return -1;
  }
  /** 内部用：设计尺寸下在屏幕上的位置（各级父组件的位置相加）。 */
  globalRect(): Rect {
    let {x, y} = this.rect;
    for (let p = this.parent; p; p = p.parent) { x += p.rect.x; y += p.rect.y; }
    return {x, y, width: this.rect.width, height: this.rect.height};
  }
  /** 内部用：自己和各级父组件都显示、都可用时才能点到。 */
  reachable(): boolean {
    for (let o: HeadlessObject | null = this; o; o = o.parent) if (!o.visible || !o.enabled || !o.touchable) return false;
    return true;
  }
}

export class HeadlessComponent extends HeadlessObject implements UIComponent {
  readonly children: HeadlessObject[] = [];
  readonly controllers = new Map<string, HeadlessController>();
  readonly transitions = new Map<string, HeadlessTransition>();
  disposed = false;
  constructor(name: string, readonly componentName: string, kind: UIKind | 'container' = 'component') { super(name, kind); }
  child(path: string): UIObject | null {
    let current: HeadlessObject | null = this;
    for (const part of path.split('.')) {
      if (!(current instanceof HeadlessComponent)) return null;
      current = current.children.find(c => c.name === part) ?? null;
      if (!current) return null;
    }
    return current;
  }
  controller(name: string): UIController | null { return this.controllers.get(name) ?? null; }
  transition(name: string): UITransition | null { return this.transitions.get(name) ?? null; }
  allTransitions(): readonly UITransition[] { return [...this.transitions.values()]; }
  childNames(): readonly string[] { return this.children.map(c => c.name); }
  addChild(child: UIObject): void {
    const object = asHeadless(child);
    object.parent?.removeChild(object);
    this.children.push(object);
    object.parent = this;
  }
  removeChild(child: UIObject): void {
    const object = asHeadless(child);
    const index = this.children.indexOf(object);
    if (index >= 0) this.children.splice(index, 1);
    object.parent = null;
  }
  dispose(): void {
    this.disposed = true;
    for (const t of this.transitions.values()) t.stop();
    this.parent?.removeChild(this);
    for (const c of [...this.children]) if (c instanceof HeadlessComponent) c.dispose();
    this.children.length = 0;
  }
}

class HeadlessText extends HeadlessObject implements UIText {
  text = '';
  color = '#ffffff';
}

class HeadlessInput extends HeadlessText implements UIInput {
  promptText = '';
  readonly changes = new Handlers<string>();
  onChange(handler: (text: string) => void): Unsubscribe { return this.changes.add(handler); }
}

class HeadlessButton extends HeadlessComponent implements UIButton {
  title = '';
  icon = '';
  mode = 'Common';
  private isSelected = false;
  // 和 FairyGUI 一样：Common 模式不保持选中；Check、Radio 选中时 button 控制器到 down 页，取消时回到 up 页。
  get selected(): boolean { return this.isSelected; }
  set selected(value: boolean) {
    if (this.mode === 'Common') return;
    this.isSelected = value;
    const controller = this.controllers.get('button');
    if (controller && controller.pages.includes('down') && controller.pages.includes('up')) controller.selectedPage = value ? 'down' : 'up';
  }
}

class HeadlessImage extends HeadlessObject implements UIImage {
  fillMethod: UIImage['fillMethod'] = 'none';
  fillOrigin = 0;
  fillClockwise = true;
  fillAmount = 1;
}

class HeadlessLoader extends HeadlessObject implements UILoader {
  private current = '';
  readonly loads = new Handlers<void>();
  readonly errors = new Handlers<string>();
  /** 测试里设为 true 时，网络图片一律加载失败。 */
  static failExternal = false;
  get url(): string { return this.current; }
  set url(value: string) {
    this.current = value;
    if (!value) return;
    // 图片在下一个微任务里「加载完成」，和真实后端一样是异步的。
    void Promise.resolve().then(() => {
      if (this.current !== value) return;
      if (HeadlessLoader.failExternal && !value.startsWith('ui://')) this.errors.emit(value);
      else this.loads.emit();
    });
  }
  onLoad(handler: () => void): Unsubscribe { return this.loads.add(() => handler()); }
  onError(handler: (url: string) => void): Unsubscribe { return this.errors.add(handler); }
}

export class HeadlessList extends HeadlessComponent implements UIList {
  itemRenderer: ((index: number, item: UIComponent) => void) | null = null;
  virtual = false;
  scrollPosition = {x: 0, y: 0};
  private selected = -1;
  /** 选中项：和 FairyGUI 一样同步到子项按钮（Check、Radio 模式的按钮才显示选中）。 */
  get selectedIndex(): number { return this.selected; }
  set selectedIndex(value: number) {
    this.selected = value;
    this.children.forEach((item, i) => { if (item instanceof HeadlessButton) item.selected = i === value; });
  }
  readonly clicks = new Handlers<number>();
  private count = 0;
  constructor(name: string, private readonly itemName: string | null, private readonly lookup: Lookup, private readonly tr?: Translate) { super(name, '', 'list'); }
  get numItems(): number { return this.count; }
  set numItems(value: number) {
    // 不模拟虚拟列表的回收：按数量生成全部子项，结果和真实后端一致即可。
    if (value > 0 && !this.itemName) throw new LgRuntimeError('LGUI-RT-030', `列表 ${this.name} 没有设置子项组件（defaultItem）。`, '在 ui/ 里给列表设置 defaultItem。');
    while (this.children.length > value) (this.children[this.children.length - 1] as HeadlessComponent).dispose();
    while (this.children.length < value) {
      const item = buildComponent(this.lookup(this.itemName as string), this.lookup, String(this.children.length), undefined, undefined, this.tr);
      this.addChild(item);
    }
    this.count = value;
    if (this.selectedIndex >= value) this.selectedIndex = -1;
    if (this.itemRenderer) this.children.forEach((item, i) => this.itemRenderer?.(i, item as HeadlessComponent));
  }
  onClickItem(handler: (index: number) => void): Unsubscribe { return this.clicks.add(handler); }
  itemAt(index: number): UIComponent | null { return (this.children[index] as HeadlessComponent | undefined) ?? null; }
  scrollToView(index: number): void { void index; }
}

class HeadlessProgress extends HeadlessComponent implements UIProgress {
  value = 0;
  max = 100;
}

class HeadlessGraph extends HeadlessObject implements UIGraph {
  color = '#ffffff';
}

export class HeadlessController implements UIController {
  readonly changes = new Handlers<string>();
  private page: string;
  constructor(readonly name: string, readonly pages: readonly string[], selected: string | null) { this.page = selected ?? pages[0] ?? ''; }
  get selectedPage(): string { return this.page; }
  set selectedPage(value: string) {
    if (!this.pages.includes(value)) throw new LgRuntimeError('LGUI-RT-022', `控制器 ${this.name} 没有页 ${value}。`, `能用的页：${this.pages.join('、')}。`);
    if (value === this.page) return;
    this.page = value;
    this.changes.emit(value);
  }
  onChange(handler: (page: string) => void): Unsubscribe { return this.changes.add(handler); }
}

// 动效：按 headless 描述里的时长走假时钟（每帧回调），暂停时不走；放完才调用 onComplete，和网页一致。
export class HeadlessTransition implements UITransition {
  /** 每帧回调的来源（headless 后端创建时设置）。 */
  static frames: Handlers<number> | null = null;
  playing = false;
  paused = false;
  /** 播放过几次（测试断言用）。 */
  plays = 0;
  private stopFrames: Unsubscribe | null = null;
  constructor(readonly name: string, private readonly ms: number, readonly settings: UITransition['settings']) {}
  play(options: {times?: number; delay?: number} = {}, onComplete?: () => void): void {
    this.halt();
    this.plays++;
    this.playing = true;
    const times = options.times ?? 1;
    // 和 FairyGUI 一样：时长是 0 的动效当场放完；一直循环或有一项一直重复的永远放不完。
    const total = times < 0 || this.ms < 0 ? Infinity : (options.delay ?? 0) + this.ms * times;
    if (total <= 0) { this.halt(); onComplete?.(); return; }
    const frames = HeadlessTransition.frames;
    if (!frames) throw new LgRuntimeError('LGUI-RT-027', 'headless 后端还没有创建，动效没有时钟。', '先调用 createHeadlessBackend。');
    let elapsed = 0;
    this.stopFrames = frames.add(dt => {
      if (this.paused) return;
      elapsed += dt;
      if (elapsed < total) return;
      this.halt();
      onComplete?.();
    });
  }
  stop(): void { this.halt(); }
  setPaused(paused: boolean): void { if (this.playing) this.paused = paused; }
  private halt(): void {
    this.stopFrames?.();
    this.stopFrames = null;
    this.playing = false;
    this.paused = false;
  }
}

export function asHeadless(object: UIObject): HeadlessObject {
  if (!(object instanceof HeadlessObject)) throw new LgRuntimeError('LGUI-RT-024', `${object.name} 不是 headless 后端创建的对象。`, '不要混用不同后端的对象。');
  return object;
}

/** 翻译：组件的「包ID+组件ID」和当前语言的翻译表。 */
export interface Translate {
  owners: Map<string, string>;
  translation: Record<string, string>;
}

function buildChild(child: ChildDescriptor, lookup: Lookup, owner: string | undefined, tr: Translate | undefined): HeadlessObject {
  // 按当前语言的翻译改写固定文字（FairyGUI 在创建组件时做同样的事）。
  const key = owner && child.elementId ? `${owner}-${child.elementId}` : null;
  const translated = key && tr ? tr.translation[key] : undefined;
  const prompt = key && tr ? tr.translation[`${key}-prompt`] : undefined;
  const p = {...child.props};
  if (translated !== undefined) { if (child.kind === 'button') p.title = translated; else p.text = translated; }
  if (prompt !== undefined) p.promptText = prompt;
  let object: HeadlessObject;
  switch (child.kind) {
    case 'text': case 'richtext': { const t = new HeadlessText(child.name, child.kind); t.text = p.text ?? ''; object = t; break; }
    case 'input': { const t = new HeadlessInput(child.name, 'input'); t.text = p.text ?? ''; t.promptText = p.promptText ?? ''; object = t; break; }
    case 'image': object = new HeadlessImage(child.name, 'image'); break;
    case 'loader': { const l = new HeadlessLoader(child.name, 'loader'); if (p.url) l.url = p.url; object = l; break; }
    case 'graph': { const g = new HeadlessGraph(child.name, 'graph'); g.color = p.color ?? '#ffffff'; object = g; break; }
    case 'list': object = new HeadlessList(child.name, child.defaultItem, lookup, tr); break;
    default: {
      if (!child.ref) throw new LgRuntimeError('LGUI-RT-031', `子组件 ${child.name} 引用的组件不存在。`, '在 ui/ 里修好这个子组件的引用，再重新生成。');
      object = buildComponent(lookup(child.ref), lookup, child.name, child.kind, p, tr);
    }
  }
  object.visible = p.visible;
  object.customData = p.customData ?? '';
  object.enabled = p.enabled;
  object.touchable = p.touchable;
  const [x, y, width, height] = child.rect;
  object.rect = {x, y, width, height};
  return object;
}

/** 按描述建一个组件（连同全部子控件和子组件）。 */
export function buildComponent(descriptor: ComponentDescriptor, lookup: Lookup, name = descriptor.name, kind: UIKind = 'component', props?: ChildDescriptor['props'], tr?: Translate): HeadlessComponent {
  let component: HeadlessComponent;
  if (kind === 'button' || descriptor.extension === 'Button') {
    const button = new HeadlessButton(name, descriptor.name, 'button');
    button.title = props?.title ?? '';
    button.icon = props?.icon ?? '';
    button.mode = descriptor.buttonMode ?? 'Common';
    component = button;
  } else if (kind === 'progress' || descriptor.extension === 'ProgressBar') {
    const bar = new HeadlessProgress(name, descriptor.name, 'progress');
    bar.value = props?.value ?? 0;
    bar.max = props?.max ?? 100;
    component = bar;
  } else {
    component = new HeadlessComponent(name, descriptor.name);
  }
  component.rect = {x: 0, y: 0, width: descriptor.size[0], height: descriptor.size[1]};
  for (const c of descriptor.controllers) component.controllers.set(c.name, new HeadlessController(c.name, c.pages, c.selected));
  if (component instanceof HeadlessButton && props?.selected) component.selected = true;
  for (const t of descriptor.transitions) {
    const transition = new HeadlessTransition(t.name, t.ms, {autoPlay: t.autoPlay, times: t.times, delay: t.delay});
    component.transitions.set(t.name, transition);
    // 自动播放：网页上组件放进界面时开始放，这里在创建时开始（UIManager 创建完马上就放进界面）。
    if (t.autoPlay) transition.play({times: t.times, delay: t.delay});
  }
  const owner = tr?.owners.get(descriptor.name);
  for (const child of descriptor.children) component.addChild(buildChild(child, lookup, owner, tr));
  return component;
}

export {HeadlessLoader, HeadlessInput};

/** 按地址建一张图片（ArtText 用）。 */
export function buildImage(url: string, size: {width: number; height: number} | null): HeadlessObject {
  const loader = new HeadlessLoader('', 'loader');
  loader.url = url;
  if (size) loader.rect = {x: 0, y: 0, width: size.width, height: size.height};
  return loader;
}
