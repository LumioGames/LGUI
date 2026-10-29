// 端到端测试（单一源）：改同一份 ui/ 标题，网页和 Unity 导出文件都要更新。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {launchBrowser} from '../helpers/browser.mjs';
import {createUnityProject} from '../helpers/unity.mjs';

const cli = fileURLToPath(new URL('../../plugin/tools/lgui.mjs', import.meta.url));

const freePort = () => new Promise(resolve => {
  const s = net.createServer().listen(0, '127.0.0.1', () => { const {port} = s.address(); s.close(() => resolve(port)); });
});

test('单一源：改 ui/ 里的标题文字，网页和 Unity 产物都跟着变', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-e2e-'));
  // 1. lgui init
  const init = spawnSync(process.execPath, [cli, 'init', 'game', '--json'], {cwd: parent, encoding: 'utf8'});
  assert.equal(init.status, 0, init.stdout + init.stderr);
  const root = path.join(parent, 'game');
  // 2. 先导出未改动的 Unity 产物；这里只检查文件，不启动 Unity。
  const unity = createUnityProject(path.join(parent, 'UnityProject'));
  const exportUnity = () => {
    const result = spawnSync(process.execPath, [cli, 'unity', 'export', '--to', unity, '--json'], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(JSON.parse(result.stdout).ok, true, result.stdout);
  };
  exportUnity();
  const unityPackage = path.join(unity, 'Assets/LGUI/Resources/UI/Main_fui.bytes');
  const before = fs.readFileSync(unityPackage);
  // 3. 改同一份标题文字
  const marker = 'E2E-' + randomBytes(4).toString('hex');
  assert.equal(before.includes(Buffer.from(marker)), false);
  const xml = path.join(root, 'ui/assets/Main/MainView.xml');
  fs.writeFileSync(xml, fs.readFileSync(xml, 'utf8').replace('text="你好，LGUI"', `text="${marker}"`));
  // 4. lgui dev --no-open
  const port = await freePort();
  const dev = spawn(process.execPath, [cli, 'dev', '--no-open', '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
  let output = '';
  dev.stdout.on('data', d => { output += d; });
  dev.stderr.on('data', d => { output += d; });
  try {
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('lgui dev 没有在 30 秒内打印预览地址：\n' + output)), 30000);
      dev.stdout.on('data', () => { const m = /预览地址：(http:\/\/127\.0\.0\.1:\d+\/)/.exec(output); if (m) { clearTimeout(timer); resolve(m[1]); } });
      dev.on('exit', code => reject(new Error(`lgui dev 提前退出（${code}）：\n${output}`)));
    });
    assert.equal(url, `http://127.0.0.1:${port}/`);
    // 5. 打开页面，读标题
    const page = await browser.newPage({locale: 'zh-CN'});
    await page.goto(url);
    await page.waitForFunction(() => window.__lguiReady, null, {timeout: 15000});
    const title = await page.evaluate(m => [...document.querySelectorAll('span.fgui-text')].map(s => s.textContent).find(text => text === m) ?? null, marker);
    assert.equal(title, marker);
    if (process.env.LGUI_E2E_SCREENSHOT) await page.screenshot({path: process.env.LGUI_E2E_SCREENSHOT});
  } finally {
    // 6. 关掉服务
    dev.kill();
  }
  // 7. 再导出到同一个 Unity 工程，确认实际 .bytes 更新并带上这次的新文字。
  exportUnity();
  const after = fs.readFileSync(unityPackage);
  assert.notDeepEqual(after, before, '改 ui/ 后，Unity 的 Main_fui.bytes 仍是旧产物');
  assert.ok(after.includes(Buffer.from(marker)), 'Unity 的 Main_fui.bytes 没有本次的新标题');
  } finally {
    await browser.close();
  }
});
