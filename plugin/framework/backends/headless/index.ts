// headless 后端：在 Node 里跑，只模拟控件树和属性，不算布局、不渲染。lgui test 用它。
import type {Backend, BackendConfig, Insets, KeyInput, LogEntry, Platform, PointerInput, UIComponent, WheelInput} from '../../core/index';
import {LgRuntimeError, notImplemented} from '../../core/index';
import type {ComponentDescriptor, PackageDescriptor} from './descriptor';
import {Handlers, HeadlessComponent, HeadlessLoader, HeadlessObject, HeadlessTransition, buildComponent, buildImage} from './objects';

/** headless 后端独有的状态，模拟操作和测试断言用。 */
export interface HeadlessState {
  /** 假时钟（毫秒）。 */
  now: number;
  /** 屏幕尺寸。 */
  screen: {width: number; height: number};
  /** 安全区的边距（屏幕像素），默认全是 0。 */
  safeArea: Insets;
  /** 系统语言。 */
  languages: string[];
  /** 存储。 */
  storage: Map<string, string>;
  /** 播放过的音效。 */
  sounds: {url: string; volume: number}[];
  /** 全部日志。 */
  logs: LogEntry[];
  /** 当前告诉游戏场景的输入模式。 */
  inputMode: 'ui' | 'game' | 'all';
  /** 已加载的包。 */
  loaded: Set<string>;
  /** 回调。 */
  handlers: {frame: Handlers<number>; visibility: Handlers<boolean>; pointer: Handlers<PointerInput>; key: Handlers<KeyInput>; wheel: Handlers<WheelInput>; resize: Handlers<{width: number; height: number}>};
}

export interface HeadlessBackend extends Backend {
  /** 模拟和断言用的状态。 */
  readonly state: HeadlessState;
}

/** packages 是 lgui 生成的 headless 描述（.lgui/build/headless/*.json），由 lgui test 打包进测试。 */
/** translations：每种语言「翻译文件里的名字 → 文字」（lgui test 生成）。 */
export function createHeadlessBackend(packages: readonly PackageDescriptor[], translations: Record<string, Record<string, string>> = {}): HeadlessBackend {
  const byPackage = new Map(packages.map(p => [p.package, p]));
  const components = new Map<string, ComponentDescriptor>();
  const images = new Map<string, {width: number; height: number}>();
  for (const p of packages) for (const image of p.images ?? []) images.set(`ui://${p.package}/${image.name}`, image);
  const owners = new Map<string, string>();
  for (const p of packages) for (const c of p.components) { components.set(c.name, c); owners.set(c.name, p.id + c.id); }
  let translation: Record<string, string> = {};
  const lookup = (name: string): ComponentDescriptor => {
    const found = components.get(name);
    if (!found) throw new LgRuntimeError('LGUI-RT-003', `没有组件 ${name}。`, '用 lgui ui list 查看有哪些组件。');
    return found;
  };
  const state: HeadlessState = {
    now: 0, screen: {width: 1920, height: 1080}, safeArea: {top: 0, right: 0, bottom: 0, left: 0}, languages: ['zh-CN'], storage: new Map(), sounds: [], logs: [], inputMode: 'ui', loaded: new Set(),
    handlers: {frame: new Handlers(), visibility: new Handlers(), pointer: new Handlers(), key: new Handlers(), wheel: new Handlers(), resize: new Handlers()}
  };
  let prefix = '';
  const root = new HeadlessComponent('root', 'root', 'container');
  const h = state.handlers;
  HeadlessTransition.frames = h.frame;
  HeadlessObject.pointerTarget = null;
  const platform: Platform = {
    time: {now: () => state.now, onFrame: f => h.frame.add(f), onVisibilityChange: f => h.visibility.add(f)},
    storage: {get: key => state.storage.get(prefix + key) ?? null, set: (key, value) => { state.storage.set(prefix + key, value); }, remove: key => { state.storage.delete(prefix + key); }},
    resource: {
      loadPackage: async name => {
        if (!byPackage.has(name)) throw new LgRuntimeError('LGUI-RT-011', `没有界面包 ${name}。`, '确认包名对，并重新生成。');
        state.loaded.add(name);
      },
      releasePackage: name => { state.loaded.delete(name); },
      hasPackage: name => state.loaded.has(name),
      loadImage: async url => {
        if (HeadlessLoader.failExternal && !url.startsWith('ui://')) throw new LgRuntimeError('LGUI-RT-025', `图片 ${url} 加载失败。`, '确认地址对、文件存在。');
      }
    },
    input: {onPointer: f => h.pointer.add(f), onKey: f => h.key.add(f), onWheel: f => h.wheel.add(f), setInputMode: mode => { state.inputMode = mode; }},
    textInput: {isComposing: () => false},
    screen: {
      size: () => ({...state.screen}),
      safeArea: () => ({...state.safeArea}),
      onResize: f => h.resize.add(f),
      applyDesignSize(design) {
        const scale = Math.min(state.screen.width / design.width, state.screen.height / design.height);
        const visible = {x: 0, y: 0, width: state.screen.width / scale, height: state.screen.height / scale};
        root.rect = visible;
        return visible;
      }
    },
    audio: {play: (url, options = {}) => { state.sounds.push({url, volume: options.volume ?? 1}); }},
    locale: {systemLanguages: () => [...state.languages]},
    log: {write: (level, message) => { state.logs.push({level, message, time: state.now}); }, recent: () => state.logs.slice(-200)},
    net: {fetch: () => { throw notImplemented('网络（测试里用 Service 的假实现）', 'headless'); }, webSocket: () => { throw notImplemented('WebSocket（测试里用 Service 的假实现）', 'headless'); }}
  };
  return {
    name: 'headless',
    state,
    root,
    platform,
    async init(config: BackendConfig) { prefix = `lgui:${config.projectName}:`; },
    loadPackage: name => platform.resource.loadPackage(name),
    releasePackage: name => platform.resource.releasePackage(name),
    create<Name extends string>(packageName: string, componentName: string): UIComponent<Name> {
      if (!state.loaded.has(packageName)) throw new LgRuntimeError('LGUI-RT-002', `界面包 ${packageName} 还没加载。`, '先加载这个包（UIManager 打开界面时会自动加载）。');
      return buildComponent(lookup(`${packageName}/${componentName}`), lookup, undefined, undefined, undefined, {owners, translation}) as unknown as UIComponent<Name>;
    },
    async setLanguage(language) { translation = translations[language] ?? {}; },
    imageSize: url => { const found = images.get(url); return found && state.loaded.has(url.slice(5).split('/')[0]) ? {width: found.width, height: found.height} : null; },
    createImage(url) { return buildImage(url, this.imageSize(url)); },
    has: (packageName, componentName) => state.loaded.has(packageName) && components.has(`${packageName}/${componentName}`),
    createContainer: name => new HeadlessComponent(name, '', 'container')
  };
}
