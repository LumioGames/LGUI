// UI 开发规范的检查规则（LGUI-UI-xxx），读 ui/ 来查。规则表见 references/ui-spec.md 第 13 节。
import fs from 'node:fs';
import path from 'node:path';
import {finding} from './program.mjs';
import {members, comparePortrait, PORTRAIT} from '../generate/types.mjs';
import {findComponent} from '../generate/model.mjs';

const ID = /^[a-z0-9]{8}$/;
const PASCAL = /^[A-Z][A-Za-z0-9]*$/;
const CAMEL = /^[a-z][A-Za-z0-9]*$/;
const MIN_FONT = 20;
const AUTO_SIZES = ['shrink', 'height', 'ellipsis', 'both'];

// Common 包里的固定组件和必有控件（UI 开发规范第 10 节）。
const COMMON = {
  Toast: ['text'], Confirm: ['title', 'message', 'ok', 'cancel'], Loading: ['text'], ActionHintBar: ['list'], ActionHint: ['key', 'label'],
  RedDot: ['count'], HoldProgress: [], ArtText: []
};

export function uiRules({root, model, languages, redDots = []}) {
  const out = [];
  const rel = file => path.relative(root, file).split(path.sep).join('/');
  const add = (code, message, fix, file, line) => out.push(finding(code, message, fix, {file: file ? rel(file) : undefined, line, col: 1}));

  // UI-001 包 ID
  const pkgIds = new Map();
  for (const pkg of model.packages) {
    if (!ID.test(pkg.id ?? '')) add('LGUI-UI-001', `包 ${pkg.name} 的 ID「${pkg.id}」不是 8 位小写字母和数字。`, '改成 8 位小写字母和数字，比如 bag00001。', pkg.file, 2);
    if (pkgIds.has(pkg.id)) add('LGUI-UI-001', `包 ${pkg.name} 和 ${pkgIds.get(pkg.id)} 的 ID 都是 ${pkg.id}。`, '包 ID 在整个工程里要唯一。', pkg.file, 2);
    pkgIds.set(pkg.id, pkg.name);
    if (!PASCAL.test(pkg.name)) add('LGUI-UI-006', `包名 ${pkg.name} 要写成大写开头的驼峰。`, '比如 Bag、Common。', pkg.file, 1);
  }

  for (const pkg of model.packages) {
    // UI-002 资源 ID、UI-018 登记和文件对得上
    const resIds = new Set();
    for (const r of pkg.resources) {
      if (!ID.test(r.id ?? '')) add('LGUI-UI-002', `包 ${pkg.name} 的资源 ${r.fileName} 的 ID「${r.id}」不是 8 位小写字母和数字。`, '改成 8 位小写字母和数字。', pkg.file);
      if (resIds.has(r.id)) add('LGUI-UI-002', `包 ${pkg.name} 里有两个资源的 ID 都是 ${r.id}。`, '资源 ID 在包内要唯一。', pkg.file);
      resIds.add(r.id);
      if (!fs.existsSync(r.file)) add('LGUI-UI-018', `package.xml 登记了 ${r.path}${r.fileName}，但文件不存在。`, '把文件放回去，或者从 package.xml 里删掉这条。', pkg.file);
      // UI-006 名字
      if (r.type === 'component') {
        const [base, suffix] = r.name.split('@');
        if (!PASCAL.test(base) || (suffix !== undefined && suffix !== 'portrait')) add('LGUI-UI-006', `组件名 ${r.name} 不合规范：大写开头的驼峰，后缀只能是 @portrait。`, '比如 BagPanel、BagPanel@portrait。', pkg.file);
      }
      if (r.type === 'image') {
        const [, lang] = r.name.split('@');
        if (lang !== undefined) {
          // UI-017 带字图片：有默认版本，语言在 languages 里
          if (!languages.includes(lang)) add('LGUI-UI-017', `图片 ${r.name} 的语言 ${lang} 不在工程配置 languages 里。`, `把 ${lang} 加进 languages，或者改图片名。`, pkg.file);
          if (!pkg.resources.some(x => x.type === 'image' && x.name === r.name.split('@')[0])) add('LGUI-UI-017', `图片 ${r.name} 没有不带后缀的默认版本 ${r.name.split('@')[0]}。`, '加一张默认版本的图片。', pkg.file);
        }
        // UI-015 九宫格
        const scale = r.attrs.scale, grid = r.attrs.scale9grid;
        if ((scale === '9grid') !== Boolean(grid)) add('LGUI-UI-015', `图片 ${r.name} 的 scale="9grid" 和 scale9grid 要成对出现。`, '两个属性一起写。', pkg.file);
        if (grid && r.attrs.width && r.attrs.height) {
          const [x, y, w, h] = grid.split(',').map(Number);
          if (x < 0 || y < 0 || x + w > Number(r.attrs.width) || y + h > Number(r.attrs.height)) add('LGUI-UI-015', `图片 ${r.name} 的九宫格区域超出了图片。`, '按图片真实的边框像素改 scale9grid。', pkg.file);
        }
      }
    }
    // UI-018 包目录里没登记的文件
    const registered = new Set(pkg.resources.map(r => path.resolve(r.file)));
    const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
    for (const file of walk(pkg.dir)) {
      if (path.basename(file) === 'package.xml' || !/\.(xml|png|jpg|jpeg)$/i.test(file)) continue;
      if (!registered.has(path.resolve(file))) add('LGUI-UI-018', `${rel(file)} 放在包目录里，但没有登记进 package.xml。`, '登记进 package.xml，或者删掉它。', file);
    }

    for (const component of pkg.components) {
      // UI-003 元素 ID、UI-004 控件名
      const ids = new Set();
      for (const child of component.children) {
        if (child.id && ids.has(child.id)) add('LGUI-UI-003', `组件 ${component.fullName} 里有两个元素的 ID 都是 ${child.id}。`, '元素 ID 在组件内要唯一，写 n 加数字。', component.file, child.line);
        if (child.id) ids.add(child.id);
        if (child.name && !CAMEL.test(child.name)) add('LGUI-UI-004', `组件 ${component.fullName} 的控件名 ${child.name} 要写成小写开头的驼峰。`, '比如 sellButton。', component.file, child.line);
        // UI-010 超长处理；UI-011 字号
        if (['text', 'richtext'].includes(child.tag)) {
          if (!AUTO_SIZES.includes(child.attrs.autoSize)) add('LGUI-UI-010', `组件 ${component.fullName} 的文字控件 ${child.name} 没写超长处理（autoSize）。`, '写 autoSize="shrink"、"height"、"ellipsis" 或 "both"（UI 开发规范第 8 节）。', component.file, child.line);
        }
        if (['text', 'richtext', 'inputtext'].includes(child.tag) && child.attrs.fontSize && Number(child.attrs.fontSize) < MIN_FONT) add('LGUI-UI-011', `组件 ${component.fullName} 的 ${child.name} 字号是 ${child.attrs.fontSize}，小于最小字号 ${MIN_FONT}。`, `改成 ${MIN_FONT} 或更大。`, component.file, child.line);
        // UI-009 引用存在
        if (child.tag === 'component' && !child.ref) add('LGUI-UI-009', `组件 ${component.fullName} 的子组件 ${child.name} 引用的组件不存在（src="${child.attrs.src}"）。`, '指向一个存在的组件；跨包引用要写 pkg，并且对方已导出。', component.file, child.line);
        if (child.tag === 'component' && child.ref && child.ref.pkg !== pkg && !child.ref.exported) add('LGUI-UI-009', `组件 ${component.fullName} 引用了别的包里没导出的组件 ${child.ref.fullName}。`, '在对方的 package.xml 里给它写 exported="true"。', component.file, child.line);
        if (child.tag === 'image' && child.attrs.src) {
          const target = model.byId.get(child.attrs.pkg ?? pkg.id);
          if (!target?.resources.some(r => r.id === child.attrs.src)) add('LGUI-UI-009', `组件 ${component.fullName} 的图片 ${child.name} 引用的资源 ${child.attrs.src} 不存在。`, '指向一个存在的图片资源。', component.file, child.line);
        }
        // UI-016 列表 defaultItem
        if (child.tag === 'list' && (!child.ref || !child.ref.exported)) add('LGUI-UI-016', `组件 ${component.fullName} 的列表 ${child.name} 的 defaultItem 没设，或者指向的组件不存在、没导出。`, '写 defaultItem="ui://<包ID><组件ID>"，指向一个导出的组件。', component.file, child.line);
        // UI-013 ArtText
        if (child.ref?.fullName === 'Common/ArtText') {
          const m = /(?:^|;)font=([A-Z][A-Za-z0-9]*)\/([A-Za-z0-9]+)(?:;|$)/.exec(child.attrs.customData ?? '');
          const fontPkg = m && model.packages.find(p => p.name === m[1]);
          if (!m || !fontPkg || !fs.existsSync(path.join(fontPkg.dir, 'artfont', m[2]))) add('LGUI-UI-013', `组件 ${component.fullName} 的 ArtText ${child.name} 的 customData 写法不对，或者字体目录不存在。`, '写成 customData="font=<包>/<字体名>;align=center;spacing=2"，字符图片放在 <包>/artfont/<字体名>/ 下。', component.file, child.line);
        }
      }
      // UI-004、UI-005 重名（复用生成类型时的检查）
      for (const e of members(component).errors) add(e.code, e.message, e.fix, component.file, e.line);
      // UI-007 横竖两版
      if (!component.name.endsWith(PORTRAIT)) {
        const portrait = pkg.components.find(c => c.name === component.name + PORTRAIT);
        if (portrait) for (const e of comparePortrait(component, portrait, members(component).result, members(portrait).result)) add(e.code, e.message, e.fix, portrait.file, 1);
      }
    }
  }

  // UI-014 Common 包
  const common = model.packages.find(p => p.name === 'Common');
  if (!common) add('LGUI-UI-014', '工程里没有 Common 包。', '用 lgui init 生成的 Common 包，不要删。');
  else for (const [name, required] of Object.entries(COMMON)) {
    const c = findComponent(model, `Common/${name}`);
    if (!c) { add('LGUI-UI-014', `Common 包里缺少固定组件 ${name}。`, `把 Common/${name} 加回来（UI 开发规范第 10 节）。`, common.file); continue; }
    const names = new Set(c.children.map(ch => ch.name));
    for (const r of required) if (!names.has(r)) add('LGUI-UI-014', `Common/${name} 里缺少必有控件 ${r}。`, `把 ${r} 加回来，名字不能改。`, c.file);
  }

  // UI-012 绑定了 redDot 的控件里有 redDot 子控件
  for (const b of redDots) {
    const component = findComponent(model, b.component);
    if (!component) continue;
    const parts = b.key.split('.');
    let owner = component;
    for (const part of parts) {
      const child = owner?.children.find(c => c.name === part);
      owner = child?.ref ?? null;
    }
    if (!owner || !owner.children.some(c => c.name === 'redDot')) out.push(finding('LGUI-UI-012', `${b.component} 的 ${b.key} 绑定了 redDot，但它里面没有名为 redDot 的子控件。`, '在 ui/ 里给它放一个 Common/RedDot 的实例，名字叫 redDot。', b.loc));
  }
  return out;
}
