// 一致性测试的运行器：建测试工程，同一个用例分别在 headless（Node）和 h5（浏览器，真实的鼠标、触摸、按键）上跑，各取一份快照。
// 用例和取快照的代码在 cases/ 和 harness.ts，两个后端打包的是同一份；只有「怎么操作」不一样：
// headless 用模拟操作，h5 把操作换算成页面坐标后交给 playwright 发真实输入。
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {run} from '../unit/cli/helpers.mjs';
import {esbuild} from '../../plugin/tools/lib/vendor.mjs';
import {readProject} from '../../plugin/tools/lib/project.mjs';
import {generateWeb, generateProjectTypes, headlessDir, uiProjectPath, webUiDir} from '../../plugin/tools/lib/generate/index.mjs';
import {readUiModel} from '../../plugin/tools/lib/generate/model.mjs';
import {extractTexts, generateTranslations, translationMaps} from '../../plugin/tools/lib/generate/i18n.mjs';
import {readTexts, runtimeConfig, webBuildOptions} from '../../plugin/tools/lib/dev/bundle.mjs';
import {serveBuilt} from '../../plugin/tools/lib/dev/index.mjs';
import {writeControls} from './controls.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const cases = fs.readdirSync(path.join(here, 'cases')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3)).sort();

const posix = p => p.split(path.sep).join('/');

/** 测试工程：lgui init 的模板，再用 lgui new module 加三种排布模式（split、tabs、dialog），再放进 Controls 包（新控件、齿轮和组，见 ui/Controls）。 */
export async function conformanceProject() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-conf-'));
  const step = async (argv, cwd) => { const r = await run(argv, cwd); if (r.code !== 0) throw new Error(`lgui ${argv.join(' ')}：${r.stderr}`); };
  await step(['init', 'conf'], parent);
  const root = path.join(parent, 'conf');
  await step(['new', 'module', 'bag', '--pattern', 'split'], root);
  await step(['new', 'module', 'shop', '--pattern', 'tabs'], root);
  await step(['new', 'module', 'ask', '--pattern', 'dialog'], root);
  writeControls(root);
  const dir = path.join(root, 'conformance');
  fs.cpSync(path.join(here, 'cases'), path.join(dir, 'cases'), {recursive: true});
  fs.copyFileSync(path.join(here, 'harness.ts'), path.join(dir, 'harness.ts'));
  // 用例在 conformance/cases/ 里，写的是 ../src/...；把 src 映射过去（junction：Windows 没开开发者模式也能建，别的系统上当作 dir）。
  fs.symlinkSync(path.join(root, 'src'), path.join(dir, 'src'), 'junction');

  const project = readProject(root);
  await generateWeb(uiProjectPath(root), webUiDir(root));
  await generateProjectTypes(root, {validated: true});
  const model = readUiModel(uiProjectPath(root));
  generateTranslations(root, model, project.languages, path.join(root, '.lgui', 'build', 'web', 'i18n'), project.defaultLanguage);
  const packages = fs.readdirSync(headlessDir(root)).map(f => JSON.parse(fs.readFileSync(path.join(headlessDir(root), f), 'utf8')));
  const texts = readTexts(root, project.languages);
  fs.writeFileSync(path.join(dir, 'layout.ts'), `export default ${JSON.stringify(layoutOf(packages))};\n`);
  return {
    root, project, packages, texts,
    translations: translationMaps(extractTexts(model), texts, project.defaultLanguage),
    deps: JSON.parse(fs.readFileSync(path.join(root, '.lgui', 'build', 'deps.json'), 'utf8'))
  };
}

/** 快照里要读的控件：每个组件（横版）的全部控件、控制器，列表和树的子项里的文字，滑动条和下拉框的值，序列帧动画在不在播放。 */
function layoutOf(packages) {
  const components = new Map(packages.flatMap(p => p.components.map(c => [c.name, c])));
  const isButton = name => components.get(name)?.extension === 'Button';
  const textKinds = ['text', 'richtext', 'input', 'label', 'combobox'];
  return {
    components: [...components.values()].filter(c => !c.name.endsWith('@portrait')).map(c => ({
      name: c.name,
      controllers: c.controllers.map(x => x.name),
      children: c.children.filter(ch => ch.name).map(ch => {
        const item = (ch.kind === 'list' || ch.kind === 'tree') && ch.defaultItem ? components.get(ch.defaultItem) : null;
        return {
          name: ch.name, kind: ch.kind,
          text: textKinds.includes(ch.kind) || isButton(ch.ref),
          value: ch.kind === 'slider' || ch.kind === 'combobox',
          playing: ch.kind === 'movieclip',
          itemTexts: item ? item.children.filter(x => x.name && (textKinds.includes(x.kind) || isButton(x.ref))).map(x => x.name) : []
        };
      })
    }))
  };
}

