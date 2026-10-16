import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import('playwright');
const channel = process.env.BROWSER || 'chrome';
const executablePath = channel === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordHar: { path: path.join(root, `evidence/${channel}-network.har`), content: 'omit' } });
const page = await context.newPage();
const report = { browser: channel, version: browser.version(), mode: 'headless installed desktop browser; unminified runtime ES module; local no-store HTTP; no mobile device', errors: [], requests: [], checks: [], memory: [], perf: [] };
page.on('pageerror', error => report.errors.push({ type: 'pageerror', message: String(error) }));
page.on('console', msg => { if (msg.type() === 'error') report.errors.push({ type: 'console', message: msg.text() }); });
page.on('response', res => report.requests.push({ url: res.url(), status: res.status() }));
const check = (name, value) => { report.checks.push({ name, pass: !!value }); assert.ok(value, name); };
const read = () => page.evaluate(() => ({ state: window.verification.snapshot(), inspect: window.verification.inspect(), metrics: window.verification.metrics, packageMs: window.verification.packageMs, readyMs: window.verification.readyMs, lastOpenMs: window.verification.lastOpenMs }));
const ready = async () => { await page.waitForFunction(() => window.verification?.ready); await page.waitForTimeout(400); };
try {
  await page.goto('http://127.0.0.1:4179'); await ready();
  let data = await read();
  check('real FairyGUI DOM stage, no canvas container', await page.locator('.fgui-stage').count() === 1 && await page.evaluate(() => !!window.fguiStage?.is_stage) && await page.locator('canvas,iframe').count() === 0);
  check('three states and native controller', data.state.items[0].state === 'locked' && data.state.items[1].state === 'ready' && data.state.items[2].state === 'claimed' && data.inspect.controller === 'locked');
  check('virtual list creates fewer rows than total', data.inspect.rowNodes < data.state.items.length);
  check('published transition exists', data.inspect.transition);
  await page.screenshot({ path: path.join(root, `evidence/${channel}-wide.png`) });
  await page.locator('[data-item-id="item-1"] [data-testid="claim"]').click();
  check('click claims once and opens reward', (await read()).state.coins === 10 && (await read()).inspect.popup);
  await page.screenshot({ path: path.join(root, `evidence/${channel}-reward.png`) });
  await page.locator('[data-testid="confirm"]').click();
  check('confirm closes popup', !(await read()).inspect.popup);
  await page.locator('[data-testid="update"]').click();
  check('UI progress promotes locked items', (await read()).state.items[0].state === 'ready');
  await page.locator('[data-testid="search"]').fill('药水');
  await page.waitForTimeout(80);
  check('Chinese text input filters names', (await read()).state.visible.length === 10);
  // CDP produces browser composition events, but does not exercise a real OS IME candidate window.
  const cdp = await context.newCDPSession(page);
  await page.locator('[data-testid="search"]').fill('');
  await page.locator('[data-testid="search"]').focus();
  await cdp.send('Input.imeSetComposition', { text: '旅行', selectionStart: 2, selectionEnd: 2 });
  const during = await read();
  await cdp.send('Input.insertText', { text: '旅行' });
  await page.waitForTimeout(80);
  data = await read();
  report.composition = { duringVisible: during.state.visible.length, afterVisible: data.state.visible.length, events: data.metrics.compositionEvents, limitation: 'CDP composition only; physical OS Chinese IME untested' };
  check('composition defers filtering until commit', during.state.visible.length === 30 && data.state.visible.length === 10 && data.metrics.compositionEvents.includes('end'));
  await page.locator('[data-testid="search"]').fill('');
  await page.locator('[data-testid="list"]').hover();
  await page.mouse.wheel(0, 700); await page.waitForTimeout(250);
  check('real wheel scroll changes list position', (await read()).inspect.scrollY > 0);
  report.scrollLatencyMs = (await read()).metrics.scrollLatencyMs;
  const listBox = await page.locator('[data-testid="list"]').boundingBox();
  let recycledId;
  for (const candidate of await page.locator('[data-testid="claim"][aria-disabled="false"]').all()) {
    const rect = await candidate.boundingBox();
    if (rect && rect.y > listBox.y + 5 && rect.y + rect.height < listBox.y + listBox.height) {
      recycledId = await candidate.evaluate(el => el.closest('[data-item-id]').dataset.itemId);
      await candidate.click(); break;
    }
  }
  const recycled = await read();
  check('recycled virtual row claims its current item ID', recycledId && recycled.state.items.find(x => x.id === recycledId)?.state === 'claimed' && recycled.state.coins === 20 && recycled.inspect.popup);
  report.recycledRowClaim = { id: recycledId, coins: recycled.state.coins };
  await page.locator('[data-testid="confirm"]').click();
  await page.locator('[data-testid="reward"]').click();
  const popup = page.locator('[data-testid="popup"]');
  const box = await popup.boundingBox();
  await page.mouse.move(box.x + 10, box.y + 70); await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 100, { steps: 10 }); await page.mouse.up();
  const afterDrag = await popup.boundingBox();
  report.drag = { before: box, after: afterDrag, eventCount: (await read()).metrics.dragEnds };
  check('FairyGUI drag moves popup', Math.abs(afterDrag.x - box.x) > 5);
  await page.locator('[data-testid="confirm"]').click();
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(150);
  const narrow = await page.locator('[data-testid="inventory"]').boundingBox();
  check('narrow inventory fits viewport', narrow.x >= 0 && narrow.x + narrow.width <= 390 && narrow.y + narrow.height <= 844);
  await page.screenshot({ path: path.join(root, `evidence/${channel}-narrow.png`) });
  await page.locator('[data-testid="reward"]').click();
  await page.screenshot({ path: path.join(root, `evidence/${channel}-narrow-reward.png`) });
  await page.locator('[data-testid="confirm"]').click();
  await page.locator('[data-testid="close"]').click();
  check('close releases business subscription', (await read()).inspect.listenerCount === 0);
  await page.evaluate(() => window.verification.progress());
  check('no business callback after disposal', (await read()).metrics.closedCallbacks === 0);
  await page.locator('#launch').click();
  check('reopen preserves business rewards', (await read()).state.coins === 20 && (await read()).inspect.listenerCount === 1);
  const memory = async label => {
    await cdp.send('HeapProfiler.collectGarbage');
    report.memory.push({ label, heap: await cdp.send('Runtime.getHeapUsage'), dom: await cdp.send('Memory.getDOMCounters'), app: (await read()).inspect });
  };
  await memory('before20cycles');
  for (let i = 0; i < 20; i++) { await page.evaluate(() => { window.verification.close(); window.verification.open(); }); await page.waitForTimeout(40); }
  await memory('after20cycles');
  await page.waitForTimeout(900);
  await memory('afterSettledGC');
  data = await read(); report.lifecycle = data;
  check('20 cycles retain one subscription and one view', data.inspect.listenerCount === 1 && data.metrics.opened - data.metrics.closed === 1 && data.metrics.closedCallbacks === 0);
  check('no console errors or HTTP failures', report.errors.length === 0 && report.requests.every(r => r.status < 400));
  check('all runtime requests local and no excluded engines', report.requests.every(r => r.url.startsWith('http://127.0.0.1:4179/')) && report.requests.every(r => !/unity|laya|cocos|webgl/i.test(r.url)));
  // Cold browser-context navigation; separate samples, one desktop machine. Lists virtualize.
  if (process.env.PERF !== '0') for (const count of [30, 300, 3000]) {
    for (let sample = 0; sample < 3; sample++) {
      const perfContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const perfPage = await perfContext.newPage();
      await perfPage.goto(`http://127.0.0.1:4179/?count=${count}`);
      await perfPage.waitForFunction(() => window.verification?.ready);
      const alphaStart = await perfPage.locator('[data-testid="inventory"]').evaluate(el => Number(getComputedStyle(el).opacity));
      await perfPage.waitForTimeout(400);
      const result = await perfPage.evaluate(() => ({ readyMs: window.verification.readyMs, assetsAndTwoFramesMs: window.verification.assetsAndTwoFramesMs, paints: performance.getEntriesByType('paint').map(e => ({ name: e.name, ms: e.startTime })), packageMs: window.verification.packageMs, firstOpenMs: window.verification.lastOpenMs, inspect: window.verification.inspect(), firstRenderMs: window.verification.metrics.renders[0] }));
      const actionStart = performance.now();
      await perfPage.locator('[data-testid="update"]').click();
      await perfPage.waitForFunction(() => window.verification.snapshot().items[0].state === 'ready');
      result.automationRoundtripMs = performance.now() - actionStart;
      result.updateRenderMs = await perfPage.evaluate(() => window.verification.metrics.renders.at(-1));
      await perfPage.locator('[data-item-id="item-1"] [data-testid="claim"]').click();
      await perfPage.waitForTimeout(50);
      result.claimToNextFrameMs = await perfPage.evaluate(() => window.verification.metrics.lastClaimMs);
      result.alphaStart = alphaStart;
      result.alphaAfter = await perfPage.locator('[data-testid="inventory"]').evaluate(el => Number(getComputedStyle(el).opacity));
      report.perf.push({ count, sample, ...result });
      await perfContext.close();
    }
  }
} catch (error) {
  report.failure = { message: String(error), stack: error.stack };
  await page.screenshot({ path: path.join(root, `evidence/${channel}-failure.png`) });
} finally {
  fs.writeFileSync(path.join(root, `evidence/${channel}-acceptance.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.failure || { checks: report.checks, memory: report.memory, perf: report.perf }, null, 2));
  await context.close(); await browser.close();
}
if (report.failure) process.exitCode = 1;
