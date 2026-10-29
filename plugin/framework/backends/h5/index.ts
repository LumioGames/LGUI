// h5 后端：FairyGUI-dom 加浏览器 API，是其他后端的基准实现。
import * as fgui from './vendor/fairygui.module.js';
import type {Backend, BackendConfig, Platform, UIComponent} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import {createH5Platform} from './platform/index';
import {setComponentName, wrapComponent} from './objects/index';

export function createH5Backend(): Backend {
  let platform: Platform | null = null;
  let root: UIComponent | null = null;
  const ready = (): Platform => {
    if (!platform) throw new LgRuntimeError('LGUI-RT-027', 'h5 后端还没有启动。', '先调用 backend.init(config)。');
    return platform;
  };
  return {
    name: 'h5',
    async init(config: BackendConfig) {
      if (config.defaultFont) fgui.UIConfig.defaultFont = config.defaultFont;
      await fgui.UIPackage.loadImageManifest(`${config.uiBase}/manifest.json`);
      platform = createH5Platform(config.projectName, config.uiBase);
      setComponentName(fgui.GRoot.inst, 'root');
      root = wrapComponent(fgui.GRoot.inst);
    },
    get root(): UIComponent {
      if (!root) throw new LgRuntimeError('LGUI-RT-027', 'h5 后端还没有启动。', '先调用 backend.init(config)。');
      return root;
    },
    loadPackage: name => ready().resource.loadPackage(name),
    releasePackage: name => ready().resource.releasePackage(name),
    create<Name extends string>(packageName: string, componentName: string): UIComponent<Name> {
      ready();
      if (!fgui.UIPackage.getByName(packageName)) throw new LgRuntimeError('LGUI-RT-002', `界面包 ${packageName} 还没加载。`, '先加载这个包（UIManager 打开界面时会自动加载）。');
      const native = fgui.UIPackage.createObject(packageName, componentName);
      if (!native) throw new LgRuntimeError('LGUI-RT-003', `界面包 ${packageName} 里没有组件 ${componentName}。`, '用 lgui ui list 查看有哪些组件。');
      setComponentName(native, `${packageName}/${componentName}`);
      return wrapComponent(native) as UIComponent<Name>;
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