const fw = (ctx, rel) => JSON.stringify(posix(path.join(ctx.root, '.lgui', 'framework', rel)));
const caseImport = (ctx, name) => JSON.stringify(posix(path.join(ctx.root, 'conformance', 'cases', `${name}.ts`)));
const common = (ctx, name) => `import {lgui} from 'lgui';
import app from ${JSON.stringify(posix(path.join(ctx.root, 'src', 'main.ts')))};
import layout from ${JSON.stringify(posix(path.join(ctx.root, 'conformance', 'layout.ts')))};
import {capture} from ${JSON.stringify(posix(path.join(ctx.root, 'conformance', 'harness.ts')))};
import c from ${caseImport(ctx, name)};
const config = ${JSON.stringify(runtimeConfig(ctx.project))};
const deps = ${JSON.stringify(ctx.deps)};
const texts = ${JSON.stringify(ctx.texts)};
`;

/** 在 headless 上跑一个用例。 */
export async function runHeadless(ctx, name) {
  const entry = path.join(ctx.root, 'conformance', `headless-${name}.ts`);
  fs.writeFileSync(entry, `${common(ctx, name)}
import {createHeadlessBackend} from ${fw(ctx, 'backends/headless/index.ts')};
import * as sim from ${fw(ctx, 'backends/headless/simulate.ts')};
const packages = ${JSON.stringify(ctx.packages)};
const translations = ${JSON.stringify(ctx.translations)};
(globalThis as unknown as {__lguiTest: unknown}).__lguiTest = {createBackend: () => createHeadlessBackend(packages, translations), sim, deps, config, texts, current: null};
export async function main(): Promise<unknown> {
  const t = await lgui.testing.start(app, {screen: c.screen});
  const result = capture(t, layout, await c.run(t));
  t.end();
  return result;
}
`);
  const outfile = path.join(ctx.root, 'conformance', 'out', `headless-${name}.mjs`);
  await esbuild().build({...webBuildOptions(ctx.root, entry), platform: 'node', outfile, sourcemap: false});
  const mod = await import(pathToFileURL(outfile).href);
  return JSON.parse(JSON.stringify(await mod.main()));
}

