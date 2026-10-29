// lgui verify：生成一次，在随机端口起服务，用 Chrome 或 Edge 按标准尺寸 × 横竖两种方向截图，每张图旁边存一份界面快照。
// --size 只截一组；--view 先打开指定的界面；--lang <语言> 再乘上语言；--lang pseudo 用伪翻译（文字加长 40%、换成带重音的字母），再按最长的语言横竖各截一张。
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {LgCliError} from '../errors.mjs';
import {esbuild, playwright} from '../vendor.mjs';
import {generateProjectTypes, generateWeb, uiProjectPath, webUiDir} from '../generate/index.mjs';
import {readUiModel} from '../generate/model.mjs';
import {extractTexts, generateTranslations, translationXml} from '../generate/i18n.mjs';
import {readTexts, webBuildOptions, writeWebBootstrap, bundleErrors} from '../dev/bundle.mjs';
import {serveBuilt} from '../dev/index.mjs';

const ACCENTS = {a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', c: 'ç', n: 'ñ', y: 'ý'};

/** 伪翻译：字母换成带重音的，加长 40%，两头加 [ ]；占位符 {xxx} 原样保留。 */
export function pseudo(text) {
  const parts = text.split(/(\{\w+\})/);
  const body = parts.map(p => /^\{\w+\}$/.test(p) ? p : [...p].map(ch => ACCENTS[ch] ?? ch).join('')).join('');
  const visible = text.replace(/\{\w+\}/g, '').length;
  return `[${body}${'~'.repeat(Math.ceil(visible * 0.4))}]`;
}

const pseudoTable = table => Object.fromEntries(Object.entries(table).map(([k, v]) => [k, typeof v === 'string' ? pseudo(v) : Object.fromEntries(Object.entries(v).map(([f, t]) => [f, pseudo(t)]))]));
const tableLength = table => Object.values(table).reduce((sum, v) => sum + (typeof v === 'string' ? v.length : Object.values(v).join('').length), 0);

async function launch() {
  const {chromium} = playwright();
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({channel, headless: true}); } catch { /* 换下一个 */ }
  }
  throw new LgCliError('LGUI-CLI-060', '没找到 Chrome 或 Edge，没法截图。', {fix: '装一个 Chrome 或 Edge；lgui doctor 会告诉你它在哪里找。'});
}

