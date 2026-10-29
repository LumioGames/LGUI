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
  await page.goto(`${server.baseUrl}/?agent=1`);
  await page.waitForFunction(() => window.fairyEditorAgent, null, {timeout: 20000});
  await page.waitForFunction(async () => {
    const state = await window.fairyEditorAgent.request({method: 'state'});
    return state.ok && state.data.workspace.fairyPath === 'UI.fairy' && state.data.editor.liveSession;
  }, null, {timeout: 30000, polling: 500});
  await page.waitForTimeout(1000);
  return page;
}

test('lgui editor：打开就是 ui/ 的内容；editor props 马上生效；改了 ui/ 再打开显示新内容', async t => {
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
