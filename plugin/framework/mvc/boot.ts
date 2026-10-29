// 启动（后端已经 init 过）：设置运行时、建 UIManager、注册服务，然后调用 app.start()。lgui dev、lgui test、Unity 导出都走这里。
import type {Backend} from '../core/index';
import type {AppDefinition} from './lgui';
import {runtime, setRuntime} from './runtime';
import type {RuntimeConfig} from './runtime';
import {UIManager} from './ui/manager';
import {setupCommonViews} from './common-views';
import {pickLanguage, setTexts} from './i18n';
import {setServices} from './service';
import type {TextTable} from './i18n';

export async function boot(backend: Backend, app: AppDefinition, config: RuntimeConfig, deps: Record<string, string[]>, options: {wallBase?: number; start?: boolean; texts?: Record<string, TextTable>; language?: string; services?: Record<string, () => object>} = {}): Promise<UIManager> {
  setRuntime(backend, config, options.wallBase ?? Date.now(), deps);
  setTexts(options.texts ?? {}, options.language ?? pickLanguage(backend.platform.locale.systemLanguages(), config.languages, config.defaultLanguage));
  setServices({...(app.services ?? {}), ...(options.services ?? {})});
  const ui = new UIManager(backend, deps, config);
  runtime().ui = ui;
  setupCommonViews(ui);
  await ui.startHintBar();
  if (options.start !== false) await app.start();
  return ui;
}
