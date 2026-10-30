// lgui art cut <整页图> --pkg <包> --names <名字列表或文件> [--size 宽x高] [--scale 比例] [--pad 像素] [--gap 像素] [--speck 像素] [--defringe 像素]
// 把 AI 生成的一页图集拆成小图：按透明区域找出每个物件（不按格子平均切），从上到下、每行从左到右对上名字（EMPTY 跳过）；
// 裁掉空白，整页用同一个缩放比例放进各自的尺寸；去掉半透明边缘的白边；拉伸图重拼成「两端 + 中间 1 像素」并写 scale9grid，平铺图检查左右接缝。
// 存成 ui/assets/<包>/<名字>.png 并登记进 package.xml，原图复制到 ui/art-src/<包>/，检查图写到 .lgui/build/art/<包>/<页名>-sheet.png。
// 有一项不对就报错，什么都不写。
import fs from 'node:fs';
import path from 'node:path';
import {LgCliError, LgCliErrors} from '../errors.mjs';
import {sharp} from '../vendor.mjs';
import {pair, nextIds} from './art-split.mjs';

const ALPHA_MIN = 8;    // 不透明度高于它才算物件的像素
const OPAQUE = 250;     // 不透明度不低于它算实心像素，去白边时取它的颜色
const FRAGMENT = 0.25;  // 面积不到旁边物件 1/4、又离得近的碎片（闪光之类）并进那个物件
const USAGE = 'lgui art cut <整页图> --pkg <包> --names <名字列表或文件> [--size 宽x高] [--scale 比例] [--pad 像素] [--gap 像素] [--speck 像素] [--defringe 像素]';

const rel = (root, file) => path.relative(root, file).split(path.sep).join('/');

function count(value, flag, fallback) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) throw new LgCliError('LGUI-CLI-080', `--${flag} 要写一个不小于 0 的整数（现在是 ${value}）。`, {fix: USAGE});
  return Number(value);
}

// 名字列表：直接写时用逗号分开，每项是 名字 或 名字=宽x高；写在文件里时一行一项，后面可以跟 9grid=左,上,右,下 或 tile。
function readEntries(spec, {cwd, projectRoot, defaultSize, pad}) {
  const file = path.resolve(cwd, spec);
  const fromFile = fs.existsSync(file);
  const lines = fromFile ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : spec.split(',');
  const entries = [];
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const where = fromFile ? {file: rel(projectRoot, file), line: index + 1} : {};
    const fail = (message, fix) => { throw new LgCliError('LGUI-CLI-080', message, {...where, fix}); };
    const [head, ...options] = line.split(/\s+/);
    if (!fromFile && options.length) fail(`--names 直接写时每项只能是「名字」或「名字=宽x高」（现在有「${line}」）。`, '要写 9grid 或 tile 就把名字列表写进文件，一行一项。');
    if (head === 'EMPTY') {
      if (options.length) fail('EMPTY 后面不能跟别的。', '一行只写 EMPTY。');
      return;
    }
    const [name, sizeText] = head.split('=');
    if (!/^[a-z][A-Za-z0-9]*$/.test(name)) fail(`名字 ${name} 不合规范。`, '图片名用小写开头的驼峰（UI 开发规范第 3 节）。');
    let size = defaultSize;
    if (sizeText !== undefined) {
      const m = /^(\d+)x(\d+)$/.exec(sizeText);
      if (!m || Number(m[1]) < 1 || Number(m[2]) < 1) fail(`${name} 的尺寸要写成 宽x高，比如 ${name}=120x120（现在是 ${sizeText}）。`, `写成 ${name}=120x120。`);
      size = [Number(m[1]), Number(m[2])];
    }
    if (!size) fail(`${name} 没写尺寸。`, `写成 ${name}=120x120，或者加 --size 120x120 作为默认尺寸。`);
    const entry = {name, width: size[0], height: size[1], grid: null, tile: false};
    for (const option of options) {
      const m = /^9grid=(\d+),(\d+),(\d+),(\d+)$/.exec(option);
      if (m) entry.grid = m.slice(1).map(Number);
      else if (option === 'tile') entry.tile = true;
      else fail(`${name} 后面的「${option}」看不懂。`, '只能写 9grid=左,上,右,下（边距，0 表示这个方向不拉伸）或 tile（横向平铺）。');
    }
    if (entry.grid && entry.tile) fail(`${name} 不能既是九宫格又是平铺。`, '二选一。');
    if (entry.grid) {
      const [l, t, r, b] = entry.grid;
      if (l + t + r + b === 0) fail(`${name} 的 9grid 四个边距都是 0。`, '至少一个方向有边距；不拉伸的图不写 9grid。');
      if (l + r >= entry.width || t + b >= entry.height) fail(`${name} 的 9grid 边距加起来不比尺寸 ${entry.width}×${entry.height} 小。`, '左 + 右要小于宽，上 + 下要小于高。');
    }
    const free = freeAxes(entry);
    if ((!free.h && 2 * pad >= entry.width) || (!free.v && 2 * pad >= entry.height)) fail(`--pad ${pad} 太大，${name}（${entry.width}×${entry.height}）里放不下东西。`, '把 --pad 改小。');
    entries.push(entry);
  });
  return entries;
}

