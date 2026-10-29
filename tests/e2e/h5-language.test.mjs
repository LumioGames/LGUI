// 切换语言在浏览器里：lgui dev 预览 → lgui.setLanguage('en') → 固定文字（翻译文件）和 lgui.t 文字都变，界面重建后还能点。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {startDev} from '../../plugin/tools/lib/dev/index.mjs';
import {readProject} from '../../plugin/tools/lib/project.mjs';

test('h5：中文 → 英文，固定文字和代码文字都变', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-lang-'));
    await run(['init', 'game'], parent);
    const root = path.join(parent, 'game');
    await run(['i18n', 'extract'], root);
    const en = path.join(root, 'i18n/en.json');
    fs.writeFileSync(en, JSON.stringify({...JSON.parse(fs.readFileSync(en, 'utf8')), 'Main/MainView/title': 'Hello', 'Main/MainView/button': 'Click me'}));
    const server = await startDev(root, readProject(root), {port: 0});
    try {
      const page = await browser.newPage({locale: 'zh-CN'});
      await page.goto(server.url);
      await page.waitForFunction(() => window.__lguiReady, null, {timeout: 15000});
      await page.waitForFunction(() => document.body.innerText.includes('你好，LGUI'));
      await page.evaluate(() => window.__lgui.lgui.setLanguage('en'));
      await page.waitForFunction(() => ['Hello', 'Click me', 'Try the button below'].every(s => document.body.innerText.includes(s)), null, {timeout: 5000});
      const box = await page.evaluate(() => { const el = [...document.querySelectorAll('span.fgui-text')].find(e => e.textContent === 'Click me'); const r = el.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
      await page.mouse.click(box.x, box.y);
      await page.waitForFunction(() => document.body.innerText.includes('Clicked 1 times'), null, {timeout: 5000});
      assert.equal(await page.evaluate(() => window.__lgui.snapshot().language), 'en');
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
});
