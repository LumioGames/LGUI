// lgui editor 端到端：编辑器打开时自动从工程的 ui/ 导入 → lgui editor props 改按钮标题和文字 → 编辑器里马上变；
// Agent 改了 ui/ 以后重新打开编辑器、或者重启 lgui editor（同一个固定端口）再打开，显示的是 ui/ 里的新内容（不是浏览器里的旧副本）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {startEditor} from '../../plugin/tools/lib/commands/editor.mjs';
import {readUiModel, findComponent} from '../../plugin/tools/lib/generate/model.mjs';

// 每次请求有个上限：导入时编辑器会换一个新的会话，发给旧会话的请求可能永远不回，不能卡在它上面。
// state 很快，最多等 2 秒；query 要把组件整个读出来，CI 的机器没有显卡时一次就可能超过 2 秒，最多等 20 秒。
const ask = (page, request, ms) => page.evaluate(async ({r, ms}) => {
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), ms));
  return Promise.race([window.fairyEditorAgent.request(r), timeout]);
}, {r: request, ms}).catch(() => null);

// 打开编辑器页面，等它从 ui/ 导入完，并且 Main/MainView 的 title 显示的是 expected（浏览器里存着上次的副本时，
// 「已经导入」的条件可能马上就满足，所以一直等到新内容真的出现）。
async function openEditor(context, server, component, expected) {
  const page = await context.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
  page.on('pageerror', e => logs.push(`pageerror: ${e.message}`.slice(0, 300)));
  await page.goto(`${server.baseUrl}/?agent=1`);
  await page.waitForFunction(() => window.fairyEditorAgent, null, {timeout: 20000});
  try {
    const selector = {packageId: component.pkg.id, componentResourceId: component.id, displayNodeId: component.children.find(c => c.name === 'title').id};
    const deadline = Date.now() + 120000; // CI 的机器没有显卡，编辑器导入要慢得多
    for (let last = null; ; await sleep(500)) {
      const state = await ask(page, {method: 'state'}, 2000);
      const ready = state?.ok && state.data.workspace.fairyPath === 'UI.fairy' && state.data.editor.liveSession;
      last = ready ? (await ask(page, {method: 'query', selector}, 20000))?.data?.entity?.text : null;
      if (last === expected) break;
      if (Date.now() > deadline) throw new Error(`等了 120 秒，title 还是 ${JSON.stringify(last)}，不是 ${JSON.stringify(expected)}`);
    }
  } catch (error) {
    // 没导入成功：把编辑器自己的状态、状态栏和页面报错带出来，方便在 CI 上查原因。
    const state = await page.evaluate(() => window.fairyEditorAgent.request({method: 'state'})).catch(e => String(e));
    // 只带导入和状态栏的属性（导入被取消时编辑器写 data-fairy-editor-workspace-import），不带整个 body 的开头。
    const status = await page.evaluate(() => [...document.querySelectorAll('[data-fairy-editor-status], [data-fairy-editor-workspace-import]')]
      .map(e => [...e.attributes].filter(a => /import|status/.test(a.name)).map(a => `${a.name}=${a.value}`).join(' '))).catch(() => []);
    throw new Error(`编辑器没有从 ui/ 导入：${error.message}\nstate: ${JSON.stringify(state).slice(0, 2500)}\nattrs: ${JSON.stringify(status)}\nlogs: ${logs.slice(-20).join(' | ')}`);
  }
  return page;
}

test('lgui editor：打开就是 ui/ 的内容；editor props 马上生效；改了 ui/ 再打开、重启后再打开都显示新内容', {timeout: 600000}, async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-editor-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  let server = await startEditor(root);
  try {
    const context = await browser.newContext({viewport: {width: 1600, height: 900}});
    const component = findComponent(readUiModel(path.join(root, 'ui', 'UI.fairy')), 'Main/MainView');
    let page = await openEditor(context, server, component, '你好，LGUI');
    const node = name => page.evaluate(selector => window.fairyEditorAgent.request({method: 'query', selector}), {packageId: component.pkg.id, componentResourceId: component.id, displayNodeId: component.children.find(c => c.name === name).id});

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
    page = await openEditor(context, server, component, 'Agent 改过');

    // 重启 lgui editor：还是同一个端口（浏览器按来源存的东西还在），再改 ui/，打开显示新内容
    await page.close();
    const {baseUrl} = server;
    await server.close();
    fs.writeFileSync(xml, fs.readFileSync(xml, 'utf8').replace('text="Agent 改过"', 'text="重启以后"'));
    server = await startEditor(root);
    assert.equal(server.baseUrl, baseUrl, '重启后端口不变');
    page = await openEditor(context, server, component, '重启以后');
  } finally {
    await server.close();
    await browser.close();
  }
});
