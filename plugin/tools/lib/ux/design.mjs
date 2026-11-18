// UX 设计稿 design.json 的校验和汇总（lgui ux page 用）。
// 设计稿只有这一个源文件：元素只列一遍，方向管位置、语言管文字、平台管能不能做。字段说明见 skills/lgui-ux/references/design-json.md。
import fs from 'node:fs';
import path from 'node:path';
import {referencesDir, templatesDir} from '../paths.mjs';
import {COMMON_FIXED} from '../generate/catalog.mjs';
import {BINDING_WORDS} from '../check/mvc-rules.mjs';
import {defaultVerifySizes} from '../project.mjs';

export const TYPES = ['button', 'label', 'component', 'list', 'tree', 'loader', 'image', 'text', 'richtext', 'input', 'graph', 'progress', 'slider', 'combobox', 'movieclip', 'group'];
export const SCOPES = ['full', 'stub', 'display'];
export const SOURCES = ['measured', 'estimated', 'designed'];
export const REUSE = ['framework', 'reskin', 'pattern', 'project', 'new', 'none'];
export const LAYERS = ['page', 'popup', 'modal', 'hud', 'toast'];
export const OVERFLOW = ['shrink', 'ellipsis', 'height', 'both'];
const ORIENTATIONS = ['portrait', 'landscape'];
const H_ANCHORS = ['left', 'center', 'right', 'stretch'];
const V_ANCHORS = ['top', 'middle', 'bottom', 'stretch'];
const ASSET_KINDS = ['image', 'illustration', 'textImage', 'sound', 'font', 'artfont', 'icon'];
const ASSET_BY = ['ai', 'artist', 'code', 'existing'];
const RUNNERS = ['headless', 'browser', 'visual'];
const RTL = ['ar', 'he', 'fa', 'ur'];

// 和框架、lgui check 一致的数：最小字号（LGUI-UI-011）、描边加投影的上限（LGUI-UI-081）、图集上限（LGUI-CLI-113）。
const MIN_FONT = 20;
const STROKE_RATIO = 0.075;
const MAX_ATLAS = 4096;
// 经验值：最小手机上字小于 8 像素看不清；能点的东西小于 24 像素点不准；同一页图集里尺寸差 2.5 倍以上整页缩放会把小的缩没（LGUI-CLI-111）。
const MIN_TEXT_PX = 8;
const MIN_TAP_PX = 24;
const SHEET_RATIO = 2.5;
// 操作提示栏的高度（UI 开发规范第 10 节）。
const HINT_BAR = 64;

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isRect = v => Array.isArray(v) && v.length === 4 && v.every(Number.isFinite) && v[2] >= 0 && v[3] >= 0;
const isSize = v => Array.isArray(v) && v.length === 2 && v.every(n => Number.isFinite(n) && n > 0);
const isColor = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v);

/** 工程方向要求的方向列表。 */
export const orientationsOf = project => project.orientation === 'both' ? ORIENTATIONS : [project.orientation];

/** 一个元素在某个方向下的值：写成 {portrait, landscape} 的取对应方向，直接写值的两个方向通用。 */
export function perOrientation(value, orientation) {
  return isObject(value) && ORIENTATIONS.some(o => o in value) ? value[orientation] : value;
}

/** 贴边写法 "left-top" → {h, v}；"fill" 是 stretch-stretch。写错返回 null。 */
export function parseAnchor(text) {
  if (text === 'fill') return {h: 'stretch', v: 'stretch'};
  const [h, v] = String(text ?? '').split('-');
  return H_ANCHORS.includes(h) && V_ANCHORS.includes(v) ? {h, v} : null;
}

// 一个字大概多宽（按字号的倍数）：中日韩和全角 1，大写和数字 0.62，小写 0.52，空格 0.3，其余 0.55。只是估算。
export function estimateWidth(text, fontSize) {
  let em = 0;
  for (const ch of String(text)) {
    const code = ch.codePointAt(0);
    if (code >= 0x2e80) em += 1;
    else if (ch === ' ') em += 0.3;
    else if (/[A-Z0-9]/.test(ch)) em += 0.62;
    else if (/[a-z]/.test(ch)) em += 0.52;
    else em += 0.55;
  }
  return em * fontSize;
}

function luminance(color) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// 设计稿引用的框架能力（format.compact、lgui.toast、绑定词 roll…）存不存在：绑定词查词表，其余查规范原文里有没有这个写法。
let specText = null;
function inSpec(token) {
  specText ??= ['mvc-spec.md', 'ui-spec.md'].map(name => fs.readFileSync(path.join(referencesDir, name), 'utf8')).join('\n');
  return specText.includes(token);
}
const patterns = () => fs.readdirSync(path.join(templatesDir, 'patterns')).filter(name => !name.startsWith('.')).sort();