/** 在 h5 上跑一个用例（browser 是 playwright 的浏览器）。 */
export async function runH5(ctx, name, browser) {
  const web = path.join(ctx.root, '.lgui', 'build', 'web');
  const entry = path.join(ctx.root, 'conformance', `h5-${name}.ts`);
  fs.writeFileSync(entry, `${common(ctx, name)}
import {createH5Backend} from ${fw(ctx, 'backends/h5/index.ts')};
import {stage} from ${fw(ctx, 'backends/h5/scale.ts')};
type Obj = {native: {element: HTMLElement}};
// 新控件在 FairyGUI-dom 里的内部字段（只给一致性测试换算坐标用）。
type Input = {native: {element: {htmlInput: HTMLInputElement}}};
type Slider = {native: {value: number; min: number; max: number; _barMaxWidth: number; _gripObject: {element: HTMLElement}}};
type Combo = {native: {dropdown: {getChild(name: string): {getChildAt(index: number): {element: HTMLElement}}}}};
type Pw = (op: string, ...args: number[] | string[]) => Promise<void>;
const pw = (window as unknown as {__pw: Pw}).__pw;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// 控件中心在页面上的坐标。
const center = (o: unknown) => { const r = (o as Obj).native.element.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; };
const touchDrag = async (o: unknown, dx: number, dy: number, ms: number, steps: number) => { const p = center(o); await pw('touchDrag', p.x, p.y, dx * stage.scale, dy * stage.scale, ms, steps); await wait(50); };
const sim = {
  async click(_b: unknown, o: unknown, holdMs = 50) { const p = center(o); await pw('press', p.x, p.y, holdMs); await wait(50); },
  async doubleClick(b: unknown, o: unknown) { await sim.click(b, o); await sim.click(b, o); },
  async hold(_b: unknown, o: unknown, ms: number) { const p = center(o); await pw('press', p.x, p.y, ms); await wait(50); },
  drag: (_b: unknown, o: unknown, dx: number, dy: number) => touchDrag(o, dx, dy, 400, 10),
  swipe: (_b: unknown, o: unknown, dx: number, dy: number) => touchDrag(o, dx, dy, 80, 4),
  async pinch() { throw new Error('一致性测试还没接 h5 的双指缩放'); },
  async wheel(_b: unknown, o: unknown, dy: number) { const p = center(o); await pw('wheel', p.x, p.y, dy); await wait(50); },
  async key(_b: unknown, name: string) { await pw('key', name); await wait(50); },
  // 打字：点一下输入框、全选，再用键盘一个字一个字地输入；空字符串按退格清空。
  async type(b: unknown, o: unknown, text: string) {
    await sim.click(b, o);
    (o as Input).native.element.htmlInput.select();
    if (text) await pw('type', text); else if ((o as Input).native.element.htmlInput.value) await pw('key', 'Backspace');
    await wait(50);
  },
  // 拖滑动条：按住滑块，一次移到目标位置再松开（只发一次移动，FairyGUI 只通知一次）。
  async setValue(_b: unknown, o: unknown, value: number) {
    const n = (o as Slider).native;
    const from = center({native: n._gripObject});
    const target = (Math.min(n.max, Math.max(n.min, value)) - n.min) / (n.max - n.min);
    const dx = (target - (n.value - n.min) / (n.max - n.min)) * n._barMaxWidth * stage.scale;
    await pw('mouseDrag', from.x, from.y, from.x + dx, from.y);
    await wait(50);
  },
  // 选下拉框：点开，再点弹出列表里的那一项。
  async choose(b: unknown, o: unknown, index: number) {
    await sim.click(b, o);
    const item = (o as Combo).native.dropdown.getChild('list').getChildAt(index);
    await sim.click(b, {native: item});
  },
  async setScreen(_b: unknown, width: number, height: number) { await pw('viewport', width, height); },
  advance: (_b: unknown, ms: number) => wait(ms),
};
const createBackend = () => {
  const backend = createH5Backend();
  const init = backend.init.bind(backend);
  backend.init = options => init({...options, uiBase: '/ui', i18nBase: '/i18n'});
  return backend;
};
(globalThis as unknown as {__lguiTest: unknown}).__lguiTest = {createBackend, sim, deps, config, texts, current: null};
(window as unknown as {__run: () => Promise<unknown>}).__run = async () => {
  const t = await lgui.testing.start(app);
  const result = capture(t, layout, await c.run(t));
  t.end();
  return result;
};
`);
  await esbuild().build({...webBuildOptions(ctx.root, entry), outfile: path.join(web, 'conf.js')});
  const html = '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden;background:#000}</style><body><script type="module" src="/conf.js"></script>';
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/conf.html') res.writeHead(200, {'content-type': 'text/html; charset=utf-8'}).end(html);
    else serveBuilt(ctx.root, url, res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const {screen} = await caseScreen(ctx, name);
  const page = await browser.newPage({viewport: screen, hasTouch: true});
  try {
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message ?? e)));
    const cdp = await page.context().newCDPSession(page);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await page.exposeFunction('__pw', async (op, ...a) => {
      if (op === 'press') { await page.mouse.move(a[0], a[1]); await page.mouse.down(); await sleep(a[2]); await page.mouse.up(); }
      else if (op === 'wheel') { await page.mouse.move(a[0], a[1]); await page.mouse.wheel(0, a[2]); }
      else if (op === 'key') await page.keyboard.press(a[0]);
      else if (op === 'type') await page.keyboard.type(a[0]);
      else if (op === 'mouseDrag') { await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move(a[2], a[3]); await page.mouse.up(); }
      else if (op === 'viewport') { await page.setViewportSize({width: a[0], height: a[1]}); }
      else if (op === 'touchDrag') {
        const [x, y, dx, dy, ms, steps] = a;
        const touch = (type, px, py) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x: px, y: py, id: 1}]});
        await touch('touchStart', x, y);
        for (let i = 1; i <= steps; i++) { await sleep(ms / steps); await touch('touchMove', x + (dx * i) / steps, y + (dy * i) / steps); }
        await touch('touchEnd');
      } else throw new Error(`未知操作 ${op}`);
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/conf.html`);
    await page.waitForFunction(() => window.__run, null, {timeout: 15000});
    const result = await page.evaluate(() => window.__run());
    if (errors.length) throw new Error(`h5 页面报错：${errors.join('；')}`);
    return result;
  } finally {
    await page.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

// 用例开始时的屏幕尺寸（h5 要先按它开页面）。
async function caseScreen(ctx, name) {
  const outfile = path.join(ctx.root, 'conformance', 'out', `screen-${name}.mjs`);
  const entry = path.join(ctx.root, 'conformance', `screen-${name}.ts`);
  fs.writeFileSync(entry, `import c from ${caseImport(ctx, name)};\nexport const screen = c.screen;\n`);
  await esbuild().build({...webBuildOptions(ctx.root, entry), platform: 'node', outfile, sourcemap: false});
  return import(pathToFileURL(outfile).href);
}
