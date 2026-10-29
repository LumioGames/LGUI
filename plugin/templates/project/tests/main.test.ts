import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';

test('打开主界面，点按钮，标题变成点击次数', async () => {
  const t = await lgui.testing.start(app);
  assert.equal(t.text('Main/MainView.title'), '你好，LGUI');
  await t.click('Main/MainView.button');
  assert.equal(t.text('Main/MainView.title'), '点了 1 次');
  t.end();
});