// 不受尺寸限制的方向：九宫格拉伸的方向、平铺图的横向。这些方向按内容的实际大小出图。
function freeAxes(entry) {
  if (entry.grid) return {h: entry.grid[0] + entry.grid[2] > 0, v: entry.grid[1] + entry.grid[3] > 0};
  return {h: entry.tile, v: false};
}

// 按不透明度找连通区域（8 连通）。labels 里是每个像素属于第几个区域，0 是透明。
function findRegions({data, width, height}) {
  const labels = new Int32Array(width * height);
  const stack = new Int32Array(width * height);
  const regions = [];
  for (let start = 0; start < width * height; start++) {
    if (labels[start] || data[start * 4 + 3] <= ALPHA_MIN) continue;
    const id = regions.length + 1;
    const region = {ids: [id], area: 0, x0: width, y0: height, x1: 0, y1: 0};
    let top = 0;
    stack[top++] = start;
    labels[start] = id;
    while (top) {
      const p = stack[--top];
      const x = p % width, y = (p - x) / width;
      region.area++;
      region.x0 = Math.min(region.x0, x); region.x1 = Math.max(region.x1, x + 1);
      region.y0 = Math.min(region.y0, y); region.y1 = Math.max(region.y1, y + 1);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const q = ny * width + nx;
          if (!labels[q] && data[q * 4 + 3] > ALPHA_MIN) { labels[q] = id; stack[top++] = q; }
        }
      }
    }
    regions.push(region);
  }
  return {labels, regions};
}

const boxGap = (a, b) => Math.hypot(Math.max(0, b.x0 - a.x1, a.x0 - b.x1), Math.max(0, b.y0 - a.y1, a.y0 - b.y1));

// 小于 speck 的杂点丢掉；小碎片并进离它最近（不超过 gap）、比它大 4 倍以上的物件。
function groupRegions(regions, {speck, gap}) {
  const objects = regions.filter(r => r.area >= speck).map(r => ({...r, ids: [...r.ids]}));
  const specks = regions.length - objects.length;
  let merged = 0;
  for (let changed = true; changed;) {
    changed = false;
    objects.sort((a, b) => a.area - b.area);
    for (let i = 0; i < objects.length && !changed; i++) {
      const small = objects[i];
      let into = null;
      for (const other of objects) {
        if (other === small || small.area >= FRAGMENT * other.area || boxGap(small, other) > gap) continue;
        if (!into || boxGap(small, other) < boxGap(small, into)) into = other;
      }
      if (!into) continue;
      into.ids.push(...small.ids);
      into.area += small.area;
      into.x0 = Math.min(into.x0, small.x0); into.x1 = Math.max(into.x1, small.x1);
      into.y0 = Math.min(into.y0, small.y0); into.y1 = Math.max(into.y1, small.y1);
      objects.splice(i, 1);
      merged++;
      changed = true;
    }
  }
  return {objects: readingOrder(objects), specks, merged};
}

// 从上到下分行（中心落在这一行的上下范围里，或这一行的中线穿过它，就算同一行），每行从左到右。
function readingOrder(objects) {
  const cy = o => (o.y0 + o.y1) / 2;
  const rows = [];
  for (const o of [...objects].sort((a, b) => cy(a) - cy(b))) {
    const row = rows.at(-1);
    if (row) {
      const top = row.reduce((s, r) => s + r.y0, 0) / row.length, bottom = row.reduce((s, r) => s + r.y1, 0) / row.length;
      const mid = (top + bottom) / 2;
      if ((cy(o) >= top && cy(o) < bottom) || (mid >= o.y0 && mid < o.y1)) { row.push(o); continue; }
    }
    rows.push([o]);
  }
  return rows.flatMap((row, r) => row.sort((a, b) => a.x0 + a.x1 - b.x0 - b.x1).map(o => ({...o, row: r + 1})));
}

