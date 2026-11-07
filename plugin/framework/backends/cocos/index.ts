// cocos 后端：fairygui-cc 加 Cocos Creator 引擎 API。从 h5 后端移植（它是基准实现）；差异点都在注释里。
// 只能在 Cocos Creator 工程里运行（fairygui.mjs import 'cc'）；M1 目标是 Web。
import {director} from 'cc';
import * as fgui from './vendor/fairygui.mjs';
import type {Backend, BackendConfig, Platform, UIComponent, UIObject} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import {createCocosPlatform} from './platform/index';
import {setComponentName, wrap, wrapComponent} from './objects/index';

const parseUrl = (url: string): [string, string] | null => { const m = /^ui:\/\/([^/]+)\/(.+)$/.exec(url); return m ? [m[1], m[2]] : null; };

export function createCocosBackend(): Backend {
  let platform: Platform | null = null;
  let root: UIComponent | null = null;
  let i18nBase: string | undefined;
  const loadedPackages = new Set<string>();
  const ready = (): Platform => {
    if (!platform) throw new LgRuntimeError('LGUI-RT-027', 'cocos 后端还没有启动。', '先调用 backend.init(config)。');
    return platform;
  };
  return {
    name: 'cocos',
    async init(config: BackendConfig) {
      if (config.defaultFont) fgui.UIConfig.defaultFont = config.defaultFont;
      i18nBase = config.i18nBase;
      // 根节点自己挂到场景上（不走 GRoot.create()，那里硬编码找名为 'Canvas' 的节点）。
      const nativeRoot = fgui.GRoot.inst;
      if (!nativeRoot.node.parent) {
        const scene = director.getScene();
        if (!scene) throw new LgRuntimeError('LGUI-RT-028', '界面根节点挂不上去：场景还没就绪。', '在场景加载完成后再调用 lgui.app()。');
        scene.addChild(nativeRoot.node);
      }
      platform = createCocosPlatform(config.projectName, config.uiBase);
      setComponentName(nativeRoot, 'root');
      root = wrapComponent(nativeRoot);
    },
    get root(): UIComponent {
      if (!root) throw new LgRuntimeError('LGUI-RT-027', 'cocos 后端还没有启动。', '先调用 backend.init(config)。');
      return root;
    },
    loadPackage: async name => { await ready().resource.loadPackage(name); loadedPackages.add(name); },
    releasePackage: name => { loadedPackages.delete(name); ready().resource.releasePackage(name); },
    create<Name extends string>(packageName: string, componentName: string): UIComponent<Name> {
      ready();
      if (!fgui.UIPackage.getByName(packageName)) throw new LgRuntimeError('LGUI-RT-002', `界面包 ${packageName} 还没加载。`, '先加载这个包（UIManager 打开界面时会自动加载）。');
      const native = fgui.UIPackage.createObject(packageName, componentName);
      if (!native) throw new LgRuntimeError('LGUI-RT-003', `界面包 ${packageName} 里没有组件 ${componentName}。`, '用 lgui ui list 查看有哪些组件。');
      setComponentName(native, `${packageName}/${componentName}`);
      return wrapComponent(native) as UIComponent<Name>;
    },
    async setLanguage(language: string): Promise<void> {
      if (!i18nBase) throw new LgRuntimeError('LGUI-RT-173', `没配 i18nBase，换不了界面上固定文字的语言（${language}）。`, 'backend.init 时传 i18nBase（生成的启动入口传的是 ./i18n）。');
      const url = `${i18nBase}/${language}.xml`;
      const response = await fetch(url);
      if (!response.ok) throw new LgRuntimeError('LGUI-RT-141', `读不到翻译文件 ${url}（HTTP ${response.status}）。`, '确认工程配置 languages 里有这种语言，并重新运行包同步生成翻译文件。');
      fgui.TranslationHelper.loadFromXML(new fgui.XML(await response.text()));
      // FairyGUI 的翻译只在组件第一次创建时写进包数据，所以已经加载的包要卸载、重新加载（同 h5）。
      const loaded = [...loadedPackages];
      for (const name of loaded) if (fgui.UIPackage.getByName(name)) fgui.UIPackage.removePackage(name);
      for (const name of loaded) await ready().resource.loadPackage(name);
    },
    has(packageName: string, componentName: string): boolean {
      const pkg = fgui.UIPackage.getByName(packageName);
      return pkg !== undefined && pkg.getItemByName(componentName) !== undefined;
    },
    imageSize(url: string) {
      const parts = parseUrl(url);
      const item = parts ? fgui.UIPackage.getByName(parts[0])?.getItemByName(parts[1]) : undefined;
      return item ? {width: item.width, height: item.height} : null;
    },
    createImage(url: string) {
      const loader = new fgui.GLoader();
      loader.url = url;
      const size = this.imageSize(url);
      if (size) loader.setSize(size.width, size.height);
      return wrap(loader);
    },
    createContainer(name: string): UIComponent {
      const native = new fgui.GComponent();
      native.name = name;
      setComponentName(native, '');
      return wrapComponent(native);
    },
    get platform(): Platform { return ready(); }
  };
}
