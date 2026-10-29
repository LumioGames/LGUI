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

const here = path.dirname(fileURLToPath(import.meta.url));
export const cases = fs.readdirSync(path.join(here, 'cases')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3)).sort();

const posix = p => p.split(path.sep).join('/');

/** 测试工程：lgui init 的模板，再用 lgui new module 加三种排布模式（split、tabs、dialog）。 */
export async function conformanceProject() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-conf-'));
  const step = async (argv, cwd) => { const r = await run(argv, cwd); if (r.code !== 0) throw new Error(`lgui ${argv.join(' ')}：${r.stderr}`); };
  await step(['init', 'conf'], parent);
  const root = path.join(parent, 'conf');
  await step(['new', 'module', 'bag', '--pattern', 'split'], root);
  await step(['new', 'module', 'shop', '--pattern', 'tabs'], root);
  await step(['new', 'module', 'ask', '--pattern', 'dialog'], root);
  const dir = path.join(root, 'conformance');
  fs.cpSync(path.join(here, 'cases'), path.join(dir, 'cases'), {recursive: true});
  fs.copyFileSync(path.join(here, 'harness.ts'), path.join(dir, 'harness.ts'));
  // 用例在 conformance/cases/ 里，写的是 ../src/...；把 src 映射过去。
  fs.symlinkSync(path.join(root, 'src'), path.join(dir, 'src'), 'dir');

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