// 只取这个物件自己的像素（别的物件伸进外框的部分不要），外框就是裁掉空白后的范围。
function cropObject(page, labels, o) {
  const width = o.x1 - o.x0, height = o.y1 - o.y0;
  const data = Buffer.alloc(width * height * 4);
  const mine = new Set(o.ids);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (o.y0 + y) * page.width + o.x0 + x;
      const label = labels[p];
      if (label ? mine.has(label) : page.data[p * 4 + 3] > 0) page.data.copy(data, (y * width + x) * 4, p * 4, p * 4 + 4);
    }
  }
  return {data, width, height};
}

const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

// 去白边：挨着透明处（radius 以内）的半透明像素，从实心像素（描边）往外一圈一圈地取颜色，最多 radius 圈；不透明度不变。
function defringe(img, radius) {
  if (!radius) return img;
  const {data, width, height} = img;
  const out = Buffer.from(data);
  const alpha = (x, y) => (x < 0 || y < 0 || x >= width || y >= height ? 0 : data[(y * width + x) * 4 + 3]);
  const done = new Uint8Array(width * height);
  const fringe = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = alpha(x, y);
      if (a >= OPAQUE) done[y * width + x] = 1;
      if (a === 0 || a >= OPAQUE) continue;
      let clear = false;
      for (let dy = -radius; dy <= radius && !clear; dy++) for (let dx = -radius; dx <= radius && !clear; dx++) clear = alpha(x + dx, y + dy) <= ALPHA_MIN;
      if (clear) fringe.push(y * width + x);
    }
  }
  for (let ring = 0; ring < radius; ring++) {
    const reached = [];
    for (const p of fringe) {
      if (done[p]) continue;
      const x = p % width, y = (p - x) / width;
      const from = NEIGHBOURS.map(([dx, dy]) => [x + dx, y + dy]).find(([nx, ny]) => nx >= 0 && ny >= 0 && nx < width && ny < height && done[ny * width + nx] === 1);
      if (!from) continue;
      const q = from[1] * width + from[0];
      out.copy(out, p * 4, q * 4, q * 4 + 3);
      reached.push(p);
    }
    for (const p of reached) done[p] = 1;
  }
  return {data: out, width, height};
}

const range = (from, to) => Array.from({length: Math.max(0, to - from)}, (_, i) => from + i);

