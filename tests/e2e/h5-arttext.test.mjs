// ArtText 在浏览器里：字符图片按映射加载，摆放位置和 headless 一样。截图存到 LGUI_ARTTEXT_SCREENSHOT（设了才存）。
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

test('h5：ArtText 拼出 +120，位置和 headless 一致，图片都加载成功', async t => {
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
class FxView extends View<any> { static component = 'Bag/Fx'; static layer = 'popup' as const; bind = {damage: {text: '+120'}} as any; }
(async () => {
  const backend = createH5Backend();
  await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
  await boot(backend, {backend: 'h5', start() {}}, defaultConfig, ${JSON.stringify(deps)});
  const view = await lgui.ui.open(FxView);
  Object.assign(window, {view, ready: true});
})().catch(e => { (window as any).failure = String(e); });`);
    await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent', keepNames: true});
    fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#123}</style><body><script type="module" src="/app.js"></script>');
    const server = await serve({'/': path.join(root, 'web')});
    try {
      const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
      const failed = [];
      page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
      await page.goto(server.url + '/index.html');
      await page.waitForFunction(() => window.ready || window.failure, null, {timeout: 15000});
      assert.equal(await page.evaluate(() => window.failure ?? null), null);
      await page.waitForLoadState('networkidle');
      const glyphs = await page.evaluate(() => {
        const damage = window.view.__component.child('damage');
        return damage.native.numChildren;
      });
      assert.equal(glyphs, 4);
      assert.deepEqual(failed, []);
      if (process.env.LGUI_ARTTEXT_SCREENSHOT) await page.screenshot({path: process.env.LGUI_ARTTEXT_SCREENSHOT, clip: {x: 860, y: 460, width: 400, height: 160}});
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
});
