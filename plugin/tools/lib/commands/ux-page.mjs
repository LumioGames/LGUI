// lgui ux page：校验 UX 设计稿 design.json，通过后生成原型页、线框图；全套模式再生成开发交接，有图集分页的再生成拆图名字文件。
// 有一处错就什么都不写。在工程里运行时会对照工程配置和工程里已有的组件、图片；不在工程里也能跑（核对不了「工程已有」的复用来源，会提示）。
import fs from 'node:fs';
import path from 'node:path';
import {LgCliError, LgCliErrors} from '../errors.mjs';
import {findProjectRoot, templatesDir} from '../paths.mjs';
import {readProject} from '../project.mjs';
import {pluginVersion} from '../version.mjs';
import {sharp} from '../vendor.mjs';
import {readUiModel} from '../generate/model.mjs';
import {uiProjectPath} from '../generate/index.mjs';
import {validateDesign, orientationsOf, perOrientation} from '../ux/design.mjs';

const USAGE = '照用法写：lgui ux page <design.json 或它所在的文件夹>。';
const posix = file => file.split(path.sep).join('/');

function loadDesign(cwd, arg) {
  if (!arg) throw new LgCliError('LGUI-CLI-160', '要给 design.json（或它所在的文件夹）。', {fix: USAGE});
  let file = path.resolve(cwd, arg);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'design.json');
  if (!fs.existsSync(file)) throw new LgCliError('LGUI-CLI-160', `找不到 ${arg}。`, {fix: USAGE});
  try {
    return {file, design: JSON.parse(fs.readFileSync(file, 'utf8'))};
  } catch (error) {
    throw new LgCliError('LGUI-CLI-162', `design.json 不是合法的 JSON：${error.message}`, {file: posix(path.relative(cwd, file)), fix: '改好再运行；字段说明见 lgui-ux 技能的 design-json.md。'});
  }
}

// 工程里已有的组件和资源（「包/名字」），给复用来源核对用。
function projectCatalog(projectRoot) {
  const model = readUiModel(uiProjectPath(projectRoot));
  const components = new Set();
  const resources = new Set();
  for (const pkg of model.packages) {
    for (const component of pkg.components) components.add(`${pkg.name}/${component.name.split('@')[0]}`);
    for (const res of pkg.resources) if (res.type !== 'component') resources.add(`${pkg.name}/${res.name}`);
  }
  return {components, resources};
}

const SCOPE_COLOR = {full: '#2563eb', stub: '#c2410c', display: '#6b7280'};