/** 快照里要读的控件：每个组件（横版）的全部控件、控制器，列表子项里的文字。 */
function layoutOf(packages) {
  const components = new Map(packages.flatMap(p => p.components.map(c => [c.name, c])));
  const isButton = name => components.get(name)?.extension === 'Button';
  const textKinds = ['text', 'richtext', 'input'];
  return {
    components: [...components.values()].filter(c => !c.name.endsWith('@portrait')).map(c => ({
      name: c.name,
      controllers: c.controllers.map(x => x.name),
      children: c.children.filter(ch => ch.name).map(ch => {
        const item = ch.kind === 'list' && ch.defaultItem ? components.get(ch.defaultItem) : null;
        return {
          name: ch.name, kind: ch.kind,
          text: textKinds.includes(ch.kind) || isButton(ch.ref),
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
type Pw = (op: string, ...args: (number | string)[]) => Promise<void>;
const pw = (window as unknown as {__pw: Pw}).__pw;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// 只收集诊断；不重写事件、时间、坐标或任何手势判定。
const inputTrace: {browserTimeOrigin: number; dom: unknown[]; normalized: unknown[]} = {browserTimeOrigin: performance.timeOrigin, dom: [], normalized: []};
(window as unknown as {__h5InputTrace: unknown}).__h5InputTrace = inputTrace;
for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.addEventListener(type, event => {
  const pointer = event as PointerEvent;
  inputTrace.dom.push({type, pointerId: pointer.pointerId, pointerType: pointer.pointerType, x: pointer.clientX, y: pointer.clientY,
    timestamp: pointer.timeStamp, timestampEpoch: performance.timeOrigin + pointer.timeStamp,
    handledEpoch: performance.timeOrigin + performance.now(), trusted: pointer.isTrusted});
}, true);
// 控件中心在页面上的坐标。
const center = (o: unknown) => { const r = (o as Obj).native.element.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; };
const touchDrag = async (o: unknown, dx: number, dy: number, ms: number, steps: number) => { const p = center(o); await pw('touchDrag', p.x, p.y, dx * stage.scale, dy * stage.scale, ms, steps); await wait(50); };
const sim = {
  async click(_b: unknown, o: unknown, holdMs = 50, pointerType = 'mouse') { const p = center(o); await pw('press', p.x, p.y, holdMs, pointerType); await wait(50); },
  async doubleClick(b: unknown, o: unknown) { await sim.click(b, o); await sim.click(b, o); },
  async hold(_b: unknown, o: unknown, ms: number) { const p = center(o); await pw('press', p.x, p.y, ms); await wait(50); },
  drag: (_b: unknown, o: unknown, dx: number, dy: number) => touchDrag(o, dx, dy, 400, 10),
  swipe: (_b: unknown, o: unknown, dx: number, dy: number) => touchDrag(o, dx, dy, 80, 4),
  async pinch() { throw new Error('一致性测试还没接 h5 的双指缩放'); },
  async wheel(_b: unknown, o: unknown, dy: number) { const p = center(o); await pw('wheel', p.x, p.y, dy); await wait(50); },
  async key(_b: unknown, name: string) { await pw('key', name); await wait(50); },
  async setScreen(_b: unknown, width: number, height: number) { await pw('viewport', width, height); },
  advance: (_b: unknown, ms: number) => wait(ms),
};
const createBackend = () => {
  const backend = createH5Backend();
  const init = backend.init.bind(backend);
  backend.init = async options => {
    await init({...options, uiBase: '/ui', i18nBase: '/i18n'});
    backend.platform.input.onPointer(event => inputTrace.normalized.push({...event, epoch: performance.timeOrigin + event.time,
      observedEpoch: performance.timeOrigin + performance.now(), scale: stage.scale}));
  };
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
  const html = '<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body{margin:0;height:100%;overflow:hidden;background:#000}</style><body><script type="module" src="/conf.js"></script>';
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/conf.html') res.writeHead(200, {'content-type': 'text/html; charset=utf-8'}).end(html);
    else serveBuilt(ctx.root, url, res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const {screen} = await caseScreen(ctx, name);
  const page = await browser.newPage({viewport: screen, hasTouch: true});
  const trace = {name, nodeTimeOrigin: performance.timeOrigin, protocol: []};
  ctx.h5Trace = trace;
  let captured = false;
  const captureTrace = async () => {
    const browserTrace = await page.evaluate(() => window.__h5InputTrace);
    if (browserTrace) Object.assign(trace, browserTrace);
    else trace.captureError = 'h5 input trace was not initialized';
    captured = true;
  };
  try {
    const errors = [];
    trace.consoleErrors = errors;
    page.on('pageerror', e => errors.push(String(e.message ?? e)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const cdp = await page.context().newCDPSession(page);
    const inputCommand = async (method, params) => {
      const entry = {method, params, sendEpoch: performance.timeOrigin + performance.now()};
      trace.protocol.push(entry);
      try { return await cdp.send(method, params); }
      finally { entry.replyEpoch = performance.timeOrigin + performance.now(); }
    };
    await page.exposeFunction('__pw', async (op, ...a) => {
      // Chromium owns the requested press duration. Separating down/up with a Node
      // timer lets a late driver response turn a 50ms click into a >300ms hold.
      if (op === 'press') {
        await page.mouse.move(a[0], a[1]);
        await inputCommand('Input.synthesizeTapGesture', {x: a[0], y: a[1], duration: a[2], gestureSourceType: a[3] === 'touch' ? 'touch' : 'mouse'});
      }
      else if (op === 'wheel') { await page.mouse.move(a[0], a[1]); await page.mouse.wheel(0, a[2]); }
      else if (op === 'key') await page.keyboard.press(a[0]);
      else if (op === 'viewport') { await page.setViewportSize({width: a[0], height: a[1]}); }
      else if (op === 'touchDrag') {
        const [x, y, dx, dy, ms, steps] = a;
        const before = await page.evaluate(() => ({normalized: window.__h5InputTrace.normalized.length, dom: window.__h5InputTrace.dom.length}));
        const touch = (type, px, py) => inputCommand('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x: px, y: py, id: 1}]});
        const at = (delay, send) => new Promise(resolve => setTimeout(resolve, delay)).then(send);
        // Dispatch exact coordinates at the requested real intervals. CDP replies
        // may precede DOM delivery or arrive late; neither schedules the next point.
        let replied = false, consumed = false, deadline;
        const expired = new Promise((_, reject) => {
          deadline = setTimeout(() => reject(new Error(`h5 触摸输入超时（5000ms）：CDP 应答${replied ? '已完成' : '尚未完成'}；DOM/框架抬起${consumed ? '已消费' : '尚未消费'}。`)), 5000);
        });
        try {
          await Promise.race([expired, Promise.all([
            Promise.all([
              touch('touchStart', x, y),
              ...Array.from({length: steps}, (_, i) => at(ms * (i + 1) / steps,
                () => touch('touchMove', x + dx * (i + 1) / steps, y + dy * (i + 1) / steps))),
              at(ms, () => touch('touchEnd'))
            ]).then(() => { replied = true; }),
            page.waitForFunction(previous => {
              const input = window.__h5InputTrace;
              const events = input.normalized.slice(previous.normalized);
              const down = events.find(event => event.type === 'down' && event.pointerType === 'touch');
              return down && events.some(event => event.type === 'up' && event.pointerId === down.pointerId)
                && input.dom.slice(previous.dom).some(event => event.type === 'pointerup' && event.pointerId === down.pointerId && event.trusted);
            }, before, {timeout: 0}).then(() => { consumed = true; })
          ])]);
        } finally { clearTimeout(deadline); }
      } else throw new Error(`未知操作 ${op}`);
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/conf.html`);
    await page.waitForFunction(() => window.__run, null, {timeout: 15000});
    const result = await page.evaluate(() => window.__run());
    await captureTrace();
    if (errors.length) throw new Error(`h5 页面报错：${errors.join('；')}`);
    return result;
  } catch (error) {
    if (!captured) {
      try { await captureTrace(); }
      catch (captureError) { trace.captureError = String(captureError); }
    }
    throw error;
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
