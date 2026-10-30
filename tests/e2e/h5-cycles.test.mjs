// 网页端反复开关 200 次（S2-K2 第 17 条）：界面快照里的包引用数、监听数、定时器数都回到 0，模型上的订阅归零。
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

test('h5：全屏界面 + 弹窗反复开关 200 次，引用数、监听数、定时器数都回到 0', async t => {
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
import {listenerCount} from ${f('mvc/model.ts')};
import {lgui, View, ItemView, pick} from ${f('index.ts')};
const bag = lgui.Model({gold: 1, items: Array.from({length: 20}, (_, i) => ({id: 'i' + i, count: i}))});
class SlotView extends ItemView<any, any> { static component = 'Bag/ItemSlot'; bind = {count: {text: (it: any) => String(it.count)}} as any; }
class BagView extends View<any> {
  static component = 'Bag/BagPanel'; static layer = 'page' as const; static fullScreen = true;
  bind = {gold: {text: pick(bag, s => String(s.gold))}, list: {items: pick(bag, s => s.items), item: SlotView, key: (it: any) => it.id}} as any;
  onOpen() { this.every(100, () => {}); this.on(lgui.events.languageChange, () => {}); }
}
class DetailView extends View<any> { static component = 'Bag/ItemSlot'; static layer = 'popup' as const; onOpen() { this.after(5000, () => {}); } }
(async () => {
  const backend = createH5Backend();
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
  await boot(backend, {backend: 'h5', start() {}}, defaultConfig, ${JSON.stringify(deps)}, {language: 'zh-CN', texts: {'zh-CN': {'lgui.back': '返回', 'lgui.requestFailed': '请求失败（{code}）'}}});
  let peak = 0;
  for (let i = 0; i < 200; i++) {
    await lgui.ui.open(BagView);
    await lgui.ui.open(DetailView);
    peak = Math.max(peak, lgui.debug.snapshot().views.reduce((n, v) => n + v.listeners + v.timers, 0));
    lgui.ui.close(DetailView);
    lgui.ui.close(BagView);
  }
  Object.assign(window, {result: {snapshot: lgui.debug.snapshot(), modelListeners: listenerCount(bag), peak}});
})().catch(e => { (window as any).failure = String(e); });`);
    await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent'});
    fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0}</style><body><script type="module" src="/app.js"></script>');
    const server = await serve({'/': path.join(root, 'web')});
    try {
      const page = await browser.newPage({viewport: {width: 1280, height: 720}});
      await page.goto(server.url + '/index.html');
      await page.waitForFunction(() => window.result || window.failure, null, {timeout: 120000});
      assert.equal(await page.evaluate(() => window.failure ?? null), null);
      const {snapshot, modelListeners, peak} = await page.evaluate(() => window.result);
      assert.ok(peak > 0, '开着的时候确实有监听和定时器');
      assert.deepEqual({views: snapshot.views, packages: snapshot.packages, modelListeners}, {views: [], packages: [], modelListeners: 0});
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
});
