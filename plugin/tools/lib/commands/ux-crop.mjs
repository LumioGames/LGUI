// lgui ux crop：把原型图的一块放大，叠上坐标网格，再列出这一块的主色。量位置、尺寸、颜色用。
// 网格上标的数是原图像素 × --scale（设计单位 = 原图像素 × scale），写进 design.json 的就是标出来的数。
// 不需要在工程里运行；什么都不改，只写一张放大图。
import fs from 'node:fs';
import path from 'node:path';
import {LgCliError} from '../errors.mjs';
import {sharp} from '../vendor.mjs';

const USAGE = '照用法写：lgui ux crop <原型图> [--rect x,y,宽,高] [--zoom 倍数] [--step 网格间隔] [--scale 设计单位换算] [--colors 颜色数] [--out 输出文件]。';
const bad = message => new LgCliError('LGUI-CLI-160', message, {fix: USAGE});

function number(value, name, {min = 0, integer = false} = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) throw bad(`--${name} 写的 ${value} 不对。`);
  return n;
}

const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

/** 一块区域的主色：缩到 64 像素以内，按每个通道 16 档分桶，取占比最大的几个，每个桶报桶内的平均色。 */
export async function dominantColors(image, count = 6) {
  const {data, info} = await image.clone().resize(64, 64, {fit: 'inside', withoutEnlargement: true, kernel: 'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const buckets = new Map();
  let total = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 128) continue;
    const key = (data[i] >> 4) << 8 | (data[i + 1] >> 4) << 4 | (data[i + 2] >> 4);
    const bucket = buckets.get(key) ?? [0, 0, 0, 0];
    bucket[0] += data[i]; bucket[1] += data[i + 1]; bucket[2] += data[i + 2]; bucket[3]++;
    buckets.set(key, bucket);
    total++;
  }
  return [...buckets.values()].sort((a, b) => b[3] - a[3]).slice(0, count)
    .map(([r, g, b, n]) => ({color: hex([r / n, g / n, b / n]), percent: Math.round(n / total * 1000) / 10}));
}

// 网格：细线每 step 一条，粗线每 5 个 step 一条并标数。x0、y0 是这一块在原图里的左上角。
function gridSvg({x0, y0, width, height, zoom, step, scale}) {
  const W = width * zoom, H = height * zoom;
  const label = v => { const n = v * scale; return String(Math.round(n * 10) / 10); };
  const parts = [];
  const line = (x1, y1, x2, y2, major, color) => parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${major ? 1.5 : 0.5}" stroke-opacity="${major ? 0.95 : 0.45}"/>`);
  const text = (x, y, value) => {
    const w = value.length * 7 + 6;
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="14" fill="#000" fill-opacity="0.7"/><text x="${x + 3}" y="${y + 11}" font-family="sans-serif" font-size="11" fill="#ffee33">${value}</text>`);
  };
  const labels = [];
  for (let v = Math.ceil(x0 / step) * step; v <= x0 + width; v += step) {
    const major = Math.round(v / step) % 5 === 0;
    const x = (v - x0) * zoom;
    line(x, 0, x, H, major, '#ff3df2');
    if (major) labels.push([x + 2, 1, label(v)]);
  }
  for (let v = Math.ceil(y0 / step) * step; v <= y0 + height; v += step) {
    const major = Math.round(v / step) % 5 === 0;
    const y = (v - y0) * zoom;
    line(0, y, W, y, major, '#19f0ff');
    if (major) labels.push([1, y < 14 ? y + 16 : y + 2, label(v)]); // 最上面一行让开 x 方向的标数
  }
  for (const [x, y, value] of labels) if (x < W - 12 && y < H - 12) text(x, y, value);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('')}</svg>`);
}

export async function uxCrop({args, flags, cwd}) {
  if (args.length !== 1) throw bad('要给一张原型图。');
  const source = path.resolve(cwd, args[0]);
  if (!fs.existsSync(source)) throw bad(`找不到图片 ${args[0]}。`);
  let meta;
  try {
    meta = await sharp()(source).metadata();
  } catch (error) {
    throw new LgCliError('LGUI-CLI-161', `读不了图片 ${args[0]}：${error.message}`, {fix: '用 PNG、JPG 或 WebP。'});
  }
  let rect = {x: 0, y: 0, width: meta.width, height: meta.height};
  if (flags.rect !== undefined) {
    const parts = String(flags.rect).split(',').map(Number);
    if (parts.length !== 4 || parts.some(n => !Number.isInteger(n)) || parts[0] < 0 || parts[1] < 0 || parts[2] <= 0 || parts[3] <= 0) throw bad(`--rect 写的 ${flags.rect} 不对：要 4 个整数 x,y,宽,高（原图像素）。`);
    rect = {x: parts[0], y: parts[1], width: parts[2], height: parts[3]};
    if (rect.x + rect.width > meta.width || rect.y + rect.height > meta.height) throw bad(`--rect ${flags.rect} 超出了图片（${meta.width}×${meta.height}）。`);
  }
  const scale = flags.scale === undefined ? 1 : number(flags.scale, 'scale', {min: 0.01});
  // 放大倍数：不写时取让长边不超过 1600 像素的最大整数倍，最多 6 倍。
  const zoom = flags.zoom === undefined
    ? Math.max(1, Math.min(6, Math.floor(1600 / Math.max(rect.width, rect.height))))
    : number(flags.zoom, 'zoom', {min: 1, integer: true});
  if (rect.width * zoom > 8000 || rect.height * zoom > 8000) throw bad(`放大 ${zoom} 倍后是 ${rect.width * zoom}×${rect.height * zoom}，太大了。`);
  // 网格间隔（原图像素）：不写时放大 3 倍以上用 10，否则 50。
  const step = flags.step === undefined ? (zoom >= 3 ? 10 : 50) : number(flags.step, 'step', {min: 1, integer: true});
  const count = flags.colors === undefined ? 6 : number(flags.colors, 'colors', {min: 1, integer: true});
  const name = `${path.parse(source).name}-${rect.x}-${rect.y}-${rect.width}-${rect.height}.png`;
  const out = flags.out ? path.resolve(cwd, flags.out) : path.join(path.dirname(source), 'crops', name);

  const region = sharp()(source).extract({left: rect.x, top: rect.y, width: rect.width, height: rect.height});
  const colors = await dominantColors(region, count);
  const enlarged = await region.clone().resize(rect.width * zoom, rect.height * zoom, {kernel: zoom >= 2 ? 'nearest' : 'lanczos3'}).png().toBuffer();
  fs.mkdirSync(path.dirname(out), {recursive: true});
  await sharp()(enlarged).composite([{input: gridSvg({x0: rect.x, y0: rect.y, width: rect.width, height: rect.height, zoom, step, scale}), left: 0, top: 0}]).png().toFile(out);

  const shown = path.relative(cwd, out).split(path.sep).join('/');
  return {
    data: {out: shown, image: {width: meta.width, height: meta.height}, rect, zoom, step, scale, colors},
    summary: [
      `放大图：${shown}（原图 ${rect.x},${rect.y} 起 ${rect.width}×${rect.height}，放大 ${zoom} 倍）。`,
      `  网格：细线每 ${step} 原图像素一条，粗线每 ${step * 5} 一条；标的数${scale === 1 ? '是原图像素' : `是设计单位（原图像素 × ${scale}）`}，洋红是 x、青色是 y。`,
      `  主色：${colors.map(c => `${c.color} ${c.percent}%`).join('、')}。`
    ]
  };
}