// 按列号表 xs、行号表 ys 从原图取像素拼新图。
function remap(img, xs, ys) {
  const data = Buffer.alloc(xs.length * ys.length * 4);
  ys.forEach((sy, y) => xs.forEach((sx, x) => img.data.copy(data, (y * xs.length + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4)));
  return {data, width: xs.length, height: ys.length};
}

// 九宫格重拼：一个方向上取 两端 + 拉伸区域正中的 1 像素；边距都是 0 的方向原样保留。
const nineAxis = (size, a, b) => (a + b === 0 ? range(0, size) : [...range(0, a), Math.floor((a + size - b) / 2), ...range(size - b, size)]);
// 把重拼后的九宫格图拉到显示尺寸，检查图用。
const stretchAxis = (size, target, a, b) => (a + b === 0 ? range(0, size) : range(0, target).map(i => (i < a ? i : i >= target - b ? i - (target - b) + a + 1 : a)));

// 平铺接缝：最右一列接到最左一列的差，不能明显大过图里相邻两列的最大差（按预乘不透明度算，0–255）。
function seam(img) {
  const {data, width, height} = img;
  const diff = (x1, x2) => {
    let sum = 0;
    for (let y = 0; y < height; y++) {
      const p = (y * width + x1) * 4, q = (y * width + x2) * 4;
      for (let c = 0; c < 3; c++) sum += Math.abs(data[p + c] * data[p + 3] - data[q + c] * data[q + 3]) / 255;
      sum += Math.abs(data[p + 3] - data[q + 3]);
    }
    return sum / (height * 4);
  };
  const edge = diff(width - 1, 0);
  const inside = Math.max(0, ...range(0, width - 1).map(x => diff(x, x + 1)));
  const round = n => Math.round(n * 10) / 10;
  return {edge: round(edge), inside: round(inside), ok: edge <= inside * 1.25 + 2};
}

// 检查图：中性灰底，按显示尺寸排开（九宫格拉到导出尺寸，平铺图并排两份看接缝），下面写名字和尺寸。
async function contactSheet(items, file) {
  const margin = 16, labelHeight = 22;
  const cells = items.map(item => ({...item, cellWidth: Math.max(item.img.width, item.label.length * 8)}));
  const pageWidth = Math.max(1024, ...cells.map(c => c.cellWidth + 2 * margin));
  let x = margin, y = margin, rowHeight = 0;
  for (const cell of cells) {
    if (x > margin && x + cell.cellWidth + margin > pageWidth) { x = margin; y += rowHeight + margin; rowHeight = 0; }
    Object.assign(cell, {left: x, top: y});
    x += cell.cellWidth + margin;
    rowHeight = Math.max(rowHeight, cell.img.height + labelHeight);
  }
  const layers = cells.flatMap(cell => [
    {input: cell.img.data, raw: {width: cell.img.width, height: cell.img.height, channels: 4}, left: cell.left, top: cell.top},
    {input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cell.cellWidth}" height="${labelHeight}"><text x="0" y="16" font-family="sans-serif" font-size="13" fill="#111">${cell.label}</text></svg>`), left: cell.left, top: cell.top + cell.img.height + 2}
  ]);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  await sharp()({create: {width: pageWidth, height: y + rowHeight + margin, channels: 4, background: {r: 128, g: 128, b: 128, alpha: 1}}}).composite(layers).png().toFile(file);
}

const toPng = img => sharp()(img.data, {raw: {width: img.width, height: img.height, channels: 4}}).png();

export async function artCut({projectRoot, args, flags, cwd}) {
  const source = args[0] ? path.resolve(cwd, args[0]) : null;
  if (!source || !fs.existsSync(source)) throw new LgCliError('LGUI-CLI-080', `找不到整页图 ${args[0] ?? '（没写）'}。`, {fix: `用法：${USAGE}`});
  if (!flags.pkg) throw new LgCliError('LGUI-CLI-080', '没写 --pkg（存进哪个包）。', {fix: '加 --pkg Lobby。'});
  const pkgDir = path.join(projectRoot, 'ui', 'assets', flags.pkg);
  const descriptor = path.join(pkgDir, 'package.xml');
  if (!fs.existsSync(descriptor)) throw new LgCliError('LGUI-CLI-083', `ui/assets/${flags.pkg}/package.xml 不存在，没有这个包。`, {fix: '先建这个包（lgui new view 会建），或者写一个已有的包名。'});
  if (!flags.names) throw new LgCliError('LGUI-CLI-080', '没写 --names。', {fix: '写成 --names iconA=120x120,iconB=88x88,… 或者一个一行一项的文件（可以写 9grid=左,上,右,下、tile、EMPTY）。'});
  const defaultSize = flags.size ? pair(flags.size, 'size') : null;
  const pad = count(flags.pad, 'pad', 0), gap = count(flags.gap, 'gap', 24), speck = count(flags.speck, 'speck', 64), radius = count(flags.defringe, 'defringe', 2);
  let fixedScale = null;
  if (flags.scale !== undefined) {
    fixedScale = Number(flags.scale);
    if (!(fixedScale > 0)) throw new LgCliError('LGUI-CLI-080', `--scale 要写一个正数，比如 0.5（现在是 ${flags.scale}）。`, {fix: USAGE});
  }
  const entries = readEntries(flags.names, {cwd, projectRoot, defaultSize, pad});
  if (!entries.length) throw new LgCliError('LGUI-CLI-080', '名字列表是空的。', {fix: '每个物件写一个名字。'});
  const names = entries.map(e => e.name);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) throw new LgCliError('LGUI-CLI-081', `名字重复了：${[...new Set(dup)].join('、')}。`, {fix: '每个物件一个不同的名字。'});
  const targets = names.map(n => path.join(pkgDir, `${n}.png`));
  const xml = fs.readFileSync(descriptor, 'utf8');
  const taken = [...new Set([...targets.filter(f => fs.existsSync(f)).map(f => path.basename(f, '.png')), ...names.filter(n => xml.includes(`name="${n}.png"`))])];
  if (taken.length) throw new LgCliError('LGUI-CLI-082', `这些图片已经存在：${taken.join('、')}，不会覆盖。`, {fix: '换名字，或者先删掉旧图片（连同 package.xml 里的登记）。'});
  const artSrc = path.join(projectRoot, 'ui', 'art-src', flags.pkg, path.basename(source));
  if (fs.existsSync(artSrc)) throw new LgCliError('LGUI-CLI-082', `ui/art-src/${flags.pkg}/${path.basename(source)} 已经存在，不会覆盖。`, {fix: '给整页图换个文件名。'});

  let page;
  try {
    const {data, info} = await sharp()(source).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject: true});
    page = {data, width: info.width, height: info.height};
  } catch (error) {
    throw new LgCliError('LGUI-CLI-084', `读不了整页图：${error.message}`, {fix: '用带透明底的 PNG。'});
  }

  // 1. 找物件，对上名字
  const {labels, regions} = findRegions(page);
  const {objects, specks, merged} = groupRegions(regions, {speck, gap});
  if (objects.length !== entries.length) {
    const found = objects.map((o, i) => `${i + 1}.（第 ${o.row} 行）${o.x0},${o.y0} ${o.x1 - o.x0}×${o.y1 - o.y0}`).join('；');
    throw new LgCliError('LGUI-CLI-081', `在 ${path.basename(source)} 里找到 ${objects.length} 个物件，但名字有 ${entries.length} 个（EMPTY 不算）。找到的物件（左上角 x,y 宽×高）：${found || '没有'}。`, {
      fix: '对照原图看：多出来的是零碎的小块，就调大 --speck（丢掉）或 --gap（并进旁边的物件）；两个物件粘成一个，就让 AI 重画、拉开距离；空着的格子在名字列表里写 EMPTY。'
    });
  }

  // 2. 裁出、去白边，算整页统一的缩放比例
  const crops = objects.map(o => defringe(cropObject(page, labels, o), radius));
  const limits = entries.flatMap((e, i) => {
    const free = freeAxes(e);
    return [!free.h && (e.width - 2 * pad) / crops[i].width, !free.v && (e.height - 2 * pad) / crops[i].height].filter(Boolean);
  });
  if (!fixedScale && !limits.length) throw new LgCliError('LGUI-CLI-085', '这一页全是九宫格或平铺图，没有固定尺寸的方向，算不出统一的缩放比例。', {fix: '加 --scale（比如 AI 按 2 倍画的写 --scale 0.5），几页之间用同一个比例。'});
  const scale = fixedScale ?? Math.min(...limits);

  // 3. 缩放、留边、九宫格重拼、平铺检查；全部算完、没有错再写文件
  const errors = [];
  const results = [];
  for (const [i, e] of entries.entries()) {
    const crop = crops[i], free = freeAxes(e);
    let width = Math.max(1, Math.round(crop.width * scale)), height = Math.max(1, Math.round(crop.height * scale));
    const room = [e.width - 2 * pad, e.height - 2 * pad];
    if ((!free.h && crop.width * scale > room[0] + 0.5) || (!free.v && crop.height * scale > room[1] + 0.5)) {
      const fit = Math.min(...[!free.h && room[0] / crop.width, !free.v && room[1] / crop.height].filter(Boolean));
      errors.push(new LgCliError('LGUI-CLI-085', `${e.name} 按比例 ${scale} 缩放后是 ${width}×${height}，放不进 ${e.width}×${e.height}（四边各留 ${pad}）。`, {fix: `把 --scale 改到 ${Math.floor(fit * 1000) / 1000} 或更小，或者去掉 --scale 自动算。`}));
      continue;
    }
    if (!free.h) width = Math.min(width, room[0]);
    if (!free.v) height = Math.min(height, room[1]);
    const [l, t, r, b] = e.grid ?? [0, 0, 0, 0];
    if (width < l + r + 1 || height < t + b + 1) {
      errors.push(new LgCliError('LGUI-CLI-085', `${e.name} 缩放后是 ${width}×${height}，比九宫格边距 ${e.grid.join(',')} 加中间 1 像素还小。`, {fix: '边距按导出尺寸写；物件画小了就让 AI 按大约 2 倍尺寸重画，或者调大 --scale。'}));
      continue;
    }
    const scaled = width === crop.width && height === crop.height ? crop : {data: await sharp()(crop.data, {raw: {width: crop.width, height: crop.height, channels: 4}}).resize(width, height, {fit: 'fill'}).raw().toBuffer(), width, height};
    const canvasWidth = free.h ? width : e.width, canvasHeight = free.v ? height : e.height;
    const left = free.h ? 0 : Math.floor((canvasWidth - width) / 2), top = free.v ? 0 : Math.floor((canvasHeight - height) / 2);
    let img = {data: Buffer.alloc(canvasWidth * canvasHeight * 4), width: canvasWidth, height: canvasHeight};
    for (let y = 0; y < height; y++) scaled.data.copy(img.data, ((top + y) * canvasWidth + left) * 4, y * width * 4, (y + 1) * width * 4);
    let grid = null, tile = null, display = img;
    if (e.grid) {
      img = remap(img, nineAxis(img.width, l, r), nineAxis(img.height, t, b));
      grid = [l, t, l + r ? 1 : img.width, t + b ? 1 : img.height];
      display = remap(img, stretchAxis(img.width, e.width, l, r), stretchAxis(img.height, e.height, t, b));
    }
    if (e.tile) {
      tile = seam(img);
      if (!tile.ok) errors.push(new LgCliError('LGUI-CLI-086', `${e.name} 左右接不上：最右一列接最左一列的差是 ${tile.edge}，图里相邻两列最大差 ${tile.inside}。`, {fix: '让 AI 重画这一块，要求左右两端能无缝拼接；或者去掉 tile，当普通图片用。'}));
      display = remap(img, range(0, img.width * 2).map(x => x % img.width), range(0, img.height));
    }
    const o = objects[i];
    results.push({entry: e, img, grid, tile, display, file: targets[i], source: {x: o.x0, y: o.y0, width: o.x1 - o.x0, height: o.y1 - o.y0}});
  }
  if (errors.length) throw new LgCliErrors(errors);

  for (const r of results) await toPng(r.img).toFile(r.file);
  const ids = nextIds(xml, results.length);
  const lines = results.map((r, i) => `    <image id="${ids[i]}" name="${r.entry.name}.png" path="/" exported="true" width="${r.img.width}" height="${r.img.height}"${r.grid ? ` scale="9grid" scale9grid="${r.grid.join(',')}"` : ''}/>`);
  fs.writeFileSync(descriptor, xml.replace(/(\s*)<\/resources>/, `\n${lines.join('\n')}$1</resources>`));
  fs.mkdirSync(path.dirname(artSrc), {recursive: true});
  fs.copyFileSync(source, artSrc);
  const sheet = path.join(projectRoot, '.lgui', 'build', 'art', flags.pkg, `${path.parse(source).name}-sheet.png`);
  await contactSheet(results.map(r => ({img: r.display, label: `${r.entry.name} ${r.entry.width}×${r.entry.height}`})), sheet);

  const scaleText = Math.round(scale * 1000) / 1000;
  return {
    data: {
      images: results.map((r, i) => ({
        name: r.entry.name, id: ids[i], file: rel(projectRoot, r.file), url: `ui://${flags.pkg}/${r.entry.name}`,
        width: r.img.width, height: r.img.height, exportSize: {width: r.entry.width, height: r.entry.height},
        scale9grid: r.grid ? r.grid.join(',') : null, seam: r.tile, source: r.source
      })),
      scale: scaleText, source: rel(projectRoot, artSrc), sheet: rel(projectRoot, sheet), specks, merged
    },
    summary: [
      `在 ${path.basename(source)}（${page.width}×${page.height}）里找到 ${results.length} 个物件（并进旁边物件的碎片 ${merged} 块，丢掉的杂点 ${specks} 个），整页缩放比例 ${scaleText}：`,
      `  存进 ui/assets/${flags.pkg}/（${results.length} 张，已登记进 package.xml${results.some(r => r.grid) ? '，九宫格写了 scale9grid' : ''}），原图放在 ui/art-src/${flags.pkg}/。`,
      `  检查图：${rel(projectRoot, sheet)}，看一遍描边粗细、颜色、大小是否一致，名字有没有对错。`,
      '接着运行 lgui check。'
    ]
  };
}
