// 通用资源清单（lgui ui list --shared）：哪些东西是通用的、谁在用、哪些可以合并。
// 全部从工程里现算（package.xml、组件 XML、src/ 里写死的地址），不靠手写的清单，所以不会过期。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Common 包里框架固定的组件和必有控件（UI 开发规范第 10 节）。lgui check 的 LGUI-UI-014 也用这张表。
export const COMMON_FIXED = {
  Toast: ['text'], Confirm: ['title', 'message', 'ok', 'cancel'], Loading: ['text'], ActionHintBar: ['list'], ActionHint: ['key', 'label'],
  RedDot: ['count'], HoldProgress: [], ArtText: []
};
// 框架用到、但允许不带的图片。
const COMMON_FIXED_IMAGES = ['placeholder'];

const KINDS = {component: 'component', image: 'image', sound: 'sound', movieclip: 'movieclip'};
const CONFIG = '工程配置';
const posix = file => file.split(path.sep).join('/');

/** ui:// 地址指向的资源：ui://<包ID><资源ID> 或 ui://<包名>/<资源名>。找不到返回 null。 */
export function resourceByUrl(model, url) {
  const m = /^ui:\/\/(?:([a-z0-9]{8})([a-z0-9]{8})|([A-Z][A-Za-z0-9]*)\/(.+))$/.exec(url ?? '');
  const pkg = m && (m[1] ? model.byId.get(m[1]) : model.packages.find(p => p.name === m[3]));
  const res = pkg?.resources.find(r => m[1] ? r.id === m[2] : r.name === m[4]);
  return res ? {pkg, res} : null;
}

const isArtfont = res => /^\/?artfont\//.test(res.path.replace(/^\/+/, ''));
const artfontName = res => res.path.replace(/^\/+|\/+$/g, '').split('/')[1];

// 一个组件里出现的全部 ui:// 地址（装载器、按钮和标签的图标、齿轮、音效、下拉框选项）。
function urlsIn(child) {
  const urls = [];
  const take = value => { if (typeof value === 'string' && value.startsWith('ui://')) urls.push(value); };
  take(child.attrs.url);
  take(child.attrs.icon);
  for (const node of child.children ?? []) {
    for (const key of ['icon', 'selectedIcon', 'sound', 'url']) take(node.attrs?.[key]);
    if (node.tag === 'gearIcon') for (const value of [...(node.attrs.values ?? '').split('|'), node.attrs.default ?? '']) take(value);
    for (const item of node.children ?? []) take(item.attrs?.icon);
  }
  return urls;
}

/**
 * 找出每个资源被谁引用。返回 Map<资源, Map<使用者名字, 分组>>：
 * 使用者是组件全名（Bag/BagPanel）、代码文件（src/modules/bag/BagView.ts）或「工程配置」；分组用来数「几个地方在用」（包名，或 src:<功能目录>）。
 */
export function collectUsage(model, {projectRoot = null, project = null} = {}) {
  const usage = new Map();
  const use = (res, user, group) => {
    if (!res) return;
    if (!usage.has(res)) usage.set(res, new Map());
    usage.get(res).set(user, group);
  };
  const artfonts = new Map(); // "<包>/<字体名>" → 这个美术字的全部字符图片
  for (const pkg of model.packages) for (const res of pkg.resources) {
    if (res.type === 'image' && isArtfont(res)) {
      const key = `${pkg.name}/${artfontName(res)}`;
      if (!artfonts.has(key)) artfonts.set(key, []);
      artfonts.get(key).push(res);
    }
  }
  for (const pkg of model.packages) {
    for (const component of pkg.components) {
      const user = component.fullName;
      // 按钮组件自己的音效写在根节点下的 <Button sound="…"/> 里
      for (const node of component.root.children) if (typeof node.attrs?.sound === 'string') use(resourceByUrl(model, node.attrs.sound)?.res, user, pkg.name);
      for (const child of component.children) {
        if (child.ref) use(child.ref.resource, user, pkg.name);
        if (child.tag === 'image' || child.tag === 'movieclip') {
          const target = child.attrs.pkg ? model.byId.get(child.attrs.pkg) : pkg;
          use(target?.resources.find(r => r.id === child.attrs.src), user, pkg.name);
        }
        for (const url of urlsIn(child)) use(resourceByUrl(model, url)?.res, user, pkg.name);
        const font = /(?:^|;)font=([^;]+)/.exec(child.attrs.customData ?? '')?.[1];
        for (const glyph of artfonts.get(font) ?? []) use(glyph, user, pkg.name);
      }
    }
  }
  if (project) {
    for (const url of [project.placeholder, project.sounds?.click]) use(resourceByUrl(model, url)?.res, CONFIG, CONFIG);
  }
  if (projectRoot) {
    const src = path.join(projectRoot, 'src');
    const scan = dir => {
      for (const entry of fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes: true}) : []) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { scan(full); continue; }
        if (!/\.tsx?$/.test(entry.name)) continue;
        const text = fs.readFileSync(full, 'utf8');
        const rel = posix(path.relative(projectRoot, full));
        const parts = posix(path.relative(src, full)).split('/');
        const group = `src:${parts[0] === 'modules' && parts.length > 2 ? parts[1] : parts[0]}`;
        for (const m of text.matchAll(/ui:\/\/[A-Za-z0-9_@/.-]+/g)) use(resourceByUrl(model, m[0])?.res, rel, group);
        // View 的 static component = '<包>/<组件>'（竖版 @portrait 跟着横版一起算）
        for (const m of text.matchAll(/static\s+component\s*=\s*['"]([A-Z][A-Za-z0-9]*)\/([A-Za-z0-9]+)['"]/g)) {
          const target = model.packages.find(p => p.name === m[1]);
          for (const component of target?.components ?? []) if (component.name === m[2] || component.name === `${m[2]}@portrait`) use(component.resource, rel, group);
        }
      }
    };
    scan(src);
  }
  return usage;
}

