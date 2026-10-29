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
  if (child.kind === 'label') {
    // 没写 title 时显示标签组件里 title 文字自己的内容（和 FairyGUI 一样）。
    const label = child.children.find(node => node.tag === 'Label')?.attrs ?? {};
    if (label.title !== undefined) p.title = label.title;
    p.icon = label.icon ?? '';
  }
  if (child.kind === 'slider') {
    const slider = child.children.find(node => node.tag === 'Slider')?.attrs ?? {};
    p.value = Number(slider.value ?? 50);
    p.max = Number(slider.max ?? 100);
    p.min = Number(slider.min ?? 0);
  }
  if (child.kind === 'combobox') {
    // 和 FairyGUI 一样：写了 title 就选中同名的项，否则有项时选第一项。
    const combo = child.children.find(node => node.tag === 'ComboBox');
    p.items = (combo?.children ?? []).filter(node => node.tag === 'item').map(node => node.attrs.title ?? '');
    p.selectedIndex = combo?.attrs.title !== undefined ? p.items.indexOf(combo.attrs.title) : p.items.length ? 0 : -1;
  }
  if (child.kind === 'movieclip') {
    p.playing = bool(a.playing, true);
    p.frame = Number(a.frame ?? 0);
  }
  if (child.kind === 'tree') p.clickToExpand = Number(a.clickToExpand ?? 0);
  return p;
}

// 齿轮：gearDisplay、gearDisplay2 控制显示（页 ID 换成页名）；其他齿轮 headless 不模拟。
function gears(node, component) {
  const pageNames = name => new Map(component.controllers.find(c => c.name === name)?.pages.map(page => [page.id, page.name]) ?? []);
  const result = {};
  for (const gear of node.children.filter(n => n.tag === 'gearDisplay' || n.tag === 'gearDisplay2')) {
    const names = pageNames(gear.attrs.controller);
    if (!names.size) continue; // 控制器不存在时 FairyGUI 也忽略这个齿轮
    const pages = (gear.attrs.pages ?? '').split(',').filter(Boolean).map(id => names.get(id) ?? `#${id}`); // 找不到的页 ID 留着：永远对不上，和 FairyGUI 一样
    if (gear.tag === 'gearDisplay') result.display = {controller: gear.attrs.controller, pages};
    else result.display2 = {controller: gear.attrs.controller, pages, condition: Number(gear.attrs.condition ?? 0)};
  }
  return Object.keys(result).length ? result : undefined;
}

export function describeComponent(component) {
  return {
    name: component.fullName,
    id: component.id,
    exported: component.exported,
    extension: component.extension,
    buttonMode: component.buttonMode,
    wholeNumbers: component.wholeNumbers ?? undefined,
    size: component.size.split(',').map(Number),
    controllers: component.controllers.map(c => ({name: c.name, pages: c.pages.map(page => page.name), selected: c.pages[c.selected]?.name ?? c.pages[0]?.name ?? null})),
    transitions: component.transitions,
    // 组（group）：不进控件树，只记显示状态，组里的控件跟着它显隐。
    groups: component.children.filter(child => child.tag === 'group').map(group => ({
      id: group.id, name: group.name ?? '', visible: bool(group.attrs.visible, true), group: group.attrs.group ?? null, gears: gears(group, component)
    })),
    children: component.children.filter(child => child.kind && child.name).map(child => ({
      name: child.name,
      elementId: child.id,
      kind: child.kind,
      ref: child.tag === 'component' ? child.ref?.fullName ?? null : null,
      defaultItem: child.kind === 'list' || child.kind === 'tree' ? child.ref?.fullName ?? null : null,
      rect: [...(child.attrs.xy ?? '0,0').split(',').map(Number), ...(child.attrs.size ?? '0,0').split(',').map(Number)],
      props: props(child),
      group: child.attrs.group ?? null,
      gears: gears(child, component),
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
