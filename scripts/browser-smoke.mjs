import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import('playwright');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const events = [];
page.on('pageerror', e => events.push({ type: 'pageerror', message: String(e), stack: e.stack }));
page.on('console', e => { if (e.type() === 'error') events.push({ type: 'console', message: e.text() }); });
page.on('response', r => events.push({ type: 'response', url: r.url(), status: r.status() }));
await page.goto('http://127.0.0.1:4179');
try { await page.waitForFunction(() => window.verification?.ready || window.verification?.failure, { timeout: 12000 }); } catch(e) { events.push({ type: 'wait', error: String(e) }); }
await page.waitForTimeout(500);
const state = await page.evaluate(() => ({ verification: window.verification, inspect: window.verification?.inspect(), text: document.body.innerText }));
await page.screenshot({ path: path.join(root, 'evidence/browser-first.png') });
fs.writeFileSync(path.join(root, 'evidence/browser-first.json'), JSON.stringify({ version: browser.version(), state, events }, null, 2));
console.log(JSON.stringify({ state, events }, null, 2));
await browser.close();
