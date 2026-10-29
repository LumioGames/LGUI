// icon：加载器的地址或按钮图标。加载器先显示占位图，图片加载好了再换上；加载失败就留着占位图并报错。
import type {UIButton, UILoader} from '../../core/index';
import {runtime} from '../runtime';
import type {BindContext} from './index';

const tokens = new WeakMap<object, number>();

export function applyIcon(target: UILoader | UIButton, url: string, placeholder: string | undefined, ctx: BindContext): void {
  if ('title' in target) { target.icon = url; return; }
  const loader = target;
  const token = (tokens.get(loader) ?? 0) + 1;
  tokens.set(loader, token);
  if (!url || url.startsWith('ui://')) { loader.url = url; return; }
  const {backend, config} = runtime();
  loader.url = placeholder ?? config.placeholder;
  backend.platform.resource.loadImage(url).then(
    () => { if (tokens.get(loader) === token && !ctx.scope.isClosed) loader.url = url; },
    () => { if (tokens.get(loader) === token) backend.platform.log.write('error', `LGUI-RT-070  ${ctx.where} 的图片 ${url} 加载失败，显示占位图。  → 确认图片地址对、能访问。`); }
  );
}
