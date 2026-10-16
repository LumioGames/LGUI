import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import('playwright');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const cdp = await page.context().newCDPSession(page);
const result = { version: browser.version(), method: 'forced GC; 450ms settle; API driven lifecycle, no click latency claims', samples: [], errors: [] };
page.on('pageerror', e => result.errors.push(String(e)));
await page.goto('http://127.0.0.1:4179'); await page.waitForFunction(() => window.verification?.ready);
let previous = 0;
for (const cycles of [0, 20, 40, 80, 160]) {
  for (let i = previous; i < cycles; i++) { await page.evaluate(() => { window.verification.close(); window.verification.open(); }); await page.waitForTimeout(25); }
  await page.waitForTimeout(450); await cdp.send('HeapProfiler.collectGarbage');
  result.samples.push({ cycles, heap: await cdp.send('Runtime.getHeapUsage'), dom: await cdp.send('Memory.getDOMCounters'), app: await page.evaluate(() => window.verification.inspect()) });
  previous = cycles;
}
await page.evaluate(() => { window.verification.close(); window.verification.progress(); });
await page.waitForTimeout(500); await cdp.send('HeapProfiler.collectGarbage');
result.closed = { heap: await cdp.send('Runtime.getHeapUsage'), dom: await cdp.send('Memory.getDOMCounters'), app: await page.evaluate(() => ({ ...window.verification.inspect(), metrics: window.verification.metrics })) };
fs.writeFileSync(path.join(root, 'evidence/lifecycle-soak.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
