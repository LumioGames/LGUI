// 一致性测试：同一个用例在 headless 和 h5 上跑完，两份快照（数据、控件的文字 / 可见 / 可用、控制器页面、列表项和每项的文字、界面栈）必须完全一样。
import test from 'node:test';
import assert from 'node:assert/strict';
import {launchBrowser} from '../helpers/browser.mjs';
import {cases, conformanceProject, runHeadless, runH5} from './runner.mjs';

let ctx = null;
const project = async () => (ctx ??= await conformanceProject());

for (const name of cases) {
  test(`一致性：${name}`, async t => {
    const browser = await launchBrowser();
    if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
    try {
      const c = await project();
      const headless = await runHeadless(c, name);
      const h5 = await runH5(c, name, browser);
      assert.deepEqual(h5, headless);
    } finally {
      await browser.close();
    }
  });
}