// 功能包里的东西算不算「被外面用到」：别的包的界面引用了算；代码引用要两个以上的功能目录都用到才算
// （一个功能自己的 View 用自己包里的组件是正常情况，代码目录和包名对不上号，没法一一对应）。
function outsideUsers(users, pkgName) {
  const ui = [...users].filter(([, group]) => !group.startsWith('src:') && group !== pkgName);
  const code = [...users].filter(([, group]) => group.startsWith('src:'));
  return new Set(code.map(([, group]) => group)).size >= 2 ? [...ui, ...code] : ui;
}

const hashFile = file => crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');

/** 内容完全一样、却在不同的包里各登记了一份的图片。返回 [[{pkg, res}, …], …]（每组至少两个）。美术字的字符图片不算。 */
export function duplicateImages(model) {
  const byHash = new Map();
  for (const pkg of model.packages) for (const res of pkg.resources) {
    if (res.type !== 'image' || isArtfont(res) || !fs.existsSync(res.file)) continue;
    const hash = hashFile(res.file);
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push({pkg, res});
  }
  return [...byHash.values()].filter(group => new Set(group.map(item => item.pkg.name)).size > 1);
}

// 组件的「长相」：扩展类型 + 有名字的控件（名字:类型）。至少 3 个有名字的控件才比，太小的组件碰巧一样不说明什么。
function signature(component) {
  const named = component.children.filter(child => child.name && child.kind).map(child => `${child.name}:${child.kind}`).sort();
  return named.length >= 3 ? `${component.extension ?? ''}|${named.join(',')}` : null;
}

function describe(pkg, res, model) {
  const base = {kind: KINDS[res.type] ?? res.type, name: `${pkg.name}/${res.name}`, package: pkg.name, exported: res.exported};
  if (res.type === 'component') {
    const component = pkg.components.find(c => c.resource === res);
    const [width, height] = (component?.size ?? '0,0').split(',').map(Number);
    return {...base, size: [width, height], extension: component?.extension ?? null,
      controls: (component?.children ?? []).filter(child => child.name && child.kind).map(child => ({name: child.name, kind: child.kind}))};
  }
  if (res.type === 'image') {
    const size = res.attrs.width && res.attrs.height ? [Number(res.attrs.width), Number(res.attrs.height)] : null;
    return {...base, size, scale: res.attrs.scale ?? null, scale9grid: res.attrs.scale9grid ?? null};
  }
  void model;
  return base;
}

/**
 * 通用资源清单。
 * shared：Common 包里的、被别的包引用的、项目字体、美术字；每项带 layer（framework 框架自带 / project 项目通用）、usedBy、note。
 * candidates：可以合并的候选（不同包里内容一样的图片、长得一样的组件）。
 */