// 线框图：每个元素一个框加编号，按「做不做」上色。给 AI 出图当位置参考，也方便贴进文档。
async function wireframe(screen, orientation, [dw, dh], file) {
  const esc = s => String(s).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
  const boxes = [];
  for (const el of screen.elements ?? []) {
    const rect = perOrientation(el.rect, orientation);
    if (!rect) continue;
    const [x, y, w, h] = rect;
    const color = SCOPE_COLOR[el.scope] ?? '#6b7280';
    boxes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="2"${el.scope === 'display' ? ' stroke-dasharray="8 6"' : ''}/>`);
    if (w >= 60 && h >= 26) boxes.push(`<text x="${x + 5}" y="${y + 21}" font-family="sans-serif" font-size="20" fill="${color}">${esc(el.id)}</text>`);
  }
  let x0 = 0, y0 = 0, W = dw, H = dh;
  if (!screen.fullscreen) {
    // 不是全屏的画面按内容的外框出图
    const rects = (screen.elements ?? []).map(el => perOrientation(el.rect, orientation)).filter(Boolean);
    if (rects.length) {
      x0 = Math.min(...rects.map(r => r[0])); y0 = Math.min(...rects.map(r => r[1]));
      W = Math.max(...rects.map(r => r[0] + r[2])) - x0; H = Math.max(...rects.map(r => r[1] + r[3])) - y0;
    }
  }
  const ratio = Math.min(1, 1200 / Math.max(W, H));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W * ratio)}" height="${Math.round(H * ratio)}" viewBox="${x0} ${y0} ${W} ${H}"><rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="#ffffff"/>${boxes.join('')}</svg>`;
  await sharp()(Buffer.from(svg)).png().toFile(file);
}

// 图集页的拆图名字文件（lgui art cut --names 用），顺序就是 assets 里的顺序。
function sheetFiles(design) {
  const sheets = new Map();
  for (const asset of design.assets ?? []) {
    if (typeof asset.sheet !== 'string' || !Array.isArray(asset.size)) continue;
    if (!sheets.has(asset.sheet)) sheets.set(asset.sheet, []);
    sheets.get(asset.sheet).push(asset);
  }
  const out = [];
  for (const [sheet, list] of sheets) {
    const counts = new Map();
    for (const asset of list) counts.set(asset.package ?? 'Common', (counts.get(asset.package ?? 'Common') ?? 0) + 1);
    const main = [...counts].sort((a, b) => b[1] - a[1])[0][0];
    const lines = list.map(asset => [
      `${asset.id}=${asset.size[0]}x${asset.size[1]}`,
      asset.nine ? `9grid=${asset.nine.join(',')}` : null,
      asset.tile ? 'tile' : null,
      asset.fit ? 'fit' : null,
      (asset.package ?? 'Common') !== main ? `pkg=${asset.package ?? 'Common'}` : null
    ].filter(Boolean).join(' '));
    out.push({sheet, pkg: main, text: lines.join('\n') + '\n', count: list.length});
  }
  return out;
}

const HANDOFF_MARK = '由 `lgui ux page` 从 `design.json` 生成';
const SCOPE_NAME = {full: '完整实现', stub: '占位', display: '只显示'};
const REUSE_NAME = {framework: '框架自带', reskin: '框架自带、换样子', pattern: '排布模式', project: '工程已有', new: '新建', none: '不需要'};

// 开发交接（全套模式）：只写这份设计特有的事实，怎么做交给各个技能和规范。
function handoff(design, report, sheets, designDir) {
  const c = report.conditions;
  const s = report.summary;
  const lines = [];
  const reuseOf = item => item.reuse ? `${REUSE_NAME[item.reuse.from]}${item.reuse.ref ? ` \`${item.reuse.ref}\`` : ''}${item.reuse.to ? `（放进 ${item.reuse.to}）` : ''}` : '';
  lines.push(`# ${design.name} · 开发交接`, '');
  lines.push(`> ${HANDOFF_MARK}，不要手改；设计变了改 \`design.json\` 再生成。`, '');
  lines.push('## 范围', '');
  lines.push(`- 按 LGUI ${design.lguiVersion ?? pluginVersion()} 出的设计稿；方向 ${c.orientation}，设计尺寸 ${orientationsOf(c).map(o => `${o} ${c.designSize[o].join('×')}`).join('、')}。`);
  lines.push(`- 语言 ${c.languages.join('、')}（默认 ${c.defaultLanguage}）；平台 ${c.platforms.join('、')}；输入 ${c.inputs.join('、')}。`);
  lines.push(`- ${s.screens} 个画面（其中 ${s.screens - s.designedScreens} 个只记了入口、没有设计），${s.elements} 个元素：${Object.entries(s.scope).map(([k, v]) => `${SCOPE_NAME[k]} ${v}`).join('、')}。`);
  lines.push(`- 原型图${design.source.original ? '是自己的作品' : '不是自己的作品：只用来对位置、尺寸、质感和颜色，角色、名字、图案都用原创的'}。`, '');
  lines.push('## 先读什么', '');
  lines.push('1. `prototype.html`：浏览器打开，点方块看每个元素的需求；可以切方向、语言、屏幕尺寸。');
  lines.push('2. `design.json`：全部数据。**编号是主线**，元素、资源、用例都用同一套编号。');
  lines.push('3. 拼界面用 `lgui-ui` 技能，写功能用 `lgui-code` 技能，截图验收用 `lgui-verify` 技能；写法以它们和 `references/` 里的规范为准，本文件不重复。', '');
  lines.push('## 复用：先用现成的', '');
  const reused = [...(design.screens ?? []).flatMap(sc => sc.elements ?? []), ...(design.components ?? []), ...(design.assets ?? [])].filter(item => item.reuse && !['new', 'none'].includes(item.reuse.from));
  const byRef = new Map();
  for (const item of reused) { const key = reuseOf(item); if (!byRef.has(key)) byRef.set(key, []); byRef.get(key).push(item.id); }
  if (byRef.size) for (const [key, list] of byRef) lines.push(`- ${key}：${list.join('、')}`);
  else lines.push('- （没有标成复用的）');
  const uses = new Map();
  for (const item of [...(design.screens ?? []).flatMap(sc => sc.elements ?? []), ...(design.components ?? [])]) for (const token of item.uses ?? []) { if (!uses.has(token)) uses.set(token, []); uses.get(token).push(item.id); }
  if (uses.size) { lines.push('', '用框架现成的能力，不要自己写：', ''); for (const [token, list] of uses) lines.push(`- \`${token}\`：${list.join('、')}`); }
  lines.push('', '## 要新做的', '');
  const newComponents = (design.components ?? []).filter(item => item.reuse?.from === 'new');
  const newAssets = (design.assets ?? []).filter(item => item.reuse?.from === 'new');
  if (newComponents.length) { lines.push('| 组件 | 类型 | 尺寸 | 放哪 | 用在 |', '|---|---|---|---|---|'); for (const item of newComponents) lines.push(`| ${item.id} | ${item.type} | ${item.size?.join('×') ?? ''} | ${item.reuse.to ?? '所在功能的包'} | ${(design.screens ?? []).flatMap(sc => (sc.elements ?? []).filter(el => el.component === item.id).map(el => el.id)).join('、')} |`); lines.push(''); }
  if (newAssets.length) { lines.push('| 资源 | 类别 | 尺寸 | 九宫格 | 包 | 谁出 |', '|---|---|---|---|---|---|'); for (const item of newAssets) lines.push(`| ${item.id} | ${item.kind} | ${item.size?.join('×') ?? ''} | ${item.nine ? item.nine.join(',') : ''} | ${item.package ?? 'Common'} | ${item.by} |`); lines.push(''); }
  if (!newComponents.length && !newAssets.length) lines.push('（没有）', '');
  if (sheets.length) {
    lines.push('## 拆图', '', '图集页画好、存进 `ui/art-src/atlas/<页号>.png` 以后，每页一条命令（名字文件已经生成，顺序和 `assets` 里的顺序一致）：', '');
    for (const sheet of sheets) lines.push('```bash', `lgui art cut ui/art-src/atlas/${sheet.sheet}.png --pkg ${sheet.pkg} --names ${posix(path.join(designDir, 'art', sheet.sheet + '.txt'))}`, '```');
    lines.push('', '整页图怎么画照 UI 开发规范第 5.1 节；拆完一定看检查图。', '');
  }
  const flows = (design.screens ?? []).filter(sc => sc.entry || sc.flow?.length);
  if (flows.length) { lines.push('## 画面和流程', ''); for (const sc of flows) { lines.push(`- **${sc.name}**（${sc.id}，${sc.layer}${sc.designed === false ? '，只记入口' : ''}）${sc.entry ? `，入口 ${sc.entry}` : ''}`); for (const step of sc.flow ?? []) lines.push(`  - ${step}`); } lines.push(''); }
  if (design.cases?.length) { lines.push('## 行为用例', '', '| 编号 | 用例 | 操作 | 预期 | 覆盖 | 在哪跑 |', '|---|---|---|---|---|---|'); for (const item of design.cases) lines.push(`| ${item.id} | ${item.name} | ${item.steps ?? ''} | ${item.expect} | ${(item.covers ?? []).join('、')} | ${item.runner} |`); lines.push('', '`headless` 用 `lgui test`，`browser` 用 `lgui test --browser`（位置、尺寸、安全区只能在这里测），`visual` 看 `lgui verify` 的截图。', ''); }
  if (design.renames?.length) { lines.push('## 原创替换', '', '原型图里的这些字不能照用，界面和测试里都用右边的：', ''); for (const item of design.renames) lines.push(`- ${item.what ? item.what + '：' : ''}${item.from} → **${item.to}**`); lines.push(''); }
  if (design.open?.length) { lines.push('## 未定事项', '', '| 编号 | 要定什么 | 谁定 | 没人答时 | 结论 | 卡住 |', '|---|---|---|---|---|---|'); for (const q of design.open) lines.push(`| ${q.id} | ${q.question} | ${q.owner === 'agent' ? 'Agent' : '用户'} | ${q.default ?? ''} | ${q.decided ?? '未定'} | ${(q.blocks ?? []).join('、')} |`); lines.push(''); }
  const warnings = report.problems.filter(p => p.level === 'warning');
  if (warnings.length) { lines.push('## 设计稿留下的提醒', ''); for (const p of warnings) lines.push(`- ${p.where}：${p.message}${p.fix ? ` → ${p.fix}` : ''}`); lines.push(''); }
  return lines.join('\n');
}

