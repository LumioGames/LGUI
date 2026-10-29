// lgui art split <大图> --grid 6x4 --size 128x128 --pkg <包> --names <名字列表或文件>
// 把 AI 生成的网格大图平均切成 列×行 格，每格缩放到指定尺寸，存成 ui/assets/<包>/<名字>.png 并登记进 package.xml；
// 大图复制到 ui/art-src/<包>/。名字数和格子数不一样、目标文件已存在时报错，不覆盖。
import fs from 'node:fs';
import path from 'node:path';
import {LgCliError} from '../errors.mjs';
import {sharp} from '../vendor.mjs';

const pair = (value, flag) => {
  const m = /^(\d+)x(\d+)$/.exec(value ?? '');
  if (!m || Number(m[1]) < 1 || Number(m[2]) < 1) throw new LgCliError('LGUI-CLI-080', `--${flag} 要写成 宽x高 或 列x行，比如 6x4（现在是 ${value ?? '没写'}）。`, {fix: `写成 --${flag} 6x4。`});
  return [Number(m[1]), Number(m[2])];
};

/** 包里没用过的资源 ID：art 加 5 位数字。 */
function nextIds(xml, count) {
  const used = new Set([...xml.matchAll(/\bid="([a-z0-9]{8})"/g)].map(m => m[1]));
  const ids = [];
  for (let n = 0; ids.length < count; n++) {
    const id = `art${String(n).padStart(5, '0')}`;
    if (!used.has(id)) ids.push(id);
  }
  return ids;
}

export async function artSplit({projectRoot, args, flags, cwd}) {
  const source = args[0] ? path.resolve(cwd, args[0]) : null;
  if (!source || !fs.existsSync(source)) throw new LgCliError('LGUI-CLI-080', `找不到大图 ${args[0] ?? '（没写）'}。`, {fix: '用法：lgui art split <大图> --grid 6x4 --size 128x128 --pkg <包> --names <名字列表或文件>'});
  const [cols, rows] = pair(flags.grid, 'grid');
  const [width, height] = pair(flags.size, 'size');
  if (!flags.pkg) throw new LgCliError('LGUI-CLI-080', '没写 --pkg（存进哪个包）。', {fix: '加 --pkg Bag。'});
  const pkgDir = path.join(projectRoot, 'ui', 'assets', flags.pkg);
  const descriptor = path.join(pkgDir, 'package.xml');
  if (!fs.existsSync(descriptor)) throw new LgCliError('LGUI-CLI-083', `ui/assets/${flags.pkg}/package.xml 不存在，没有这个包。`, {fix: '先建这个包（lgui new view 会建），或者写一个已有的包名。'});
  if (!flags.names) throw new LgCliError('LGUI-CLI-080', '没写 --names。', {fix: '写成 --names sword,shield,… 或者一个每行一个名字的文件。'});
  const namesFile = path.resolve(cwd, flags.names);
  const names = (fs.existsSync(namesFile) ? fs.readFileSync(namesFile, 'utf8').split(/\r?\n/) : flags.names.split(',')).map(n => n.trim()).filter(Boolean);
  if (names.length !== cols * rows) throw new LgCliError('LGUI-CLI-081', `给了 ${names.length} 个名字，但网格是 ${cols}×${rows} = ${cols * rows} 格。`, {fix: '名字的数量要和格子数一样，按从左到右、从上到下的顺序。'});
  const bad = names.filter(n => !/^[a-z][A-Za-z0-9]*$/.test(n));
  if (bad.length) throw new LgCliError('LGUI-CLI-080', `这些名字不合规范：${bad.join('、')}。`, {fix: '图片名用小写开头的驼峰（UI 开发规范第 3 节）。'});
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) throw new LgCliError('LGUI-CLI-081', `名字重复了：${[...new Set(dup)].join('、')}。`, {fix: '每格一个不同的名字。'});
  const targets = names.map(n => path.join(pkgDir, `${n}.png`));
  const exists = targets.filter(f => fs.existsSync(f));
  const xml = fs.readFileSync(descriptor, 'utf8');
  const registered = names.filter(n => xml.includes(`name="${n}.png"`));
  if (exists.length || registered.length) throw new LgCliError('LGUI-CLI-082', `这些图片已经存在：${[...new Set([...exists.map(f => path.basename(f, '.png')), ...registered])].join('、')}，不会覆盖。`, {fix: '换名字，或者先删掉旧图片（连同 package.xml 里的登记）。'});
  const artSrc = path.join(projectRoot, 'ui', 'art-src', flags.pkg, path.basename(source));
  if (fs.existsSync(artSrc)) throw new LgCliError('LGUI-CLI-082', `ui/art-src/${flags.pkg}/${path.basename(source)} 已经存在，不会覆盖。`, {fix: '给大图换个文件名。'});

  let meta;
  try {
    meta = await sharp()(source).metadata();
  } catch (error) {
    throw new LgCliError('LGUI-CLI-084', `读不了大图：${error.message}`, {fix: '用 PNG 或 JPG。'});
  }
  const cellW = Math.floor(meta.width / cols), cellH = Math.floor(meta.height / rows);
  for (let i = 0; i < names.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    await sharp()(source).extract({left: col * cellW, top: row * cellH, width: cellW, height: cellH}).resize(width, height, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toFile(targets[i]);
  }
  const ids = nextIds(xml, names.length);
  const lines = names.map((n, i) => `    <image id="${ids[i]}" name="${n}.png" path="/" exported="true" width="${width}" height="${height}"/>`);
  fs.writeFileSync(descriptor, xml.replace(/(\s*)<\/resources>/, `\n${lines.join('\n')}$1</resources>`));
  fs.mkdirSync(path.dirname(artSrc), {recursive: true});
  fs.copyFileSync(source, artSrc);
  return {
    data: {images: names.map((n, i) => ({name: n, id: ids[i], file: path.relative(projectRoot, targets[i]), url: `ui://${flags.pkg}/${n}`})), source: path.relative(projectRoot, artSrc), cell: {width: cellW, height: cellH}},
    summary: [`把 ${path.basename(source)}（${meta.width}×${meta.height}）切成 ${cols}×${rows} 格，每格 ${cellW}×${cellH}，缩放到 ${width}×${height}：`, `  存进 ui/assets/${flags.pkg}/（${names.length} 张，已登记进 package.xml），原图放在 ui/art-src/${flags.pkg}/。`, '接着运行 lgui check。']
  };
}
