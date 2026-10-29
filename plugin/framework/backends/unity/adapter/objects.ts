// FairyGUI-unity 对象 → 引擎无关接口。缓存包装对象，所有原生事件均有成对的 Add/Remove。
import type {PointerInput, Rect, UIObject, UIComponent, UIText, UIInput, UIButton, UIImage, UILoader, UIList, UIController, UITransition, UIProgress, UIGraph, Unsubscribe} from '../../../core/index';
import {LgRuntimeError} from '../../../core/index';
import type {NativeColor, NativeComponent, NativeController, NativeEventContext, NativeEventHandler, NativeEventListener, NativeFairyGUI, NativeGraph, NativeImage, NativeInputEvent, NativeList, NativeLoader, NativeObject, NativeProgress, NativeRect, NativeText, NativeTextInput, NativeButton, NativeTransition} from './native-ui';

const fillMethods = ['none', 'horizontal', 'vertical', 'radial90', 'radial180', 'radial360'] as const;
const byte = (value: number): string => Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16).padStart(2, '0');
const rgb = (color: NativeColor): string => byte(color.r) + byte(color.g) + byte(color.b);
const colorText = (color: NativeColor, alpha = false): string => '#' + (alpha && color.a < 1 ? byte(color.a) : '') + rgb(color);