export async function uxPage({args, cwd}) {
  const {file, design} = loadDesign(cwd, args[0]);
  const dir = path.dirname(file);
  const shown = p => posix(path.relative(cwd, p));
  let projectRoot = null, project = null, catalog = null;
  try { projectRoot = findProjectRoot(dir); } catch { projectRoot = null; }
  if (projectRoot) { project = readProject(projectRoot); catalog = projectCatalog(projectRoot); }
  const report = validateDesign(design, {dir, project, catalog, pluginVersion: pluginVersion()});
  const errors = report.problems.filter(p => p.level === 'error');
  if (errors.length) {
    throw new LgCliErrors(errors.map(p => new LgCliError('LGUI-CLI-163', `${p.where}：${p.message}`, {file: shown(file), fix: p.fix})));
  }
  const warnings = report.problems.filter(p => p.level === 'warning');
  const written = [];
  // 原型页：模板 + 数据。原型图用相对路径引用，design.json 所在的文件夹整个拿走就能打开。
  const template = fs.readFileSync(path.join(templatesDir, 'ux', 'prototype.html'), 'utf8');
  const payload = JSON.stringify({design, report: {problems: report.problems, conditions: report.conditions, summary: report.summary, fit: report.fit}, generated: {lguiVersion: pluginVersion(), inProject: Boolean(projectRoot)}}).replace(/</g, '\\u003c');
  const page = path.join(dir, 'prototype.html');
  fs.writeFileSync(page, template.replace('/*__LGUI_UX_DATA__*/null', () => payload).replace('__LGUI_UX_TITLE__', () => design.name));
  written.push(page);
  // 只覆盖自己生成的文件，不清空文件夹：里面可能有用户自己放的东西。
  const wireDir = path.join(dir, 'wireframe');
  fs.mkdirSync(wireDir, {recursive: true});
  for (const screen of design.screens) {
    if (screen.designed === false || !(screen.elements ?? []).length) continue;
    for (const orientation of orientationsOf(report.conditions)) {
      if (!(screen.elements ?? []).some(el => perOrientation(el.rect, orientation))) continue;
      const out = path.join(wireDir, `${screen.id}-${orientation}.png`);
      await wireframe(screen, orientation, report.conditions.designSize[orientation], out);
      written.push(out);
    }
  }
  const sheets = sheetFiles(design);
  const artDir = path.join(dir, 'art');
  for (const sheet of sheets) {
    fs.mkdirSync(artDir, {recursive: true});
    const out = path.join(artDir, `${sheet.sheet}.txt`);
    fs.writeFileSync(out, sheet.text);
    written.push(out);
  }
  const handoffFile = path.join(dir, 'handoff.md');
  if ((design.mode ?? 'design') === 'full') {
    fs.writeFileSync(handoffFile, handoff(design, report, sheets, projectRoot ? posix(path.relative(projectRoot, dir)) : '.'));
    written.push(handoffFile);
  } else if (fs.existsSync(handoffFile) && fs.readFileSync(handoffFile, 'utf8').includes(HANDOFF_MARK)) {
    fs.rmSync(handoffFile); // 从全套模式改回设计稿模式：去掉上次生成的交接，免得留一份过期的
  }

  const s = report.summary;
  const summary = [
    `设计稿 ${design.name}：${s.screens} 个画面、${s.elements} 个元素（${Object.entries(s.scope).map(([k, v]) => `${SCOPE_NAME[k]} ${v}`).join('、')}），${s.components} 个组件、${s.assets} 项资源${s.cases ? `、${s.cases} 条用例` : ''}。`,
    `  复用：${Object.entries(s.reuse).map(([k, v]) => `${REUSE_NAME[k]} ${v}`).join('、') || '还没标'}。${s.toBuild.length ? `要新做的 ${s.toBuild.length} 项：${s.toBuild.slice(0, 12).join('、')}${s.toBuild.length > 12 ? '…（全部见原型页的「检查」）' : ''}。` : ''}`,
    ...(s.open ? [`  还有 ${s.open} 个未定事项。`] : []),
    ...(projectRoot ? [] : ['  不在 LGUI 工程里：方向、语言、验证尺寸用的是设计稿里写的或 LGUI 的默认值，「工程已有」的复用来源没有核对。']),
    ...warnings.map(p => `警告  ${p.where}：${p.message}  → ${p.fix}`),
    `  已生成：${written.map(shown).join('、')}。`,
    `  用浏览器打开 ${shown(page)} 给用户确认。${warnings.length ? `有 ${warnings.length} 条警告，逐条处理或者和用户确认。` : ''}`
  ];
  return {data: {design: shown(file), written: written.map(shown), summary: s, conditions: report.conditions, warnings, inProject: Boolean(projectRoot)}, summary};
}
