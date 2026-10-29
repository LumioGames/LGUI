// 给 headless 后端的界面结构：.lgui/build/headless/<包名>.json。
// 每个组件的控件树：名字、类型、初始属性（按钮带音效）、控制器和页面、列表的子项组件、子组件引用；每个包的图片和声音。
import fs from 'node:fs';
import path from 'node:path';
import {parsePages} from './model.mjs';

const bool = (value, fallback) => value === undefined ? fallback : value === 'true';

// 按钮的音效地址：ui://包ID资源ID 换成 ui://包名/声音名（运行时和测试里都用这种写法），别的写法照写。
function soundUrl(model, url) {
  const m = /^ui:\/\/([a-z0-9]{8})([a-z0-9]{8})$/.exec(url);
  const pkg = m && model?.byId.get(m[1]);
  const sound = pkg?.resources.find(r => r.id === m[2] && r.type === 'sound');
  return sound ? `ui://${pkg.name}/${sound.name}` : url;
}

// <Button sound="…" volume="百分比"/> → {sound, soundVolume}（只放写了的）。
function buttonSound(model, attrs = {}) {
  const p = {};
  if (attrs.sound !== undefined && attrs.sound !== '') p.sound = soundUrl(model, attrs.sound);
  if (attrs.volume !== undefined) p.soundVolume = Number(attrs.volume) / 100;
  return p;
}

function props(child, model) {
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
    Object.assign(p, buttonSound(model, button));
  }
  if (child.kind === 'progress') {
    const bar = child.children.find(node => node.tag === 'ProgressBar')?.attrs ?? {};
    p.value = Number(bar.value ?? 0);
    p.max = Number(bar.max ?? 100);
  }
  if (child.kind === 'graph') p.color = a.fillColor ?? '#ffffff';
  return p;
}

export function describeComponent(component, model) {
  return {
    name: component.fullName,
    id: component.id,
    exported: component.exported,
    extension: component.extension,
    buttonMode: component.buttonMode,
    ...(component.extension === 'Button' ? buttonSound(model, component.root.children.find(node => node.tag === 'Button')?.attrs) : {}),
    size: component.size.split(',').map(Number),
    controllers: component.controllers.map(c => ({name: c.name, pages: c.pages.map(page => page.name), selected: c.pages[c.selected]?.name ?? c.pages[0]?.name ?? null})),
    transitions: component.transitions,
    children: component.children.filter(child => child.kind && child.name).map(child => ({
      name: child.name,
      elementId: child.id,
      kind: child.kind,
      ref: child.tag === 'component' ? child.ref?.fullName ?? null : null,
      defaultItem: child.kind === 'list' ? child.ref?.fullName ?? null : null,
      rect: [...(child.attrs.xy ?? '0,0').split(',').map(Number), ...(child.attrs.size ?? '0,0').split(',').map(Number)],
      props: props(child, model),
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
    const sounds = pkg.resources.filter(r => r.type === 'sound').map(r => ({id: r.id, name: r.name}));
    fs.writeFileSync(file, JSON.stringify({schemaVersion: 1, package: pkg.name, id: pkg.id, components: pkg.components.map(c => describeComponent(c, model)), images, sounds}, null, 2) + '\n');
    files.push(file);
  }
  return {files};
}

export {parsePages};
