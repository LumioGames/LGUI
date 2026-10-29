// lgui editor 端到端：编辑器打开时自动从工程的 ui/ 导入 → lgui editor props 改按钮标题和文字 → 编辑器里马上变；
// Agent 改了 ui/ 以后重新打开编辑器，显示的是 ui/ 里的新内容（不是浏览器里的旧副本）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {startEditor} from '../../plugin/tools/lib/commands/editor.mjs';
import {readUiModel, findComponent} from '../../plugin/tools/lib/generate/model.mjs';

// 打开编辑器页面，等它从 ui/ 导入完。
async function openEditor(context, server) {
  const page = await context.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
  page.on('pageerror', e => logs.push(`pageerror: ${e.message}`.slice(0, 300)));
  await page.goto(`${server.baseUrl}/?agent=1`);
  await page.waitForFunction(() => window.fairyEditorAgent, null, {timeout: 20000});
  try {
    // 每次查询最多等 2 秒：导入时编辑器会换一个新的会话，发给旧会话的查询可能永远不回，不能卡在它上面。
    await page.waitForFunction(async () => {
      const timeout = new Promise(resolve => setTimeout(() => resolve(null), 2000));
      const state = await Promise.race([window.fairyEditorAgent.request({method: 'state'}), timeout]);
      return Boolean(state?.ok && state.data.workspace.fairyPath === 'UI.fairy' && state.data.editor.liveSession);
    }, null, {timeout: 120000, polling: 500}); // CI 的机器没有显卡，编辑器导入要慢得多
  } catch (error) {
    // 没导入成功：把编辑器自己的状态、状态栏和页面报错带出来，方便在 CI 上查原因。
    const state = await page.evaluate(() => window.fairyEditorAgent.request({method: 'state'})).catch(e => String(e));
    const status = await page.evaluate(() => [...document.querySelectorAll('[data-fairy-editor-status], [data-fairy-editor-workspace-import]')].map(e => e.outerHTML.slice(0, 200))).catch(() => []);
    throw new Error(`编辑器没有从 ui/ 导入：${error.message}\nstate: ${JSON.stringify(state).slice(0, 2500)}\nattrs: ${JSON.stringify(status)}\nlogs: ${logs.slice(-20).join(' | ')}`);
  }
  await page.waitForTimeout(1000);
  return page;
}

test('lgui editor：打开就是 ui/ 的内容；editor props 马上生效；改了 ui/ 再打开显示新内容', {timeout: 600000}, async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-editor-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const server = await startEditor(root);
  try {
    const context = await browser.newContext({viewport: {width: 1600, height: 900}});
    let page = await openEditor(context, server);
    const component = findComponent(readUiModel(path.join(root, 'ui', 'UI.fairy')), 'Main/MainView');
    const node = name => page.evaluate(selector => window.fairyEditorAgent.request({method: 'query', selector}), {packageId: component.pkg.id, componentResourceId: component.id, displayNodeId: component.children.find(c => c.name === name).id});
    assert.equal((await node('title')).data.entity.text, '你好，LGUI');

    const json = async argv => JSON.parse((await run([...argv, '--json'], root)).stdout);
    const button = await json(['editor', 'props', 'Main/MainView', 'button', 'title=改过了']);
    assert.equal(button.ok, true, JSON.stringify(button.errors));
    const title = await json(['editor', 'props', 'Main/MainView', 'title', 'text=新标题']);
    assert.equal(title.ok, true, JSON.stringify(title.errors));
    assert.equal((await node('button')).data.entity.instanceProperties.title, '改过了');
    assert.equal((await node('title')).data.entity.text, '新标题');

    // Agent 改 ui/，重新打开编辑器（同一个浏览器，浏览器里存着旧副本）
    await page.close();
    const xml = path.join(root, 'ui', 'assets', 'Main', 'MainView.xml');
    fs.writeFileSync(xml, fs.readFileSync(xml, 'utf8').replace('text="你好，LGUI"', 'text="Agent 改过"'));
    page = await openEditor(context, server);
    assert.equal((await node('title')).data.entity.text, 'Agent 改过');
  } finally {
    await server.close();
    await browser.close();
  }
});
