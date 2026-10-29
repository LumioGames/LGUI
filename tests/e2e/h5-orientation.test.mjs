// 横竖屏在浏览器里：窗口从横变竖，背包换成竖版，选中项和滚动位置都还在，onOpen 只调用一次。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFixture} from '../helpers/fixture.mjs';
import {serve, launchBrowser} from '../helpers/browser.mjs';
import {generateWeb, generateProjectTypes} from '../../plugin/tools/lib/generate/index.mjs';
import {esbuild} from '../../plugin/tools/lib/vendor.mjs';

const fw = fileURLToPath(new URL('../../plugin/framework', import.meta.url));

test('h5：旋转换版，选中项保留，onOpen 只调用一次', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
    const root = writeFixture();
    await generateWeb(path.join(root, 'ui/UI.fairy'), path.join(root, 'web/ui'));
    const {deps} = await generateProjectTypes(root);
    const entry = path.join(root, 'entry.ts');
    const f = rel => JSON.stringify(path.join(fw, rel));
    fs.writeFileSync(entry, `import {createH5Backend} from ${f('backends/h5/index.ts')};
import {boot} from ${f('mvc/boot.ts')};
import {defaultConfig} from ${f('mvc/runtime.ts')};
import {lgui, View, ItemView, pick} from ${f('index.ts')};
const bag = lgui.Model({items: Array.from({length: 30}, (_, i) => ({id: 'i' + i, count: i})), selected: 'i4'});
const log = {open: 0, orientation: [] as string[]};
class SlotView extends ItemView<any, any> { static component = 'Bag/ItemSlot'; bind = {count: {text: (it: any) => String(it.count)}} as any; }
class BagView extends View<any> {
  static component = 'Bag/BagPanel'; static layer = 'page' as const; static fullScreen = true;
  bind = {list: {items: pick(bag, s => s.items), item: SlotView, key: (it: any) => it.id, selected: pick(bag, s => s.selected)}} as any;
  onOpen() { log.open++; }
  onOrientationChange(o: string) { log.orientation.push(o); }
}
(async () => {
  const backend = createH5Backend();
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
  await boot(backend, {backend: 'h5', start() {}}, defaultConfig, ${JSON.stringify(deps)}, {language: 'zh-CN', texts: {'zh-CN': {'lgui.back': '返回', 'lgui.requestFailed': '请求失败（{code}）'}}});
  const view = await lgui.ui.open(BagView);
  Object.assign(window, {lgui, view, log, ready: true});
})().catch(e => { (window as any).failure = String(e); });`);
    await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent'});
    fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0}</style><body><script type="module" src="/app.js"></script>');
    const server = await serve({'/': path.join(root, 'web')});
    try {
      const page = await browser.newPage({viewport: {width: 1280, height: 720}});
      await page.goto(server.url + '/index.html');
      await page.waitForFunction(() => window.ready || window.failure, null, {timeout: 15000});
      assert.equal(await page.evaluate(() => window.failure ?? null), null);
      assert.equal(await page.evaluate(() => window.view.__component.componentName), 'Bag/BagPanel');
      await page.setViewportSize({width: 720, height: 1280});
      await page.waitForFunction(() => window.view.__component.componentName === 'Bag/BagPanel@portrait', null, {timeout: 5000});
      const state = await page.evaluate(() => ({selected: window.view.__component.child('list').selectedIndex, log: window.log, snap: window.lgui.debug.snapshot().orientation}));
      assert.deepEqual(state, {selected: 4, log: {open: 1, orientation: ['portrait']}, snap: 'portrait'});
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
});
