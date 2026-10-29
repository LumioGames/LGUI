// h5 后端：类型检查，以及在浏览器里跑的端到端测试（缩放、多点输入、尺寸变化、对象包装）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {typecheck} from '../helpers/ts.mjs';
import {writeFixture} from '../helpers/fixture.mjs';
import {serve, launchBrowser} from '../helpers/browser.mjs';
import {generateWeb} from '../../plugin/tools/lib/generate/index.mjs';
import {esbuild} from '../../plugin/tools/lib/vendor.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const h5 = path.join(repo, 'plugin/framework/backends/h5');

test('h5 后端在 strict 下类型检查通过', () => {
  const files = ['index.ts', 'scale.ts', 'objects/index.ts', 'platform/index.ts'].map(f => path.join(h5, f));
  assert.deepEqual(typecheck(files, {lib: ['es2020', 'dom', 'dom.iterable']}), []);
});

async function page(browser, size) {
  const root = writeFixture();
  await generateWeb(path.join(root, 'ui/UI.fairy'), path.join(root, 'web/ui'));
  const entry = path.join(root, 'entry.ts');
  fs.writeFileSync(entry, `import {createH5Backend} from ${JSON.stringify(path.join(h5, 'index.ts'))};
    (async () => {
    const backend = createH5Backend();
    await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
    await backend.loadPackage('Common');
    await backend.loadPackage('Bag');
    const visible = backend.platform.screen.applyDesignSize({width: 1920, height: 1080});
    const panel = backend.create('Bag', 'BagPanel');
    backend.root.addChild(panel);
    Object.assign(window, {backend, panel, visible, ready: true});
    })().catch(error => { window.failure = String(error); });`);
  await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent'});
  fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0}</style><body><script type="module" src="/app.js"></script>');
  const server = await serve({'/': path.join(root, 'web')});
  const context = await browser.newContext({viewport: size, hasTouch: true});
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(server.url + '/index.html');
  const close = async () => { await context.close(); await server.close(); };
  try {
    await p.waitForFunction(() => window.ready || window.failure, null, {timeout: 15000});
    assert.equal(await p.evaluate(() => window.failure ?? null), null);
    assert.deepEqual(errors, []);
  } catch (error) {
    await close();
    throw error;
  }
  return {p, close};
}

test('h5 后端：缩放、对象包装、控制器和列表事件', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
  const {p, close} = await page(browser, {width: 960, height: 1080});
  try {
    // 960×1080 的屏幕放 1920×1080 的设计：缩放 0.5，设计尺寸下可见区域 1920×2160（多出的高度交给关联）。
    assert.deepEqual(await p.evaluate(() => window.visible), {x: 0, y: 0, width: 1920, height: 2160});
    assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.style.transform).map(e => e.style.transform)), ['scale(0.5)']);
    const result = await p.evaluate(async () => {
      const {panel} = window;
      const out = {};
      out.component = panel.componentName;
      out.names = panel.childNames();
      const gold = panel.child('gold'); gold.text = '1,234'; gold.color = '#ff0000';
      out.gold = [gold.text, gold.color];
      out.nested = panel.child('header.count').text;
      out.topBar = panel.child('topBar').componentName;
      const tabs = panel.controller('tabs'); const pages = [];
      const off = tabs.onChange(page => pages.push(page)); tabs.selectedPage = 'item'; off(); tabs.selectedPage = 'equip';
      out.pages = [tabs.pages, pages];
      try { tabs.selectedPage = 'shop'; } catch (e) { out.badPage = e.code; }
      const list = panel.child('list'); const rendered = [];
      list.virtual = true;
      list.itemRenderer = (i, item) => { item.child('count').text = String(i + 1); rendered.push(item.componentName); };
      list.numItems = 5;
      out.list = [list.numItems, list.itemAt(2).child('count').text, rendered[0]];
      const sell = panel.child('sellButton'); sell.title = '卖'; sell.enabled = false;
      out.button = [sell.title, sell.enabled];
      return out;
    });
    assert.equal(result.component, 'Bag/BagPanel');
    assert.deepEqual(result.names, ['gold', 'sellButton', 'list', 'header', 'topBar']);
    assert.deepEqual(result.gold, ['1,234', '#ff0000']);
    assert.equal(result.nested, '0');
    assert.equal(result.topBar, 'Common/CurrencyBar');
    assert.deepEqual(result.pages, [['equip', 'item'], ['item']]);
    assert.equal(result.badPage, 'LGUI-RT-022');
    assert.deepEqual(result.list, [5, '3', 'Bag/ItemSlot']);
    assert.deepEqual(result.button, ['卖', false]);
  } finally {
    await close();
  }
  } finally {
    await browser.close();
  }
});

test('h5 后端：多点指针按设计坐标上报，尺寸变化会通知', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
  const {p, close} = await page(browser, {width: 960, height: 540});
  try {
    await p.evaluate(() => {
      window.pointers = []; window.sizes = [];
      window.backend.platform.input.onPointer(e => window.pointers.push([e.type, e.pointerId, e.pointerType, Math.round(e.x), Math.round(e.y)]));
      window.backend.platform.screen.onResize(s => window.sizes.push([s.width, s.height]));
    });
    // 两个手指同时按下（CDP 多点触摸）
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 100, y: 50, id: 1}, {x: 300, y: 200, id: 2}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await p.mouse.click(480, 270);
    await p.setViewportSize({width: 540, height: 960});
    await p.waitForFunction(() => window.sizes.length > 0);
    const {pointers, sizes} = await p.evaluate(() => ({pointers: window.pointers, sizes: window.sizes}));
    const downs = pointers.filter(e => e[0] === 'down');
    const touchDowns = downs.filter(e => e[2] === 'touch');
    assert.equal(new Set(touchDowns.map(e => e[1])).size, 2, JSON.stringify(pointers));
    // 960×540 放 1920×1080：缩放 0.5，屏幕 (100,50) → 设计 (200,100)
    assert.ok(touchDowns.some(e => e[3] === 200 && e[4] === 100), JSON.stringify(touchDowns));
    assert.ok(downs.some(e => e[2] === 'mouse' && e[3] === 960 && e[4] === 540), JSON.stringify(downs));
    assert.deepEqual(sizes.at(-1), [540, 960]);
  } finally {
    await close();
  }
  } finally {
    await browser.close();
  }
});
