// lgui editor 端到端：打开编辑器 → 导入工程的 ui/ → lgui editor props 改按钮标题和文字 → 编辑器里马上变（查询编辑器里的控件确认）。
// 编辑器是 Laya 画布，菜单用坐标点（编辑器版本固定在 plugin/editor/VERSION.md）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {startEditor} from '../../plugin/tools/lib/commands/editor.mjs';
import {readUiModel, findComponent} from '../../plugin/tools/lib/generate/model.mjs';

test('lgui editor：导入 ui/，lgui editor props 改的属性在编辑器里马上生效', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-editor-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const server = await startEditor(root);
  try {
    const page = await browser.newPage({viewport: {width: 1600, height: 900}});
    // 无头浏览器里用不了「选择文件夹」的系统窗口，让编辑器走普通的文件夹选择框
    await page.addInitScript(() => { delete window.showDirectoryPicker; });
    await page.goto(`${server.baseUrl}/?agent=1`);
    await page.waitForFunction(() => window.fairyEditorAgent, null, {timeout: 20000});
    await page.waitForTimeout(2000);
    // 文件 → 从文件夹导入… → 选 ui/ → 导入
    await page.mouse.click(24, 9);
    await page.waitForTimeout(500);
    const chooser = page.waitForEvent('filechooser');
    await page.mouse.click(66, 53);
    await (await chooser).setFiles(path.join(root, 'ui'));
    await page.waitForTimeout(1500);
    await page.mouse.click(196, 250);
    await page.waitForTimeout(2500);

    const json = async argv => JSON.parse((await run([...argv, '--json'], root)).stdout);
    const button = await json(['editor', 'props', 'Main/MainView', 'button', 'title=改过了']);
    assert.equal(button.ok, true, JSON.stringify(button.errors));
    const title = await json(['editor', 'props', 'Main/MainView', 'title', 'text=新标题', 'visible=true']);
    assert.equal(title.ok, true, JSON.stringify(title.errors));
    assert.equal(title.data.revision, button.data.revision + 1);

    // 编辑器里的控件已经是新值
    const component = findComponent(readUiModel(path.join(root, 'ui', 'UI.fairy')), 'Main/MainView');
    const node = name => page.evaluate(selector => window.fairyEditorAgent.request({method: 'query', selector}), {packageId: component.pkg.id, componentResourceId: component.id, displayNodeId: component.children.find(c => c.name === name).id});
    assert.equal((await node('button')).data.entity.instanceProperties.title, '改过了');
    assert.equal((await node('title')).data.entity.text, '新标题');
  } finally {
    await server.close();
    await browser.close();
  }
});