/** 跑一次验证，返回截图清单。 */
export async function runVerify(root, project, {size, view, lang} = {}) {
  const sizes = size ? project.verifySizes.filter(s => s.name === size) : project.verifySizes;
  if (!sizes.length) throw new LgCliError('LGUI-CLI-061', `没有名为 ${size} 的验证尺寸。`, {fix: `能用的：${project.verifySizes.map(s => s.name).join('、')}（工程配置 verifySizes）。`});
  if (lang && lang !== 'pseudo' && !project.languages.includes(lang)) throw new LgCliError('LGUI-CLI-062', `工程不支持语言 ${lang}。`, {fix: `能用的：${project.languages.join('、')}，或者 pseudo（伪翻译）。`});

  // 1. 生成（不监听文件）
  await generateWeb(uiProjectPath(root), webUiDir(root));
  await generateProjectTypes(root, {validated: true});
  const model = readUiModel(uiProjectPath(root));
  const i18nDir = path.join(root, '.lgui', 'build', 'web', 'i18n');
  generateTranslations(root, model, project.languages, i18nDir, project.defaultLanguage);
  const texts = readTexts(root, project.languages);
  const languages = [...project.languages];
  if (lang === 'pseudo') {
    // 伪翻译：从默认语言的文字（ui/ 里的原文和文本表）生成
    const entries = extractTexts(model);
    const base = {...Object.fromEntries(entries.map(e => [e.key, e.text])), ...texts[project.defaultLanguage]};
    texts.pseudo = pseudoTable(base);
    fs.writeFileSync(path.join(i18nDir, 'pseudo.xml'), translationXml(entries, texts.pseudo));
    languages.push('pseudo');
  }
  const verifyProject = {...project, languages};
  const entry = writeWebBootstrap(root, verifyProject, {texts});
  try {
    await esbuild().build(webBuildOptions(root, entry));
  } catch (error) {
    throw bundleErrors(error, root);
  }

  // 2. 随机端口起服务
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/__lgui/events') { res.writeHead(204).end(); return; }
    serveBuilt(root, url, res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const out = path.join(root, '.lgui', 'build', 'verify');
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(out, {recursive: true});

  // 要截哪些：尺寸 × 方向（× 语言）
  const shots = [];
  const langs = lang ? [lang] : [null];
  for (const l of langs) for (const s of sizes) for (const orientation of ['landscape', 'portrait']) shots.push({size: s, orientation, lang: l});
  if (lang === 'pseudo') {
    // 再按最长的那种语言，横竖各截一张
    const longest = project.languages.reduce((a, b) => tableLength(texts[b] ?? {}) > tableLength(texts[a] ?? {}) ? b : a);
    for (const orientation of ['landscape', 'portrait']) shots.push({size: sizes[0], orientation, lang: longest});
  }

  const browser = await launch();
  const results = [];
  try {
    for (const shot of shots) {
      const long = Math.max(shot.size.width, shot.size.height), short = Math.min(shot.size.width, shot.size.height);
      const viewport = shot.orientation === 'landscape' ? {width: long, height: short} : {width: short, height: long};
      const page = await browser.newPage({viewport, locale: project.defaultLanguage});
      const errors = [];
      page.on('pageerror', e => errors.push(String(e.message ?? e)));
      try {
        await page.goto(url);
        await page.waitForFunction(() => window.__lguiReady || document.getElementById('lgui-overlay')?.style.display === 'block', null, {timeout: 20000});
        if (shot.lang && shot.lang !== project.defaultLanguage) await page.evaluate(l => window.__lgui.lgui.setLanguage(l), shot.lang);
        if (view) {
          const opened = await page.evaluate(name => { const V = window.__lgui.views[name]; if (!V) return false; return window.__lgui.lgui.ui.open(V).then(() => true); }, view);
          if (!opened) throw new LgCliError('LGUI-CLI-063', `src/modules/ 里没有导出名为 ${view} 的 View。`, {fix: '写 View 的类名，比如 BagView。'});
        }
        // 等框架判好方向、换好版，图片加载完
        const expected = project.orientation === 'both' ? shot.orientation : project.orientation;
        await page.waitForFunction(o => window.__lgui?.snapshot().orientation === o, expected, {timeout: 5000});
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(250);
        const name = `${shot.size.name}-${shot.orientation}${shot.lang ? `-${shot.lang}` : ''}`;
        const image = path.join(out, `${name}.png`);
        await page.screenshot({path: image});
        const snapshot = await page.evaluate(() => window.__lgui.snapshot());
        fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(snapshot, null, 2) + '\n');
        results.push({name, image: path.relative(root, image), viewport, errors});
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
  return {url, shots: results};
}

/** lgui verify 命令。 */
export async function verify({projectRoot, project, flags}) {
  const {shots} = await runVerify(projectRoot, project, {size: flags.size, view: flags.view, lang: flags.lang});
  const failed = shots.filter(s => s.errors.length);
  return {
    data: {shots},
    summary: [`截了 ${shots.length} 张图（.lgui/build/verify/，每张旁边有同名的界面快照 .json）：`, ...shots.map(s => `  ${s.image}  ${s.viewport.width}×${s.viewport.height}${s.errors.length ? `  页面报错：${s.errors.join('；')}` : ''}`), '逐张看一遍：文字有没有被截断、横竖两版排得对不对。'],
    errors: failed.map(s => new LgCliError('LGUI-CLI-064', `截图 ${s.name} 时页面报错：${s.errors.join('；')}`, {fix: '按报错改代码；lgui dev 里能看到同样的错误。'}))
  };
}