export function buildCatalog(model, {projectRoot = null, project = null} = {}) {
  const usage = collectUsage(model, {projectRoot, project});
  const shared = [];
  const fontGroups = new Map();
  for (const pkg of model.packages) {
    const isCommon = pkg.name === 'Common';
    for (const res of pkg.resources) {
      const users = usage.get(res) ?? new Map();
      const outside = outsideUsers(users, pkg.name);
      if (res.type === 'image' && isArtfont(res)) {
        const key = `${pkg.name}/${artfontName(res)}`;
        if (!fontGroups.has(key)) fontGroups.set(key, {kind: 'artfont', name: key, package: pkg.name, layer: 'project', glyphs: 0, users: new Map()});
        const group = fontGroups.get(key);
        group.glyphs++;
        for (const [user, g] of users) group.users.set(user, g);
        continue;
      }
      if (res.type === 'image' && /@[^/]+$/.test(res.name)) continue; // 带字图片的各语言版本跟着默认版本走
      if (!isCommon && outside.length === 0) continue;
      const fixed = isCommon && (res.type === 'component' ? res.name in COMMON_FIXED : res.type === 'image' && COMMON_FIXED_IMAGES.includes(res.name));
      const entry = {...describe(pkg, res, model), layer: fixed ? 'framework' : 'project', usedBy: [...users.keys()].sort()};
      if (fixed && res.type === 'component') entry.required = COMMON_FIXED[res.name];
      const groups = new Set(users.values());
      if (!isCommon) entry.note = `放在功能包 ${pkg.name} 里，已经被 ${[...new Set(outside.map(([, g]) => g))].sort().join('、')} 用到`;
      else if (!fixed && users.size === 0) entry.note = '没找到引用（代码里拼出来的地址查不到）';
      else if (!fixed && !groups.has(pkg.name) && !groups.has(CONFIG) && groups.size === 1) entry.note = `只有 ${[...groups][0]} 在用`;
      shared.push(entry);
    }
  }
  for (const group of fontGroups.values()) {
    if (group.package !== 'Common' && outsideUsers(group.users, group.package).length === 0) continue;
    shared.push({kind: 'artfont', name: group.name, package: group.package, layer: 'project', glyphs: group.glyphs, usedBy: [...group.users.keys()].sort()});
  }
  if (projectRoot) {
    const fonts = path.join(projectRoot, 'ui', 'fonts');
    for (const file of fs.existsSync(fonts) ? fs.readdirSync(fonts).sort() : []) {
      if (!/\.(ttf|otf)$/i.test(file)) continue;
      const name = file.replace(/\.[^.]+$/, '');
      shared.push({kind: 'font', name, file: `ui/fonts/${file}`, layer: 'project', default: project?.defaultFont === name, usedBy: []});
    }
  }
  const candidates = [];
  for (const group of duplicateImages(model)) {
    candidates.push({reason: 'same-image', items: group.map(item => `${item.pkg.name}/${item.res.name}`).sort(), hint: '内容一样的图片登记了好几份：留一份放进 Common，别的包跨包引用。'});
  }
  const bySignature = new Map();
  for (const pkg of model.packages) for (const component of pkg.components) {
    if (component.name.includes('@')) continue;
    const sig = signature(component);
    if (!sig) continue;
    if (!bySignature.has(sig)) bySignature.set(sig, []);
    bySignature.get(sig).push(component);
  }
  for (const group of bySignature.values()) {
    if (new Set(group.map(component => component.pkg.name)).size < 2) continue;
    candidates.push({reason: 'same-structure', items: group.map(component => component.fullName).sort(),
      controls: group[0].children.filter(child => child.name && child.kind).map(child => child.name),
      hint: '这几个组件的控件名和类型完全一样：看看能不能合成一个放进 Common。'});
  }
  shared.sort((a, b) => (a.layer === b.layer ? 0 : a.layer === 'framework' ? -1 : 1) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
  return {shared, candidates};
}

const LAYER = {framework: '框架自带', project: '项目通用'};
const KIND = {component: '组件', image: '图片', sound: '声音', movieclip: '序列帧', font: '字体', artfont: '美术字'};

export function formatCatalog({shared, candidates}) {
  const lines = [];
  for (const layer of ['framework', 'project']) {
    const items = shared.filter(item => item.layer === layer);
    if (!items.length) continue;
    lines.push(`${LAYER[layer]}（${items.length}）`);
    for (const item of items) {
      const detail = [];
      if (item.size) detail.push(item.size.join('×'));
      if (item.scale9grid) detail.push(`九宫格 ${item.scale9grid}`);
      if (item.scale === 'tile') detail.push('平铺');
      if (item.extension) detail.push(item.extension);
      if (item.glyphs) detail.push(`${item.glyphs} 个字符`);
      if (item.default) detail.push('默认字体');
      if (item.required?.length) detail.push(`必有控件 ${item.required.join('、')}`);
      const used = item.kind === 'font' ? '' : item.layer === 'framework' ? '' : `  ${item.usedBy.length} 处在用`;
      lines.push(`  ${KIND[item.kind] ?? item.kind}  ${item.name}${detail.length ? `  [${detail.join('，')}]` : ''}${used}${item.note ? `  ← ${item.note}` : ''}`);
      if (item.controls?.length) lines.push(`    控件：${item.controls.map(control => `${control.name}（${control.kind}）`).join('、')}`);
    }
  }
  if (candidates.length) {
    lines.push(`可以合并的候选（${candidates.length}）`);
    for (const candidate of candidates) lines.push(`  ${candidate.items.join(' = ')}  → ${candidate.hint}`);
  }
  if (!lines.length) lines.push('还没有通用资源。');
  return lines;
}
