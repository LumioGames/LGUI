// h5 后端的新控件和细节（真实浏览器）：控件类型、下拉框选中序号统一成 -1、输入法选字时不通知、
// 不可用的控件在 FairyGUI 重新挂元素以后仍然收不到指针、滚轮只给落点所在的控件。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFixture} from '../helpers/fixture.mjs';
import {writeControls} from '../conformance/controls.mjs';
import {serve, launchBrowser} from '../helpers/browser.mjs';
import {generateWeb} from '../../plugin/tools/lib/generate/index.mjs';
import {esbuild} from '../../plugin/tools/lib/vendor.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const h5 = path.join(repo, 'plugin/framework/backends/h5');

test('h5 后端：新控件、下拉框选中序号、输入法、不可用、滚轮落点', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  const root = writeFixture();
  writeControls(root, {buttonId: 'cbtn0001'});
  await generateWeb(path.join(root, 'ui/UI.fairy'), path.join(root, 'web/ui'));
  const entry = path.join(root, 'entry.ts');
  fs.writeFileSync(entry, `import {createH5Backend} from ${JSON.stringify(path.join(h5, 'index.ts'))};
    (async () => {
    const backend = createH5Backend();
    await backend.init({projectName: 'demo', defaultFont: null, uiBase: '/ui'});
    await backend.loadPackage('Common');
    await backend.loadPackage('Controls');
    backend.platform.screen.applyDesignSize({width: 1920, height: 1080});
    const panel = backend.create('Controls', 'ControlsPanel');
    backend.root.addChild(panel);
    Object.assign(window, {backend, panel, ready: true});
    })().catch(error => { window.failure = String(error); });`);
  await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', target: 'es2020', outfile: path.join(root, 'web/app.js'), logLevel: 'silent'});
  fs.writeFileSync(path.join(root, 'web/index.html'), '<!doctype html><meta charset="utf-8"><style>body{margin:0}</style><body><script type="module" src="/app.js"></script>');
  const server = await serve({'/': path.join(root, 'web')});
  try {
    const page = await browser.newPage({viewport: {width: 960, height: 540}});
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(server.url + '/index.html');
    await page.waitForFunction(() => window.ready || window.failure, null, {timeout: 15000});
    assert.equal(await page.evaluate(() => window.failure ?? null), null);

    const kinds = await page.evaluate(() => {
      const {panel} = window;
      const combo = panel.child('mode');
      combo.items = ['a', 'b', 'c'];
      const afterItems = [combo.selectedIndex, combo.text];
      combo.selectedIndex = 2; combo.items = ['x'];
      return {
        slider: [panel.child('volume').value, panel.child('volume').min, panel.child('volume').max],
        label: panel.child('badge').title, playing: panel.child('spin').playing, tree: panel.child('tree').numItems,
        afterItems, shrink: [combo.selectedIndex, combo.text],
        shown: ['simpleText', 'extraButton', 'lockedText'].map(n => panel.child(n).shown)
      };
    });
    assert.deepEqual(kinds, {slider: [50, 0, 100], label: '徽章', playing: true, tree: 0, afterItems: [-1, ''], shrink: [-1, ''], shown: [true, false, false]});

    // 输入法：选字期间的 input 不通知，compositionend 通知一次，之后浏览器补发的同一段文字的 input 跳过。
    const composed = await page.evaluate(() => {
      const input = window.panel.child('nameInput');
      const calls = [];
      input.onChange(text => calls.push(text));
      const el = input.native.element, box = el.htmlInput;
      el.dispatchEvent(new CompositionEvent('compositionstart', {bubbles: true}));
      box.value = 'ni'; box.dispatchEvent(new InputEvent('input', {bubbles: true, isComposing: true}));
      box.value = '你'; box.dispatchEvent(new InputEvent('input', {bubbles: true, isComposing: true}));
      box.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true}));
      box.dispatchEvent(new InputEvent('input', {bubbles: true}));
      box.value = '你好'; box.dispatchEvent(new InputEvent('input', {bubbles: true}));
      return calls;
    });
    assert.deepEqual(composed, ['你', '你好']);

    // 不可用：FairyGUI 把元素重新挂上去（换层、齿轮切换）以后仍然不接收指针。
    const pointer = await page.evaluate(() => {
      const button = window.panel.child('lockButton');
      button.enabled = false;
      const native = button.native, parent = native.parent;
      parent.removeChild(native); parent.addChild(native);
      const off = getComputedStyle(native.element).pointerEvents;
      button.enabled = true;
      return [off, getComputedStyle(native.element).pointerEvents, button.enabled, button.touchable];
    });
    assert.equal(pointer[0], 'none');
    assert.notEqual(pointer[1], 'none');
    assert.deepEqual(pointer.slice(2), [true, true]);

    // 滚轮：只有落点所在的控件（和它的上级）收到，坐标是设计尺寸。
    await page.evaluate(() => {
      window.wheels = [];
      const {panel} = window;
      panel.child('lockButton').onWheel(e => window.wheels.push(['lock', Math.round(e.x), Math.round(e.y), e.deltaY]));
      panel.child('fullButton').onWheel(() => window.wheels.push(['full']));
    });
    // lockButton 在设计尺寸 (60,740) 240×72，屏幕缩放 0.5：中心在 (90, 388)。
    await page.mouse.move(90, 388);
    await page.mouse.wheel(0, 100);
    await page.waitForFunction(() => window.wheels.length > 0);
    assert.deepEqual(await page.evaluate(() => window.wheels), [['lock', 180, 776, 100]]);
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await server.close();
    await browser.close();
  }
});
