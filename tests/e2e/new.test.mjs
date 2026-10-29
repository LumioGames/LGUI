// lgui new：四种排布模式各生成一个模块，lgui check 没有错误、lgui test 跑通骨架自带的测试、lgui verify 横竖两张截图正常。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';

const PATTERNS = {split: 'MsplitPanelView', tabs: 'MtabsPanelView', grid: 'MgridPanelView', dialog: 'MdialogDialogView'};

test('lgui new module --pattern：四种模式生成后 check、test、verify 都通过', async t => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-new-'));
  await run(['init', 'game'], parent);
  const root = path.join(parent, 'game');
  for (const pattern of Object.keys(PATTERNS)) {
    const r = JSON.parse((await run(['new', 'module', `m${pattern}`, '--pattern', pattern, '--json'], root)).stdout);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.ok(r.data.ui.some(f => f.endsWith('@portrait.xml')), `${pattern} 要有竖版`);
  }
  const check = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.deepEqual(check.data.findings.map(f => `${f.code} ${f.file}:${f.line} ${f.message}`), []);
  const tests = JSON.parse((await run(['test', '--json'], root)).stdout);
  assert.equal(tests.ok, true, JSON.stringify(tests.errors));
  assert.deepEqual(tests.data.failed, []);
  assert.ok(tests.data.passed >= 5);

  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  await browser.close();
  for (const view of Object.values(PATTERNS)) {
    const v = JSON.parse((await run(['verify', '--size', 'desktop', '--view', view, '--json'], root)).stdout);
    assert.equal(v.ok, true, JSON.stringify(v.errors));
    assert.deepEqual(v.data.shots.map(s => s.name), ['desktop-landscape', 'desktop-portrait']);
    for (const shot of v.data.shots) {
      const snap = JSON.parse(fs.readFileSync(path.join(root, shot.image.replace(/\.png$/, '.json')), 'utf8'));
      assert.ok(Object.values(snap.layers).flat().includes(view), `${shot.name} 里应该打开了 ${view}：${JSON.stringify(snap.layers)}`);
    }
  }
});
