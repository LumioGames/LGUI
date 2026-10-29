import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';
import { {{COMP}}View } from '../src/modules/{{feature}}/{{COMP}}View';

test('{{COMP}}View：打开、操作、旋转', async () => {
  const t = await lgui.testing.start(app);
  await t.open({{COMP}}View);
  assert.equal(t.page('{{PKG}}/{{COMP}}.tabs'), 'first');
  await t.click('{{PKG}}/{{COMP}}.secondTab');
  assert.equal(t.page('{{PKG}}/{{COMP}}.tabs'), 'second');
  await t.setScreen(1080, 1920);
  assert.equal(t.page('{{PKG}}/{{COMP}}.tabs'), 'second');
  t.end();
});
