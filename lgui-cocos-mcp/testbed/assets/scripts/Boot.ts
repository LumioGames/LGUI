// M1 桥接冒烟：不走 MVC，直接驱动 cocos 后端走 挂载 → 加载包 → 创建控件 → 进层 → 换设计尺寸 → 换语言。
// 全部由 sync.mjs 生成的 lgui-config.ts 驱动；改 ui/ 或框架后先跑 sync 再刷新预览。
import {Component, _decorator, director, Director} from 'cc';
import {createCocosBackend} from '../lgui-framework/backends/cocos/index';
import {config, deps, components} from './lgui-config';

const {ccclass} = _decorator;

export async function smoke(): Promise<void> {
  const backend = createCocosBackend();
  await backend.init({projectName: config.name, defaultFont: config.defaultFont, uiBase: 'lgui-ui', i18nBase: 'i18n'});
  const log = backend.platform.log;
  const visible = backend.platform.screen.applyDesignSize(config.design);
  log.info('lgui_smoke', () => ({step: 'init', design: config.design, visible}));

  await backend.loadPackage('Common');
  const name = (components.Common ?? []).find(item => !item.endsWith('@portrait'));
  if (!name) throw new Error('Common 包里没有横版组件：先跑 sync.mjs');
  const layer = backend.createContainer('page');
  backend.root.addChild(layer);
  const component = backend.create('Common', name);
  layer.addChild(component);
  log.info('lgui_smoke', () => ({step: 'create', component: `Common/${name}`, deps: Object.keys(deps)}));

  backend.platform.screen.applyDesignSize(config.designPortrait);
  log.info('lgui_smoke', () => ({step: 'portrait', design: config.designPortrait}));

  const other = config.languages.find(language => language !== config.defaultLanguage) ?? 'en';
  await backend.setLanguage(other);
  log.info('lgui_smoke', () => ({step: 'language', language: other}));
  await backend.setLanguage(config.defaultLanguage);
  log.info('lgui_smoke', () => ({step: 'done'}));
}

// 不依赖场景挂件：第一个场景加载完自动跑冒烟。
director.once(Director.EVENT_AFTER_SCENE_LAUNCH, () => { void smoke().catch(error => { console.error('[lgui-smoke] 失败：', error); throw error; }); });

@ccclass('LGUIBoot')
export class LGUIBoot extends Component {
  override start(): void { void smoke().catch(error => console.error('[lgui-smoke] 失败：', error)); }
}
