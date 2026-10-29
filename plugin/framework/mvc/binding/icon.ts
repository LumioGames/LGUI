// icon：加载器的地址或按钮图标。加载器先显示占位图，图片加载好了再换上；加载失败就留着占位图并报错。
import type {UIButton, UILoader} from '../../core/index';
import {runtime} from '../runtime';
import {currentLanguage} from '../i18n';
import type {BindContext} from './index';

const tokens = new WeakMap<object, number>();

/** 带字的图片：有当前语言的版本（名字加 @<语言>）就用它，没有就用默认版本。 */
export function localized(url: string): string {
  if (!url.startsWith('ui://')) return url;
  const candidate = `${url}@${currentLanguage()}`;
  return runtime().backend.imageSize(candidate) ? candidate : url;
}

export function applyIcon(target: UILoader | UIButton, url: string, placeholder: string | undefined, ctx: BindContext): void {
  if ('title' in target) { target.icon = localized(url); return; }
  const loader = target;
  const token = (tokens.get(loader) ?? 0) + 1;
  tokens.set(loader, token);
  if (!url || url.startsWith('ui://')) { loader.url = localized(url); return; }
  const {backend, config} = runtime();
  loader.url = placeholder ?? config.placeholder;
  backend.platform.resource.loadImage(url).then(
    () => { if (tokens.get(loader) === token && !ctx.scope.isClosed) loader.url = url; },
    () => { if (tokens.get(loader) === token) backend.platform.log.write('error', `LGUI-RT-070  ${ctx.where} 的图片 ${url} 加载失败，显示占位图。  → 确认图片地址对、能访问。`); }
  );
}