/** 工程配置里和设计有关的几项，没写的用 LGUI 的默认值。 */
export function projectConditions(design, project = null) {
  const own = isObject(design.project) ? design.project : {};
  const size = s => Array.isArray(s) ? s : s ? [s.width, s.height] : null;
  const fromProject = project ? {
    orientation: project.orientation,
    designSize: {portrait: size(project.designSize.portrait), landscape: size(project.designSize.landscape)},
    languages: project.languages, defaultLanguage: project.defaultLanguage, verifySizes: project.verifySizes
  } : {};
  const merged = {
    orientation: 'both', designSize: {portrait: [1080, 1920], landscape: [1920, 1080]}, languages: ['zh-CN', 'en'], defaultLanguage: 'zh-CN',
    verifySizes: defaultVerifySizes, platforms: ['web'], inputs: ['touch'],
    ...fromProject, ...own
  };
  merged.designSize = {...{portrait: [1080, 1920], landscape: [1920, 1080]}, ...(fromProject.designSize ?? {}), ...(isObject(own.designSize) ? own.designSize : {})};
  return merged;
}

/**
 * 校验设计稿。catalog：{components:Set, resources:Set} 工程里已有的「包/名字」，没有工程时是 null。
 * 返回 {problems: [{level:'error'|'warning', rule, where, message, fix}], conditions, summary, fit}。
 */
