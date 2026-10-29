// ArtText 美术字：按字符找对应的小图，一个个摆出来。各后端都只用最基础的图片，网页和 Unity 一定一致。
// 在 ui/ 里放一个 Common/ArtText 的实例，用 customData 写配置：font=<包>/<字体名>;align=left|center|right;spacing=<像素>。
// 字符图片放在 <包> 的 artfont/<字体名>/ 下，名字是 <字体名>_<字符名>（字符名见 UI 开发规范第 11 节）。
import type {UIComponent, UIObject} from '../core/index';
import {LgRuntimeError} from '../core/index';
import {runtime} from './runtime';
import {fault} from './log';

const charNames: Record<string, string> = {'+': 'plus', '-': 'minus', x: 'x', '%': 'percent', '.': 'dot', ',': 'comma', ':': 'colon', '/': 'slash'};

/** 解析 customData；格式不对报 LGUI-UI-013（lgui check 会提前查出来）。 */
export function parseArtText(customData: string, where: string): {pkg: string; font: string; align: 'left' | 'center' | 'right'; spacing: number} {
  const fields = Object.fromEntries(customData.split(';').filter(Boolean).map(part => part.split('=').map(x => x.trim())));
  const font = /^([A-Z][A-Za-z0-9]*)\/([A-Za-z0-9]+)$/.exec(fields.font ?? '');
  const align = fields.align ?? 'left';
  const spacing = Number(fields.spacing ?? 0);
  if (!font || !['left', 'center', 'right'].includes(align) || !Number.isFinite(spacing)) {
    throw new LgRuntimeError('LGUI-UI-013', `${where} 的 ArtText 配置 customData="${customData}" 写法不对。`, '写成 font=<包>/<字体名>;align=left|center|right;spacing=<像素>（UI 开发规范第 11 节）。');
  }
  return {pkg: font[1], font: font[2], align: align as 'left' | 'center' | 'right', spacing};
}

const shown = new WeakMap<UIComponent, {text: string; glyphs: UIObject[]}>();

/** 当前显示的文字（测试读控件文字时用）。 */
export function artTextOf(component: UIComponent): string | undefined {
  return shown.get(component)?.text;
}

/** 把 text 拼到 ArtText 组件里。字体所在的包没加载报 LGUI-RT-171；缺某个字符的图片报 LGUI-RT-130 并指出是哪个字符。
 * 都是写错了：开发和测试里抛错；正式构建里记 error，包没加载就什么都不拼，缺的字符跳过、其余照常拼出来。 */
export function renderArtText(component: UIComponent, text: string, where: string): void {
  const {pkg, font, align, spacing} = parseArtText(component.customData, where);
  const backend = runtime().backend;
  if (!backend.platform.resource.hasPackage(pkg)) {
    fault(new LgRuntimeError('LGUI-RT-171', `${where} 的 ArtText 用的字体 ${pkg}/${font} 所在的包 ${pkg} 没有加载。`, `让这个界面依赖 ${pkg} 包：把 ArtText 放在 ${pkg} 包的组件里，或者在组件里引用一次 ${pkg} 包的组件。`), {where, font: `${pkg}/${font}`}, `${pkg}/${font}`);
    return;
  }
  const glyphs: {url: string; size: {width: number; height: number}}[] = [];
  for (const char of text) {
    const name = `${font}_${/[0-9]/.test(char) ? char : charNames[char] ?? char}`;
    const url = `ui://${pkg}/${name}`;
    const size = backend.imageSize(url);
    if (size) glyphs.push({url, size});
    else fault(new LgRuntimeError('LGUI-RT-130', `${where} 的 ArtText 缺字符「${char}」的图片 ${url}。`, `在 ${pkg} 包的 artfont/${font}/ 下加上 ${name}.png，登记进 package.xml 并导出。`), {where, char, url}, url);
  }
  const previous = shown.get(component);
  for (const glyph of previous?.glyphs ?? []) component.removeChild(glyph);
  const total = glyphs.reduce((sum, g) => sum + g.size.width, 0) + spacing * Math.max(0, glyphs.length - 1);
  const box = component.rect;
  let x = align === 'center' ? (box.width - total) / 2 : align === 'right' ? box.width - total : 0;
  const objects = glyphs.map(g => {
    const image = backend.createImage(g.url);
    image.touchable = false;
    image.rect = {x: Math.round(x), y: Math.round((box.height - g.size.height) / 2), width: g.size.width, height: g.size.height};
    x += g.size.width + spacing;
    component.addChild(image);
    return image;
  });
  shown.set(component, {text, glyphs: objects});
}
