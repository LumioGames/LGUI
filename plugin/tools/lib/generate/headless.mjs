// 给 headless 后端的界面结构：.lgui/build/headless/<包名>.json。
// 每个组件的控件树：名字、类型、初始属性、控制器和页面、列表的子项组件、子组件引用。
import fs from 'node:fs';
import path from 'node:path';
import {parsePages} from './model.mjs';

const bool = (value, fallback) => value === undefined ? fallback : value === 'true';

function props(child) {
  const a = child.attrs;
  const p = {visible: bool(a.visible, true), enabled: !bool(a.grayed, false), touchable: bool(a.touchable, true)};
  if (a.customData) p.customData = a.customData;
  if (['text', 'richtext', 'input'].includes(child.kind)) p.text = a.text ?? '';
  if (child.kind === 'input') p.promptText = a.prompt ?? '';
  if (child.kind === 'loader') p.url = a.url ?? '';
  if (child.kind === 'button') {
    const button = child.children.find(node => node.tag === 'Button')?.attrs ?? {};
    p.title = button.title ?? '';
    p.icon = button.icon ?? '';
    p.selected = button.checked === 'true';
  }
  if (child.kind === 'progress') {
    const bar = child.children.find(node => node.tag === 'ProgressBar')?.attrs ?? {};
    p.value = Number(bar.value ?? 0);
    p.max = Number(bar.max ?? 100);
  }
  if (child.kind === 'graph') p.color = a.fillColor ?? '#ffffff';
  return p;
}

export function describeComponent(component) {
  return {
    name: component.fullName,
    id: component.id,
    exported: component.exported,
    extension: component.extension,
    size: component.size.split(',').map(Number),
    controllers: component.controllers.map(c => ({name: c.name, pages: c.pages.map(page => page.name), selected: c.pages[c.selected]?.name ?? c.pages[0]?.name ?? null})),
    transitions: component.transitions,
    children: component.children.filter(child => child.kind && child.name).map(child => ({
      name: child.name,
      kind: child.kind,
      ref: child.tag === 'component' ? child.ref?.fullName ?? null : null,
      defaultItem: child.kind === 'list' ? child.ref?.fullName ?? null : null,
      rect: [...(child.attrs.xy ?? '0,0').split(',').map(Number), ...(child.attrs.size ?? '0,0').split(',').map(Number)],
      props: props(child),
      // 按钮自带的 button 控制器、组件实例上覆写的控制器页面
      overrides: child.children.filter(node => node.tag === 'Button' || node.tag === 'ProgressBar').map(node => ({tag: node.tag, attrs: node.attrs}))
    }))
  };
}

// 图片尺寸：package.xml 里写了就用它，否则读 PNG 文件头（JPG 等读不出来时是 0）。
function imageSize(resource) {
  const w = Number(resource.attrs.width), h = Number(resource.attrs.height);
  if (w > 0 && h > 0) return {width: w, height: h};
  try {
    const head = fs.readFileSync(resource.file).subarray(0, 24);
    if (head.subarray(1, 4).toString() === 'PNG') return {width: head.readUInt32BE(16), height: head.readUInt32BE(20)};
  } catch {
    // 文件不在：lgui check 会报 LGUI-UI-018
  }
  return {width: 0, height: 0};
}

export function generateHeadless(model, out) {
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(out, {recursive: true});
  const files = [];
  for (const pkg of model.packages) {
    const file = path.join(out, `${pkg.name}.json`);
    const images = pkg.resources.filter(r => r.type === 'image').map(r => ({name: r.name, ...imageSize(r)}));
    fs.writeFileSync(file, JSON.stringify({schemaVersion: 1, package: pkg.name, id: pkg.id, components: pkg.components.map(describeComponent), images}, null, 2) + '\n');
    files.push(file);
  }
  return {files};
}

export {parsePages};