/** 为一个 Unity 后端创建独立的对象和事件缓存，不能混用另一个后端的对象。 */
export function createObjectAdapter(fgui: NativeFairyGUI, now: () => number, toPoint: (x: number, y: number) => {x: number; y: number}, toRect: (x: number, y: number, width: number, height: number) => NativeRect, onComponentReleased?: (component: UIComponent) => void) {
  const cache = new WeakMap<NativeObject, UnityObject>();
  const natives = new WeakMap<UIObject, NativeObject>();
  const names = new WeakMap<NativeObject, string>();
  const controllers = new WeakMap<NativeController, UIController>();
  const transitions = new WeakMap<NativeTransition, UITransition>();
  const pointers = new Map<NativeObject, Set<(input: PointerInput) => void>>();
  const activeObjects = new Set<UnityObject>();
  const activeLists = new Set<UnityList>();
  let converted = new WeakMap<NativeInputEvent, PointerInput>();

  function fromColor(value: string): NativeColor {
    if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) throw new LgRuntimeError('LGUI-RT-020', `颜色 ${value} 的格式不对。`, '写成 #rrggbb 或 #aarrggbb。');
    return fgui.Utils.ToolSet.ConvertFromHtmlColor(value);
  }

  /** 同一个原生输入在控件与舞台上返回同一对象；帧开始时清除池化原生事件的旧映射。 */
  function toPointerInput(type: PointerInput['type'], context: NativeEventContext): PointerInput {
    const event = context.inputEvent;
    if (!event) throw new LgRuntimeError('LGUI-RT-001', 'Unity 原生指针事件没有输入数据。', '仅对 FairyGUI 的原始输入事件做指针转换。');
    const point = toPoint(event.x, event.y);
    const previous = converted.get(event);
    if (previous && previous.type === type && previous.x === point.x && previous.y === point.y && previous.pointerId === event.touchId) return previous;
    const input: PointerInput = {type, pointerId: event.touchId, pointerType: fgui.Stage.touchScreen ? 'touch' : 'mouse', ...point, time: now()};
    converted.set(event, input);
    return input;
  }
  function clearPointerCache(): void { converted = new WeakMap<NativeInputEvent, PointerInput>(); }

  /** Unity 未按下鼠标时只向 Stage 发送 move；先给命中对象及祖先发送同一事件，再交给舞台。 */
  function dispatchHover(target: NativeObject | null, context: NativeEventContext): void {
    if (!context.inputEvent || fgui.Stage.touchScreen) return;
    const input = toPointerInput('move', context);
    for (let current = target; current; current = current.parent) {
      for (const handler of [...(pointers.get(current) ?? [])]) handler(input);
    }
  }

  class UnityObject implements UIObject {
    private subscriptions = new Set<Unsubscribe>();
    constructor(readonly native: NativeObject) {}
    get name(): string { return this.native.name; }
    get visible(): boolean { return this.native.visible; }
    set visible(value: boolean) { this.native.visible = value; }
    get enabled(): boolean { return !this.native.grayed; }
    set enabled(value: boolean) { this.native.enabled = value; }
    get touchable(): boolean { return this.native.touchable; }
    set touchable(value: boolean) { this.native.touchable = value; }
    get customData(): string { return this.native.data == null ? '' : String(this.native.data); }
    get rect(): Rect { return {x: this.native.x, y: this.native.y, width: this.native.width, height: this.native.height}; }
    set rect(value: Rect) { this.native.SetXY(value.x, value.y); this.native.SetSize(value.width, value.height); }
    track(off: Unsubscribe): Unsubscribe {
      let active = true;
      const release = (): void => { if (!active) return; active = false; this.subscriptions.delete(release); if (!this.subscriptions.size) activeObjects.delete(this); off(); };
      this.subscriptions.add(release);
      activeObjects.add(this);
      return release;
    }
    protected listen(listener: NativeEventListener, callback: NativeEventHandler): Unsubscribe {
      listener.Add(callback);
      return this.track(() => listener.Remove(callback));
    }
    release(): void { for (const off of [...this.subscriptions]) off(); }
    onPointer(handler: (event: PointerInput) => void): Unsubscribe {
      let owners = pointers.get(this.native);
      if (!owners) { owners = new Set(); pointers.set(this.native, owners); }
      let previous: PointerInput | null = null;
      // A captured mouse move reaches both stage hover forwarding and the native
      // GObject monitor. Deduplicate each subscription using their shared input.
      const deliver = (input: PointerInput): void => {
        if (input === previous) return;
        previous = input;
        handler(input);
      };
      owners.add(deliver);
      const send = (type: PointerInput['type']): NativeEventHandler => context => {
        if (!context.inputEvent) return;
        if (type === 'down') context.CaptureTouch();
        deliver(toPointerInput(type, context));
      };
      const down = this.listen(this.native.onTouchBegin, send('down'));
      const move = this.listen(this.native.onTouchMove, send('move'));
      const up = this.listen(this.native.onTouchEnd, send('up'));
      return this.track(() => { down(); move(); up(); owners.delete(deliver); previous = null; if (!owners.size) pointers.delete(this.native); });
    }
  }

  class UnityComponent extends UnityObject implements UIComponent {
    constructor(readonly native: NativeComponent, readonly componentName: string) { super(native); }
    child(path: string): UIObject | null {
      let current: NativeObject | null = this.native;
      for (const name of path.split('.')) {
        if (!(current instanceof fgui.GComponent)) return null;
        current = current.GetChild(name);
        if (!current) return null;
      }
      return current ? wrap(current) : null;
    }
    childNames(): readonly string[] { return Array.from({length: this.native.numChildren}, (_, index) => this.native.GetChildAt(index).name); }
    controller(name: string): UIController | null {
      const native = this.native.GetController(name);
      if (!native) return null;
      let result = controllers.get(native);
      if (!result) { result = new UnityController(native, this); controllers.set(native, result); }
      return result;
    }
    transition(name: string): UITransition | null {
      const native = this.native.GetTransition(name);
      if (!native) return null;
      let result = transitions.get(native);
      if (!result) { result = new UnityTransition(native); transitions.set(native, result); }
      return result;
    }
    addChild(child: UIObject): void { this.native.AddChild(nativeOf(child)); }
    removeChild(child: UIObject): void { this.native.RemoveChild(nativeOf(child)); }
    dispose(): void { releaseTree(this.native); this.native.Dispose(); }
  }
  class UnityText extends UnityObject implements UIText {
    constructor(readonly native: NativeText) { super(native); }
    get text(): string { return this.native.text; }
    set text(value: string) { this.native.text = value; }
    get color(): string { return colorText(this.native.color); }
    set color(value: string) { this.native.color = fromColor(value); }
  }
  class UnityInput extends UnityText implements UIInput {
    constructor(readonly native: NativeTextInput) { super(native); }
    get promptText(): string { return this.native.promptText; }
    set promptText(value: string) { this.native.promptText = value; }
    onChange(handler: (value: string) => void): Unsubscribe { return this.listen(this.native.onChanged, () => handler(this.native.text)); }
  }
  class UnityButton extends UnityComponent implements UIButton {
    constructor(readonly native: NativeButton, name: string) { super(native, name); }
    get title(): string { return this.native.title; }
    set title(value: string) { this.native.title = value; }
    get icon(): string { return this.native.icon; }
    set icon(value: string) { this.native.icon = value; }
    get selected(): boolean { return this.native.selected; }
    set selected(value: boolean) { this.native.selected = value; }
  }
  class UnityImage extends UnityObject implements UIImage {
    constructor(readonly native: NativeImage) { super(native); }
    get fillMethod(): UIImage['fillMethod'] { return fillMethods[this.native.fillMethod]; }
    set fillMethod(value: UIImage['fillMethod']) { this.native.fillMethod = fillMethods.indexOf(value); }
    get fillOrigin(): number { return this.native.fillOrigin; }
    set fillOrigin(value: number) { this.native.fillOrigin = value; }
    get fillClockwise(): boolean { return this.native.fillClockwise; }
    set fillClockwise(value: boolean) { this.native.fillClockwise = value; }
    get fillAmount(): number { return this.native.fillAmount; }
    set fillAmount(value: number) { this.native.fillAmount = value; }
  }
  class UnityLoader extends UnityObject implements UILoader {
    private loads = new Set<() => void>();
    private errors = new Set<(url: string) => void>();
    constructor(readonly native: NativeLoader) { super(native); }
    get url(): string { return this.native.url ?? ''; }
    set url(value: string) {
      this.native.url = value;
      if (!value.startsWith('ui://')) return;
      const item = fgui.UIPackage.GetItemByURL(value);
      // Image 和 Component 在赋 url 时同步加载；MovieClip 的帧不暴露为 texture。
      const loaded = item && (this.native.texture != null || this.native.component != null || item.type === 1);
      if (loaded) { for (const handler of [...this.loads]) handler(); }
      else { for (const handler of [...this.errors]) handler(value); }
    }
    onLoad(handler: () => void): Unsubscribe {
      this.loads.add(handler);
      const off = this.listen(this.native.onLoaded, event => { if (event.data === this.url) handler(); });
      return this.track(() => { this.loads.delete(handler); off(); });
    }
    onError(handler: (url: string) => void): Unsubscribe {
      this.errors.add(handler);
      const off = this.listen(this.native.onLoadError, event => { if (event.data === this.url) handler(this.url); });
      return this.track(() => { this.errors.delete(handler); off(); });
    }
  }
  class UnityList extends UnityObject implements UIList {
    private renderer: UIList['itemRenderer'] = null;
    private isVirtual = false;
    private selected = -1;
    constructor(readonly native: NativeList) { super(native); }
    get numItems(): number { return this.native.numItems; }
    set numItems(value: number) { this.native.numItems = value; if (this.selected >= value) this.selectedIndex = -1; }
    get itemRenderer(): UIList['itemRenderer'] { return this.renderer; }
    set itemRenderer(value: UIList['itemRenderer']) {
      this.renderer = value;
      this.native.itemRenderer = value ? (index, item) => value(index, wrapComponent(item)) : null;
      if (value) activeLists.add(this); else activeLists.delete(this);
    }
    get virtual(): boolean { return this.isVirtual; }
    set virtual(value: boolean) {
      if (value === this.isVirtual) return;
      if (!value) throw new LgRuntimeError('LGUI-RT-021', '列表一旦设成虚拟列表就不能改回去。', '在第一次给数据之前决定要不要虚拟列表。');
      this.native.SetVirtual(); this.isVirtual = true;
    }
    get scrollPosition(): {x: number; y: number} { const pane = this.native.scrollPane; return {x: pane?.posX ?? 0, y: pane?.posY ?? 0}; }
    set scrollPosition(value: {x: number; y: number}) { this.native.scrollPane?.ScrollToView(toRect(value.x, value.y, 0, 0), false, true); }
    get selectedIndex(): number { return this.selected; }
    set selectedIndex(value: number) { this.selected = value; this.native.selectedIndex = value; }
    onClickItem(handler: (index: number) => void): Unsubscribe {
      return this.listen(this.native.onClickItem, event => {
        const item = event.data as NativeObject;
        const child = this.native.GetChildIndex(item);
        if (child < 0) return;
        this.selected = this.native.ChildIndexToItemIndex(child);
        handler(this.selected);
      });
    }
    itemAt(index: number): UIComponent | null {
      if (index < 0 || index >= this.native.numItems) return null;
      const child = this.native.ItemIndexToChildIndex(index);
      return child < 0 || child >= this.native.numChildren ? null : wrapComponent(this.native.GetChildAt(child));
    }
    scrollToView(index: number): void { this.native.ScrollToView(index, false); }
    override release(): void { super.release(); this.itemRenderer = null; }
  }
  class UnityProgress extends UnityComponent implements UIProgress {
    constructor(readonly native: NativeProgress, name: string) { super(native, name); }
    get value(): number { return this.native.value; }
    set value(value: number) { this.native.value = value; }
    get max(): number { return this.native.max; }
    set max(value: number) { this.native.max = value; }
  }
  class UnityGraph extends UnityObject implements UIGraph {
    constructor(readonly native: NativeGraph) { super(native); }
    get color(): string { return colorText(this.native.color, true); }
    set color(value: string) { this.native.color = fromColor(value); }
  }
  class UnityController implements UIController {
    constructor(readonly native: NativeController, private owner: UnityComponent) {}
    get name(): string { return this.native.name; }
    get selectedPage(): string { return this.native.selectedPage; }
    set selectedPage(value: string) {
      if (!this.pages.includes(value)) throw new LgRuntimeError('LGUI-RT-022', `控制器 ${this.name} 没有页 ${value}。`, `能用的页：${this.pages.join('、')}。`);
      this.native.selectedPage = value;
    }
    get pages(): readonly string[] { return Array.from({length: this.native.pageCount}, (_, index) => this.native.GetPageName(index)); }
    onChange(handler: (page: string) => void): Unsubscribe {
      const callback: NativeEventHandler = () => handler(this.native.selectedPage);
      this.native.onChanged.Add(callback);
      return this.owner.track(() => this.native.onChanged.Remove(callback));
    }
  }
  class UnityTransition implements UITransition {
    constructor(readonly native: NativeTransition) {}
    get name(): string { return this.native.name; }
    play(options: {times?: number; delay?: number} = {}): Promise<void> { return new Promise(resolve => this.native.Play(options.times ?? 1, options.delay ?? 0, resolve)); }
    stop(): void { this.native.Stop(true, false); }
    setPaused(paused: boolean): void { this.native.SetPaused(paused); }
  }

  function releaseTree(native: NativeObject): void {
    const object = cache.get(native);
    object?.release();
    // Native GComponent.Dispose destroys descendants without invoking their
    // wrappers. Drop backend ownership for every released component in the tree.
    if (object instanceof UnityComponent) onComponentReleased?.(object);
    if (native instanceof fgui.GComponent) for (let index = 0; index < native.numChildren; index++) releaseTree(native.GetChildAt(index));
  }
  function setComponentName(native: NativeObject, name: string): void { names.set(native, name); }
  function wrap(native: NativeObject): UIObject {
    const existing = cache.get(native);
    if (existing) return existing;
    const item = native.packageItem;
    const name = names.get(native) ?? (item ? `${item.owner.name}/${item.name}` : '');
    let result: UnityObject;
    if (native instanceof fgui.GList) result = new UnityList(native);
    else if (native instanceof fgui.GButton) result = new UnityButton(native, name);
    else if (native instanceof fgui.GProgressBar) result = new UnityProgress(native, name);
    else if (native instanceof fgui.GComponent) result = new UnityComponent(native, name);
    else if (native instanceof fgui.GTextInput) result = new UnityInput(native);
    else if (native instanceof fgui.GTextField) result = new UnityText(native);
    else if (native instanceof fgui.GImage) result = new UnityImage(native);
    else if (native instanceof fgui.GLoader) result = new UnityLoader(native);
    else if (native instanceof fgui.GGraph) result = new UnityGraph(native);
    else result = new UnityObject(native);
    cache.set(native, result); natives.set(result, native);
    return result;
  }
  function wrapComponent(native: NativeObject): UIComponent {
    const result = wrap(native);
    if (!(result instanceof UnityComponent)) throw new LgRuntimeError('LGUI-RT-023', `${native.name} 不是组件。`, '检查 ui/ 里这个控件的类型。');
    return result;
  }
  function nativeOf(object: UIObject): NativeObject {
    const native = natives.get(object);
    if (!native) throw new LgRuntimeError('LGUI-RT-024', `${object.name} 不是这个 Unity 后端创建的对象。`, '不要混用不同后端的对象。');
    return native;
  }
  function dispose(): void {
    for (const object of [...activeObjects]) object.release();
    for (const list of [...activeLists]) list.release();
    pointers.clear();
    clearPointerCache();
  }
  return {wrap, wrapComponent, nativeOf, setComponentName, toPointerInput, clearPointerCache, dispatchHover, dispose};
}
