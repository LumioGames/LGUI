// h5 每帧回调出错：错误报到页面上（未捕获的错误），但别的回调和以后的帧照常跑——
// 一个界面的定时器出错，不能让全部定时器、lgui.time.wait、请求超时、旋转换版都停掉。
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

test('h5：一个定时器回调出错、另一个每帧都出错，别的定时器和 lgui.time.wait 照常完成，错误报到页面上', async t => {
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
import {lgui, View} from ${f('index.ts')};
const log = {fired: 0, later: 0, waited: false};
// 先打开：每帧都出错（它的每帧回调登记在最前面）。
class SpinView extends View<any> { static component = 'Bag/BagPanel'; static layer = 'page' as const; static fullScreen = true; static bothOrientations = true;
  onOpen() { this.onUpdate(() => { throw new Error('spin'); }); } }
class ThrowView extends View<any> { static component = 'Bag/ItemSlot'; static layer = 'popup' as const;
  onOpen() { this.after(50, () => { log.fired++; throw new Error('boom'); }); this.after(300, () => { log.later++; }); } }
(async () => {
  const backend = createH5Backend();
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
  await boot(backend, {backend: 'h5', start() {}}, defaultConfig, ${JSON.stringify(deps)});
  await lgui.ui.open(SpinView);
  await lgui.ui.open(ThrowView);
  await lgui.time.wait(500);
  log.waited = true;
  lgui.ui.close(SpinView);
  Object.assign(window, {result: log});
})().catch(e => { (window as any).failure = String(e); });`);
    await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent'});
    fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0}</style><body><script type="module" src="/app.js"></script>');
    const server = await serve({'/': path.join(root, 'web')});
    try {
      const page = await browser.newPage({viewport: {width: 1280, height: 720}});
      const errors = new Set();
      page.on('pageerror', e => errors.add(e.message));
      await page.goto(server.url + '/index.html');
      await page.waitForFunction(() => window.result || window.failure, null, {timeout: 20000});
      assert.equal(await page.evaluate(() => window.failure ?? null), null);
      assert.deepEqual(await page.evaluate(() => window.result), {fired: 1, later: 1, waited: true});
      assert.deepEqual([...errors].sort(), ['boom', 'spin']);
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
});
