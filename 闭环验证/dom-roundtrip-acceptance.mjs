import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const here = path.dirname(fileURLToPath(import.meta.url));
const publish = JSON.parse(fs.readFileSync(path.join(here, 'roundtrip-final/publish-report.json')));
const results = [];
for (const name of ['chrome', 'edge']) {
  const browser = await chromium.launch({ headless: true, executablePath: name === 'chrome' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const result = { browser: name, version: browser.version(), checks: [], errors: [], requests: [], sourceArchiveSha256: publish.archiveSha256 };
  page.on('pageerror', e => result.errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') result.errors.push(msg.text()); });
  page.on('response', res => result.requests.push({ url: res.url(), status: res.status() }));
  const check = (name, value) => { result.checks.push({ name, pass: !!value }); assert.ok(value, name); };
  try {
    await page.goto('http://127.0.0.1:4181'); await page.waitForFunction(() => window.verification?.ready);
    await page.waitForTimeout(450);
    check('saved browser title reaches real DOM package', await page.locator('[data-testid="title"]').innerText() === publish.title.text);
    const color = await page.locator('[data-testid="title"] .fgui-text').evaluate(el => getComputedStyle(el).color);
    check('saved browser color reaches DOM', color === 'rgb(141, 240, 196)');
    check('actual DOM stage without preview engine container', await page.locator('.fgui-stage').count() === 1 && await page.locator('canvas,iframe').count() === 0);
    check('same source controller, transition and virtual list', await page.evaluate(() => { const s = window.verification.inspect(); return s.controller === 'locked' && s.transition && s.rowNodes === 7; }));
    await page.screenshot({ path: path.join(here, `evidence/roundtrip-${name}-wide.png`) });
    await page.locator('[data-item-id="item-1"] [data-testid="claim"]').click();
    check('shared business claim still works after editor save', await page.evaluate(() => window.verification.snapshot().coins === 10 && window.verification.inspect().popup));
    await page.screenshot({ path: path.join(here, `evidence/roundtrip-${name}-reward.png`) });
    await page.locator('[data-testid="confirm"]').click();
    await page.locator('[data-testid="search"]').fill('药水');
    check('Chinese filter retains shared logic', await page.evaluate(() => window.verification.snapshot().visible.length === 10));
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(120);
    const box = await page.locator('[data-testid="inventory"]').boundingBox();
    check('narrow layout remains in viewport', box.x >= 0 && box.x + box.width <= 390);
    await page.screenshot({ path: path.join(here, `evidence/roundtrip-${name}-narrow.png`) });
    await page.locator('[data-testid="close"]').click(); await page.locator('#launch').click();
    check('close/reopen preserves rewards with one subscription', await page.evaluate(() => window.verification.snapshot().coins === 10 && window.verification.inspect().listenerCount === 1));
    check('no unexplained console or resource failures', result.errors.length === 0 && result.requests.every(r => r.status < 400));
    check('network remains independent of excluded engines', result.requests.every(r => r.url.startsWith('http://127.0.0.1:4181/')) && result.requests.every(r => !/unity|laya|cocos/i.test(r.url)));
    result.passed = true;
  } catch (error) { result.passed = false; result.failure = { message: String(error), stack: error.stack }; }
  finally { await context.close(); await browser.close(); results.push(result); }
}
fs.writeFileSync(path.join(here, 'evidence/dom-roundtrip.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(x => ({ browser: x.browser, passed: x.passed, checks: x.checks, failure: x.failure })), null, 2));
if (results.some(x => !x.passed)) process.exitCode = 1;