export function validateDesign(design, {dir, project = null, catalog = null, pluginVersion = null} = {}) {
  const problems = [];
  const error = (rule, where, message, fix) => problems.push({level: 'error', rule, where, message, fix});
  const warn = (rule, where, message, fix) => problems.push({level: 'warning', rule, where, message, fix});
  const oneOf = (value, list, where, name) => {
    if (!list.includes(value)) { error('field', where, `${name} 写的是 ${JSON.stringify(value)}。`, `只能是 ${list.join('、')}。`); return false; }
    return true;
  };

  if (!isObject(design)) { error('field', 'design.json', '最外层要是一个对象。', '照 design-json.md 的例子写。'); return {problems, conditions: null, summary: null, fit: {}}; }
  if (typeof design.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(design.name)) error('field', 'name', 'name 要是小写字母开头的短名字（小写字母、数字、连字符）。', '比如 "lobby"。');
  oneOf(design.mode ?? 'design', ['design', 'full'], 'mode', 'mode');
  if (!isObject(design.source) || !['screenshot', 'mockup', 'wireframe'].includes(design.source.kind) || typeof design.source.original !== 'boolean') {
    error('field', 'source', 'source 要写原型图是什么（kind）和是不是自己的作品（original）。', '写成 {"kind": "screenshot" | "mockup" | "wireframe", "original": true | false}；不是自己的作品时角色、名字、图案都要换成原创。');
  }
  const conditions = projectConditions(design, project);
  if (oneOf(conditions.orientation, ['both', 'portrait', 'landscape'], 'project.orientation', 'orientation')) {
    for (const o of orientationsOf(conditions)) if (!isSize(conditions.designSize[o])) error('field', `project.designSize.${o}`, `缺 ${o} 的设计尺寸。`, '写成 [宽, 高]。');
  }
  for (const key of ['languages', 'platforms', 'inputs']) if (!Array.isArray(conditions[key]) || conditions[key].length === 0) error('field', `project.${key}`, `${key} 要是非空数组。`, '照 design-json.md 写。');
  for (const p of conditions.platforms ?? []) oneOf(p, ['web', 'unity'], 'project.platforms', '平台');
  for (const p of conditions.inputs ?? []) oneOf(p, ['touch', 'keyboardMouse'], 'project.inputs', '输入设备');
  if (!conditions.languages?.includes(conditions.defaultLanguage)) error('field', 'project.defaultLanguage', `默认语言 ${conditions.defaultLanguage} 不在 languages 里。`, '加进 languages，或者改默认语言。');
  for (const lang of conditions.languages ?? []) if (RTL.includes(String(lang).split('-')[0])) warn('language-rtl', 'project.languages', `${lang} 是从右往左排的语言，LGUI 第一版不支持。`, '先和用户确认这种语言要不要做。');
  if (problems.some(p => p.level === 'error')) return {problems, conditions, summary: null, fit: {}};

  const orientations = orientationsOf(conditions);
  const languages = conditions.languages;
  if (pluginVersion && design.lguiVersion && design.lguiVersion !== pluginVersion) warn('version', 'lguiVersion', `设计稿是按 LGUI ${design.lguiVersion} 出的，现在的插件是 ${pluginVersion}。`, '对照更新记录看复用来源和框架能力有没有变，改完把 lguiVersion 写成现在的版本。');

  // ---- 编号 ----
  const ids = new Map();
  const claim = (id, where, kind) => {
    if (typeof id !== 'string' || !id) { error('id', where, `${kind}缺 id。`, '每一项都要有编号，后面的资源、用例都靠它对上。'); return false; }
    if (ids.has(id)) { error('id', where, `编号 ${id} 重复了（另一个在 ${ids.get(id)}）。`, '编号在整份设计稿里唯一。'); return false; }
    ids.set(id, where);
    return true;
  };
  const screens = Array.isArray(design.screens) ? design.screens : [];
  if (!screens.length) error('field', 'screens', '至少要有一个画面。', '在 screens 里写。');
  const components = Array.isArray(design.components) ? design.components : [];
  const assets = Array.isArray(design.assets) ? design.assets : [];
  const cases = Array.isArray(design.cases) ? design.cases : [];
  const open = Array.isArray(design.open) ? design.open : [];
  const screenIds = new Set(screens.map(s => s?.id));
  const componentIds = new Set(components.map(c => c?.id));
  const assetIds = new Set(assets.map(a => a?.id));
  const elements = [];
  for (const [i, screen] of screens.entries()) {
    if (!isObject(screen) || !claim(screen.id, `screens[${i}]`, '画面')) continue;
    for (const [j, el] of (Array.isArray(screen.elements) ? screen.elements : []).entries()) {
      if (isObject(el) && claim(el.id, `${screen.id}.elements[${j}]`, '元素')) elements.push({el, screen});
    }
  }
  for (const [i, c] of components.entries()) if (isObject(c)) claim(c.id, `components[${i}]`, '组件');
  for (const [i, a] of assets.entries()) if (isObject(a)) claim(a.id, `assets[${i}]`, '资源');
  for (const [i, c] of cases.entries()) if (isObject(c)) claim(c.id, `cases[${i}]`, '用例');
  for (const [i, q] of open.entries()) if (isObject(q)) claim(q.id, `open[${i}]`, '未定事项');
  const elementIds = new Set(elements.map(e => e.el.id));

  // ---- 原型图 ----
  for (const [i, ref] of (Array.isArray(design.references) ? design.references : []).entries()) {
    const where = `references[${i}]`;
    if (!isObject(ref) || typeof ref.file !== 'string') { error('field', where, '原型图要写 file。', '写成 {"file": "reference/xxx.png", "screen": "<画面编号>", "orientation": "portrait", "scale": 1.2}。'); continue; }
    if (dir && !fs.existsSync(path.join(dir, ref.file))) error('reference', where, `找不到原型图 ${ref.file}。`, '路径相对 design.json 所在的文件夹。');
    if (!screenIds.has(ref.screen)) error('reference', where, `原型图指向的画面 ${ref.screen} 不存在。`, '写 screens 里的编号。');
    oneOf(ref.orientation, ORIENTATIONS, where, 'orientation');
    if (!(ref.scale > 0)) error('field', where, 'scale 要是正数（设计单位 = 原图像素 × scale）。', '比如原图宽 900、设计宽 1080 就写 1.2。');
  }

  // ---- 复用来源 ----
  const checkReuse = (reuse, where, {what}) => {
    if (!isObject(reuse) || !REUSE.includes(reuse.from)) {
      error('reuse', where, `${what}没写复用来源，或者写得不对。`, `reuse.from 只能是 framework（框架自带，直接用）、reskin（框架自带，换样子）、pattern（排布模式）、project（工程已有）、new（新建）、none（不需要组件）。`);
      return;
    }
    if (['framework', 'reskin', 'pattern', 'project'].includes(reuse.from) && typeof reuse.ref !== 'string') { error('reuse', where, `复用来源是 ${reuse.from}，要写 ref 指明用哪一个。`, '比如 {"from": "reskin", "ref": "Common/RedDot"}。'); return; }
    if (reuse.from === 'pattern' && !patterns().includes(reuse.ref)) error('reuse', where, `没有 ${reuse.ref} 这种排布模式。`, `能用的：${patterns().join('、')}（UI 开发规范第 7.4 节）。`);
    if (reuse.from === 'framework' || reuse.from === 'reskin') {
      const name = reuse.ref.replace(/^Common\//, '');
      if (!reuse.ref.startsWith('Common/') || !(name in COMMON_FIXED || name === 'Button')) error('reuse', where, `框架没有自带 ${reuse.ref}。`, `框架自带的组件：${[...Object.keys(COMMON_FIXED), 'Button'].map(n => 'Common/' + n).join('、')}（UI 开发规范第 10 节）；项目自己做的写 from: "project"。`);
    }
    if (reuse.from === 'project') {
      if (!catalog) warn('reuse-unchecked', where, `复用来源写的是工程已有的 ${reuse.ref}，但现在不在工程里，没法核对。`, '在工程目录里运行 lgui ux page，或者先建工程。');
      else if (!catalog.components.has(reuse.ref) && !catalog.resources.has(reuse.ref)) error('reuse', where, `工程里没有 ${reuse.ref}。`, '用 lgui ui list --shared 看有哪些现成的；还没有就写 from: "new"。');
    }
    if (conditions.platforms.includes('unity') && typeof reuse.ref === 'string' && reuse.ref.startsWith('icon://')) warn('platform-icon', where, `用了代码图标 ${reuse.ref}，但目标平台有 Unity。`, '代码图标只在网页端能用（导出 Unity 报 LGUI-CLI-144），换成 PNG 图片。');
  };
  const checkUses = (uses, where) => {
    for (const token of Array.isArray(uses) ? uses : []) {
      if (typeof token !== 'string' || !(BINDING_WORDS.includes(token) || inSpec(token))) error('uses', where, `框架里没有 ${JSON.stringify(token)} 这个能力。`, '绑定词见 MVC 开发规范第 6.4 节，常用工具见第 11 节；写规范里出现的写法，比如 "roll"、"format.compact"、"lgui.confirm"。');
    }
  };

  // ---- 文字 ----
  const fit = {}; // 元素编号 → {方向: {语言: 估算宽 / 框宽}}
  const smallest = orientation => {
    const [dw, dh] = conditions.designSize[orientation];
    let best = null;
    for (const size of conditions.verifySizes ?? []) {
      const portrait = size.height >= size.width;
      const [w, h] = portrait === (orientation === 'portrait') ? [size.width, size.height] : [size.height, size.width];
      const scale = Math.min(w / dw, h / dh);
      // 一样小时取本来就是这个方向的那组（手机横屏转过来和手机竖屏是同一个画面）
      const natural = portrait === (orientation === 'portrait');
      if (!best || scale < best.scale - 1e-9 || (Math.abs(scale - best.scale) < 1e-9 && natural && !best.natural)) best = {scale, name: size.name, natural};
    }
    return best ?? {scale: 1, name: '设计尺寸'};
  };
  const checkText = (text, where, {rect = null, id = null, textOnly = false} = {}) => {
    if (!isObject(text)) { error('text', where, 'text 要是一个对象。', '写成 {"content": {"zh-CN": "…"}, "fontSize": 28, "overflow": "shrink"}。'); return; }
    if (text.image === true) return; // 带字图片：字在图里，按资源查
    if (!isObject(text.content) || typeof text.content[conditions.defaultLanguage] !== 'string') error('text', where, `文字缺默认语言 ${conditions.defaultLanguage} 的内容。`, 'content 按语言写：{"zh-CN": "开始游戏", "en": "Start"}；会变的文字写当时显示的样子，并写 "dynamic": true。');
    if (!(text.fontSize > 0)) { error('text', where, '文字缺字号 fontSize（设计单位）。', '照原型图量。'); return; }
    if (!OVERFLOW.includes(text.overflow)) error('text', where, '文字没写超长怎么办（overflow）。', 'shrink 缩字、ellipsis 省略号、height 换行、both 框跟着变大，四选一（UI 开发规范第 8 节，lgui check 也会查）。');
    for (const key of ['color', 'background']) if (text[key] !== undefined && !isColor(text[key])) error('text', where, `${key} 写的 ${JSON.stringify(text[key])} 不是颜色。`, '写成 #rrggbb。');
    if (text.fontSize < MIN_FONT) warn('text-min-font', where, `字号 ${text.fontSize} 小于 ${MIN_FONT}。`, `拼界面时 lgui check 会报 LGUI-UI-011：改到 ${MIN_FONT} 以上，或者和用户确认这段字做成图片。`);
    const stroke = Array.isArray(text.stroke) ? Number(text.stroke[0]) : 0;
    const shadow = Array.isArray(text.shadow) ? Math.max(Math.abs(Number(text.shadow[0])), Math.abs(Number(text.shadow[1]))) : 0;
    if (stroke + shadow > text.fontSize * STROKE_RATIO + 1e-9) {
      warn('text-stroke', where, `描边 ${stroke} 加投影 ${shadow} 超过了字号 ${text.fontSize} 的 7.5%（最多 ${Math.round(text.fontSize * STROKE_RATIO * 10) / 10}）。`, '拼界面时 lgui check 会报 LGUI-UI-081（网页和 Unity 都画不出这么粗）：减细描边和投影，或者用美术字（ArtText）、带字图片，三选一记进设计稿。');
    }
    for (const orientation of orientations) {
      const small = smallest(orientation);
      if (text.fontSize * small.scale < MIN_TEXT_PX) warn('text-small', where, `字号 ${text.fontSize} 在 ${small.name}（${orientation}）上只有 ${Math.round(text.fontSize * small.scale * 10) / 10} 像素。`, `小于 ${MIN_TEXT_PX} 像素基本看不清：放大字号，或者确认这个尺寸不在目标设备里。`);
    }
    if (isColor(text.color) && isColor(text.background) && !stroke) {
      const ratio = contrast(text.color, text.background);
      if (ratio < 3) warn('text-contrast', where, `文字 ${text.color} 压在 ${text.background} 上，对比度只有 ${Math.round(ratio * 10) / 10}。`, '低于 3 看不清：换颜色，或者加描边。');
    }
    // 各语言放不放得下：没翻译的按默认语言加长 40% 估（和 lgui verify --lang pseudo 一样）。
    if (!isObject(text.content) || typeof text.content[conditions.defaultLanguage] !== 'string') return;
    for (const orientation of orientations) {
      const box = Number.isFinite(text.width) ? text.width : perOrientation(rect, orientation)?.[2];
      if (!(box > 0)) continue;
      for (const lang of languages) {
        const own = text.content[lang];
        const guessed = typeof own !== 'string';
        if (guessed && text.dynamic) continue;
        const width = (guessed ? estimateWidth(text.content[conditions.defaultLanguage], text.fontSize) * 1.4 : estimateWidth(own, text.fontSize)) + stroke * 2;
        const ratio = width / box;
        if (id) ((fit[id] ??= {})[orientation] ??= {})[lang] = Math.round(ratio * 100) / 100;
        const tooLong = text.overflow === 'shrink' ? ratio > 1.4 : text.overflow === 'ellipsis' ? ratio > 1 && !text.dynamic : false;
        if (tooLong) {
          warn('text-fit', where, `${lang}${guessed ? '（没翻译，按加长 40% 估）' : ''}的文字大约宽 ${Math.round(width)}，框只有 ${box}（${orientation}）${text.overflow === 'shrink' ? '，缩字会缩到七成以下' : '，固定文字会被截掉'}。`, '按中心加宽文字框、换短一点的说法、或者换排法；这是估算，最后以 lgui verify --lang pseudo 的截图为准。');
        }
      }
    }
    void textOnly;
  };

  // ---- 画面和元素 ----
  for (const screen of screens) {
    if (!isObject(screen) || typeof screen.id !== 'string') continue;
    const where = screen.id;
    if (typeof screen.name !== 'string' || !screen.name) error('field', where, '画面缺名字 name。', '写给人看的名字，比如「大厅」。');
    oneOf(screen.layer, LAYERS, where, 'layer');
    if (typeof screen.fullscreen !== 'boolean') error('field', where, '画面要写是不是全屏（fullscreen）。', '全屏界面两个方向各要一套位置；弹窗这类不是全屏的放在安全区正中，只要一套。');
    if (screen.pattern != null && !patterns().includes(screen.pattern)) error('reuse', where, `没有 ${screen.pattern} 这种排布模式。`, `能用的：${patterns().join('、')}。`);
    if (screen.designed === false) {
      if (typeof screen.entry !== 'string') error('field', where, '只记入口、不设计的画面也要写 entry（从哪进来）。', '比如 "T11"。');
      continue;
    }
  }
  const byId = new Map(elements.map(e => [e.el.id, e]));
  const childrenOf = new Map();
  for (const {el, screen} of elements) {
    const where = el.id;
    if (typeof el.name !== 'string' || !el.name) error('field', where, '元素缺名字 name。', '写给人看的名字。');
    oneOf(el.type, TYPES, where, 'type');
    oneOf(el.scope, SCOPES, where, 'scope');
    if (el.control !== undefined && !/^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*|\[\d+\])*$/.test(String(el.control))) error('field', where, `控件名 ${el.control} 不合规范。`, '小写开头的驼峰，子控件用点号（topBar.gemBar），列表项用 list[0]。');
    if (el.parent !== undefined) {
      const parent = byId.get(el.parent);
      if (!parent || parent.screen !== screen) error('reference', where, `parent 写的 ${el.parent} 不是同一个画面里的元素。`, '写同一个画面里的元素编号。');
      else { if (!childrenOf.has(el.parent)) childrenOf.set(el.parent, []); childrenOf.get(el.parent).push(el); }
    }
    if (el.component !== undefined && !componentIds.has(el.component)) error('reference', where, `component 写的 ${el.component} 不在 components 里。`, '先在 components 里定义这个组件。');
    if (el.opens !== undefined && !screenIds.has(el.opens)) error('reference', where, `opens 写的 ${el.opens} 不是 screens 里的画面。`, '图里没有的画面也要在 screens 里记一条（"designed": false，只写入口）。');
    for (const id of Array.isArray(el.assets) ? el.assets : []) if (!assetIds.has(id)) error('reference', where, `用到的资源 ${id} 不在 assets 里。`, '在 assets 里登记这张图，或者改成已有的编号。');
    // 位置：全屏画面每个要求的方向都要有；不是全屏的至少有一套。
    const need = screen.fullscreen ? orientations : orientations.filter(o => perOrientation(el.rect, o) !== undefined).slice(0, 1);
    if (!screen.fullscreen && need.length === 0) error('rect', where, '缺位置 rect。', '写成 [x, y, 宽, 高]（设计单位）。');
    for (const orientation of need) {
      const rect = perOrientation(el.rect, orientation);
      if (!isRect(rect)) { error('rect', where, `缺 ${orientation} 的位置，或者写得不对。`, `写成 [x, y, 宽, 高]（设计单位）${orientations.length > 1 ? '；两个方向都要：{"portrait": […], "landscape": […]}，没有原型图的那个方向自己设计并在 source 里标 designed' : ''}。`); continue; }
      const [dw, dh] = conditions.designSize[orientation];
      if (screen.fullscreen && (rect[0] + rect[2] <= 0 || rect[1] + rect[3] <= 0 || rect[0] >= dw || rect[1] >= dh)) warn('rect-outside', where, `位置 [${rect.join(', ')}] 整个在 ${orientation} 的设计尺寸 ${dw}×${dh} 外面。`, '多半是量错了，或者忘了乘换算比例。');
      const anchor = perOrientation(el.anchor, orientation);
      if (screen.fullscreen && el.parent === undefined) {
        if (!parseAnchor(anchor)) error('anchor', where, `缺 ${orientation} 的贴边方式 anchor，或者写得不对。`, `写成「水平-垂直」：水平 ${H_ANCHORS.join(' | ')}，垂直 ${V_ANCHORS.join(' | ')}，比如 "right-top"；铺满写 "fill"。屏幕比例和设计尺寸不一样时，多出来的空间靠它分。`);
      }
      const source = perOrientation(el.source, orientation);
      if (!SOURCES.includes(source)) error('source', where, `缺 ${orientation} 的数值来源 source。`, 'measured 是在原型图上量的，estimated 是估的，designed 是自己设计的（原型图里没有）。');
      // 有键盘鼠标时操作提示栏占全屏界面底部 64 设计像素
      if (conditions.inputs.includes('keyboardMouse') && screen.fullscreen && (el.action || el.opens) && !el.parent && rect[1] + rect[3] > dh - HINT_BAR && String(anchor ?? '').endsWith('-bottom')) {
        warn('hint-bar', where, `${el.name} 贴着底边（${orientation}），会被操作提示栏挡住。`, `有键盘鼠标时框架在全屏界面底部放操作提示栏，高 ${HINT_BAR} 设计像素：把底部的按钮和内容往上让出这段（UI 开发规范第 7.3 节）。`);
      }
      // 能点的东西别太小
      if (conditions.inputs.includes('touch') && (el.action || el.opens) && !el.parent) {
        const small = smallest(orientation);
        const px = Math.min(rect[2], rect[3]) * small.scale;
        if (px < MIN_TAP_PX) warn('tap-small', where, `能点的 ${el.name} 在 ${small.name}（${orientation}）上短边只有 ${Math.round(px)} 像素。`, `小于 ${MIN_TAP_PX} 像素不好点：放大点击区域（可以比图大），或者确认这个尺寸不在目标设备里。`);
      }
    }
    if (el.type !== 'text' && el.type !== 'graph' && el.type !== 'image' && el.type !== 'group') checkReuse(el.component !== undefined && el.reuse === undefined ? {from: 'new'} : el.reuse, where, {what: '元素'});
    else if (el.reuse !== undefined) checkReuse(el.reuse, where, {what: '元素'});
    checkUses(el.uses, where);
    if (el.text !== undefined) checkText(el.text, where, {rect: el.rect, id: el.id});
    else if (el.type === 'text') error('text', where, '文字元素缺 text。', '写内容、字号、颜色、超长怎么办。');
    for (const [k, state] of (Array.isArray(el.states) ? el.states : []).entries()) {
      if (!isObject(state) || typeof state.name !== 'string' || typeof state.look !== 'string') error('field', `${where}.states[${k}]`, '状态要写 name（叫什么）和 look（长什么样），when（什么时候）最好也写。', '比如 {"name": "可领", "look": "发光、轻微缩放循环", "when": "今天还没领"}。');
    }
    if (el.type === 'list' && !['scroll', 'fixed'].includes(el.list?.mode)) error('field', where, '列表要写能不能滚动（list.mode）。', '写成 {"mode": "scroll" | "fixed", "min": 0, "typical": 6, "max": 50}：最少、常见、最多几项。');
  }

  // ---- 组件 ----
  for (const component of components) {
    if (!isObject(component) || typeof component.id !== 'string') continue;
    const where = component.id;
    if (!/^[A-Z][A-Za-z0-9]*$/.test(component.id)) error('field', where, '组件编号要是大写开头的驼峰（就是以后的组件名）。', '比如 CurrencyBar。');
    oneOf(component.type, TYPES, where, 'type');
    if (!isSize(component.size)) error('field', where, '组件缺尺寸 size。', '写成 [宽, 高]。');
    checkReuse(component.reuse, where, {what: '组件'});
    checkUses(component.uses, where);
    const names = new Set();
    for (const [k, part] of (Array.isArray(component.parts) ? component.parts : []).entries()) {
      const at = `${where}.parts[${k}]`;
      if (!isObject(part) || typeof part.name !== 'string' || !/^[a-z][A-Za-z0-9]*$/.test(part.name)) { error('field', at, '组件里的零件要有小写开头的驼峰名字 name（就是以后的控件名）。', '比如 icon、title、redDot。'); continue; }
      if (names.has(part.name)) error('id', at, `组件 ${where} 里有两个零件都叫 ${part.name}。`, '控件名在组件内唯一。');
      names.add(part.name);
      oneOf(part.type, TYPES, at, 'type');
      if (!isRect(part.rect)) error('rect', at, '零件缺位置 rect（相对组件左上角）。', '写成 [x, y, 宽, 高]。');
      if (part.text !== undefined) checkText(part.text, at, {rect: part.rect});
      for (const id of Array.isArray(part.assets) ? part.assets : []) if (!assetIds.has(id)) error('reference', at, `用到的资源 ${id} 不在 assets 里。`, '在 assets 里登记。');
    }
    // 按钮、标签、下拉框的文字控件必须叫 title、图标必须叫 icon（UI 开发规范第 6 节）。
    if (['button', 'label', 'combobox'].includes(component.type)) {
      for (const part of Array.isArray(component.parts) ? component.parts : []) {
        if (part?.type === 'text' && part.name === 'text') warn('part-name', where, `${component.type} 组件 ${where} 的文字零件叫 text。`, '按钮、标签、下拉框显示标题的文字控件必须叫 title，否则网页上不显示。');
      }
    }
    const users = elements.filter(e => e.el.component === component.id);
    const usedScreens = new Set(users.map(e => e.screen.id));
    if (users.length === 0) warn('unused', where, `组件 ${where} 没有任何元素在用。`, '删掉，或者给用它的元素写上 "component"。');
    if (component.reuse?.from === 'new' && usedScreens.size >= 2 && component.reuse.to !== 'Common') warn('promote', where, `新建的组件 ${where} 在 ${usedScreens.size} 个画面里都用到了。`, '第二个地方要用就该做成通用的：写 "reuse": {"from": "new", "to": "Common"}。');
  }

  // ---- 资源 ----
  const usedAssets = new Set();
  for (const {el} of elements) for (const id of Array.isArray(el.assets) ? el.assets : []) usedAssets.add(id);
  for (const c of components) for (const part of Array.isArray(c?.parts) ? c.parts : []) for (const id of Array.isArray(part?.assets) ? part.assets : []) usedAssets.add(id);
  const sheets = new Map();
  for (const asset of assets) {
    if (!isObject(asset) || typeof asset.id !== 'string') continue;
    const where = asset.id;
    if (!/^[a-z][A-Za-z0-9]*$/.test(asset.id)) error('field', where, '资源编号要是小写开头的驼峰（就是以后的图片名）。', '比如 currencyBar。');
    if (!oneOf(asset.kind, ASSET_KINDS, where, 'kind')) continue;
    oneOf(asset.by, ASSET_BY, where, 'by');
    checkReuse(asset.reuse, where, {what: '资源'});
    const visual = !['sound', 'font'].includes(asset.kind);
    if (visual && asset.kind !== 'artfont' && !isSize(asset.size)) { error('field', where, '图片缺导出尺寸 size（设计单位）。', '写成 [宽, 高]。'); continue; }
    if (asset.nine !== undefined) {
      const n = asset.nine;
      if (!Array.isArray(n) || n.length !== 4 || n.some(v => !Number.isFinite(v) || v < 0)) error('field', where, '九宫格边距 nine 写得不对。', '写成 [左, 上, 右, 下]（按导出尺寸量，0 表示这个方向不拉伸）。');
      else {
        if (n[0] + n[2] >= asset.size[0] || n[1] + n[3] >= asset.size[1]) error('nine', where, `九宫格边距 [${n.join(', ')}] 把 ${asset.size.join('×')} 的图占满了，中间没有能拉伸的部分。`, '边距按图片真实的边框量；左加右要小于宽，上加下要小于高。');
        if (asset.radius > 0) {
          const stretchH = n[0] > 0 || n[2] > 0, stretchV = n[1] > 0 || n[3] > 0;
          if ((stretchH && Math.min(n[0], n[2]) < asset.radius) || (stretchV && Math.min(n[1], n[3]) < asset.radius)) warn('nine-radius', where, `九宫格边距 [${n.join(', ')}] 比圆角 ${asset.radius} 小。`, '圆角要整个落在边距里，否则拉伸后边缘有缺口：把边距改到不小于圆角。');
        }
      }
    }
    if (visual && asset.size && Math.max(...asset.size) > MAX_ATLAS) warn('asset-large', where, `${where} 是 ${asset.size.join('×')}，超过图集默认上限 ${MAX_ATLAS}。`, '生成时会报 LGUI-CLI-113：缩小，或者按 UI 开发规范第 5 节给这个包调大图集上限。');
    if (conditions.platforms.includes('unity') && (asset.kind === 'icon' || asset.by === 'code')) warn('platform-icon', where, `${where} 打算用代码画，但目标平台有 Unity。`, '代码图标只在网页端能用（导出 Unity 报 LGUI-CLI-144），换成图片。');
    if (asset.kind === 'textImage' && languages.length > 1 && asset.languages !== true) warn('text-image', where, `带字图片 ${where} 要每种语言一个版本（${languages.join('、')}）。`, '确认以后写 "languages": true；或者改成引擎写字、美术字，就不用出多份。');
    if (!usedAssets.has(asset.id) && !['font', 'sound'].includes(asset.kind)) warn('unused', where, `资源 ${where} 没有任何元素或组件在用。`, '删掉，或者在用它的元素的 assets 里写上。');
    if (typeof asset.sheet === 'string' && visual && asset.size) {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(asset.sheet)) error('field', where, `图集页号 ${asset.sheet} 不能当文件名。`, '只用字母、数字、连字符，比如 A7-1。');
      if (!sheets.has(asset.sheet)) sheets.set(asset.sheet, []);
      sheets.get(asset.sheet).push(asset);
    }
  }
  for (const [sheet, list] of sheets) {
    // 整页一个缩放比例：不拉伸的方向尺寸差太多，小的会被缩没（写了 fit 的单独缩放，不算）。
    const fixed = list.filter(a => !a.fit).flatMap(a => {
      const n = a.nine ?? [0, 0, 0, 0];
      return [n[0] > 0 || n[2] > 0 || a.tile ? null : a.size[0], n[1] > 0 || n[3] > 0 ? null : a.size[1]].filter(v => v !== null);
    });
    if (fixed.length && Math.max(...fixed) / Math.min(...fixed) > SHEET_RATIO) warn('sheet-ratio', sheet, `图集页 ${sheet} 里不拉伸的尺寸从 ${Math.min(...fixed)} 到 ${Math.max(...fixed)}，差了 ${Math.round(Math.max(...fixed) / Math.min(...fixed) * 10) / 10} 倍。`, 'lgui art cut 整页用一个缩放比例，差太多小的会被缩没（LGUI-CLI-111）：按尺寸分到不同的页。');
  }

  // ---- 用例和未定事项 ----
  const covered = new Set();
  for (const c of cases) {
    if (!isObject(c) || typeof c.id !== 'string') continue;
    if (typeof c.name !== 'string' || typeof c.expect !== 'string') error('field', c.id, '用例要写 name 和 expect（预期结果）。', 'steps 写怎么操作，expect 写应该看到什么。');
    oneOf(c.runner, RUNNERS, c.id, 'runner');
    for (const id of Array.isArray(c.covers) ? c.covers : []) {
      if (!elementIds.has(id)) error('reference', c.id, `covers 里的 ${id} 不是元素编号。`, '写这条用例覆盖的元素编号。');
      covered.add(id);
    }
  }
  if ((design.mode ?? 'design') === 'full') {
    const missing = elements.filter(e => e.el.scope === 'full' && !covered.has(e.el.id)).map(e => e.el.id);
    if (missing.length) warn('uncovered', 'cases', `${missing.length} 个要完整实现的元素没有用例覆盖：${missing.slice(0, 12).join('、')}${missing.length > 12 ? '…' : ''}。`, '每个 scope 是 full 的元素至少一条用例；确实不用测的把 scope 改成 display 或 stub。');
  }
  for (const q of open) {
    if (!isObject(q) || typeof q.id !== 'string') continue;
    if (typeof q.question !== 'string') error('field', q.id, '未定事项要写 question。', '一句话写清要定什么。');
    oneOf(q.owner ?? 'user', ['user', 'agent'], q.id, 'owner');
    if (q.decided == null && typeof q.default !== 'string') warn('open', q.id, `未定事项 ${q.id} 还没定，也没写没人答时怎么办。`, '写 default（默认做法），或者定下来写进 decided。');
    for (const id of Array.isArray(q.blocks) ? q.blocks : []) if (!ids.has(id)) error('reference', q.id, `blocks 里的 ${id} 不是设计稿里的编号。`, '写它卡住的元素、画面或资源的编号。');
  }

  // ---- 原创替换表：换的字和原文差不多宽，排出来才一样 ----
  for (const [i, item] of (Array.isArray(design.renames) ? design.renames : []).entries()) {
    const where = `renames[${i}]`;
    if (!isObject(item) || typeof item.from !== 'string' || typeof item.to !== 'string' || !item.from || !item.to) { error('field', where, '替换表每一项要写 from（原型图里的字）和 to（换成什么）。', '比如 {"what": "玩家名", "from": "原图里的名字", "to": "我们的名字"}。'); continue; }
    const ratio = estimateWidth(item.to, 10) / estimateWidth(item.from, 10);
    if (ratio < 0.8 || ratio > 1.25) warn('rename-width', where, `「${item.to}」大约是「${item.from}」的 ${Math.round(ratio * 100)}% 宽。`, '换的字和原文差不多宽，量出来的位置才用得上：换一个长度相近的。');
  }

  // ---- 流转 ----
  if (screens.length && isObject(screens[0])) {
    const reach = new Set([screens[0].id]);
    for (let grew = true; grew;) {
      grew = false;
      for (const {el, screen} of elements) if (reach.has(screen.id) && el.opens && !reach.has(el.opens)) { reach.add(el.opens); grew = true; }
    }
    for (const screen of screens) if (isObject(screen) && typeof screen.id === 'string' && !reach.has(screen.id)) warn('unreachable', screen.id, `从第一个画面 ${screens[0].id} 走不到画面 ${screen.id}。`, '给打开它的元素写 "opens"，或者删掉这个画面。');
    for (const screen of screens) {
      if (!isObject(screen) || screen.designed === false || screen === screens[0]) continue;
      if (['popup', 'modal'].includes(screen.layer) && !elements.some(e => e.screen === screen && e.el.closes === true)) warn('no-close', screen.id, `弹窗 ${screen.id} 里没有关闭它的元素。`, '给关闭按钮（或点任意处关闭的遮罩）写 "closes": true。');
    }
  }
  // ---- 原型图比例和设计尺寸 ----
  for (const ref of Array.isArray(design.references) ? design.references : []) {
    if (!isObject(ref) || !Array.isArray(ref.size) || !(ref.scale > 0) || !orientations.includes(ref.orientation)) continue;
    const [dw, dh] = conditions.designSize[ref.orientation];
    const [w, h] = [ref.size[0] * ref.scale, ref.size[1] * ref.scale];
    const screen = screens.find(s => s?.id === ref.screen);
    if (screen?.fullscreen && (Math.abs(w - dw) > 2 || Math.abs(h - dh) > 2)) warn('reference-size', `references ${ref.file}`, `原型图换算后是 ${Math.round(w)}×${Math.round(h)}，设计尺寸是 ${dw}×${dh}。`, '比例不一样：按短边对齐换算，贴上下（左右）边的元素保持到边的距离，中间吸收差值；或者新工程直接把设计尺寸改成原型图的比例。');
  }

  const count = (list, key) => list.reduce((acc, item) => { const k = key(item); if (k !== undefined) acc[k] = (acc[k] ?? 0) + 1; return acc; }, {});
  const summary = {
    screens: screens.length, designedScreens: screens.filter(s => isObject(s) && s.designed !== false).length,
    elements: elements.length,
    scope: count(elements, e => e.el.scope),
    reuse: count([...elements.map(e => e.el), ...components, ...assets].filter(item => isObject(item?.reuse)), item => item.reuse.from),
    components: components.length, assets: assets.length, cases: cases.length,
    open: open.filter(q => isObject(q) && q.decided == null).length,
    toBuild: [...components, ...assets].filter(item => item?.reuse?.from === 'new').map(item => item.id)
  };
  return {problems, conditions, summary, fit};
}
