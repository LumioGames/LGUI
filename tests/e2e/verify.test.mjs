// lgui verify：模板工程截出 12 张图（6 组尺寸 × 2 种方向），每张旁边一份快照；--lang pseudo、--size、--view 能用。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {pseudo} from '../../plugin/tools/lib/commands/verify.mjs';

test('伪翻译：字母换成带重音的、加长 40%、两头加 [ ]，占位符原样保留', () => {
  assert.equal(pseudo('Sold {count} items'), '[Sóld {count} ítéms~~~~~]');
  assert.equal(pseudo('你好'), '[你好~]');
});

test('lgui verify：12 张图、快照里的方向对；--size、--view、--lang pseudo', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  await browser.close();
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-verify-'));
  await run(['init', 'game'], parent);
  const root = path.join(parent, 'game');
  const all = JSON.parse((await run(['verify', '--json'], root)).stdout);
  assert.equal(all.ok, true, JSON.stringify(all.errors));
  assert.equal(all.data.shots.length, 12);
  for (const shot of all.data.shots) {
    assert.ok(fs.statSync(path.join(root, shot.image)).size > 1000, shot.image);
    const snap = JSON.parse(fs.readFileSync(path.join(root, shot.image.replace(/\.png$/, '.json')), 'utf8'));
    assert.equal(snap.orientation, shot.name.endsWith('-portrait') ? 'portrait' : 'landscape', shot.name);
    assert.deepEqual(snap.layers.page, ['MainView']);
  }
  assert.ok(all.data.shots.some(s => s.name === 'phone-portrait-portrait' && s.viewport.width === 390 && s.viewport.height === 844));

  const one = JSON.parse((await run(['verify', '--size', 'desktop', '--view', 'MainView', '--json'], root)).stdout);
  assert.deepEqual(one.data.shots.map(s => s.name), ['desktop-landscape', 'desktop-portrait']);

  const pseudoRun = JSON.parse((await run(['verify', '--size', 'desktop', '--lang', 'pseudo', '--json'], root)).stdout);
  assert.deepEqual(pseudoRun.data.shots.map(s => s.name), ['desktop-landscape-pseudo', 'desktop-portrait-pseudo', 'desktop-landscape-en', 'desktop-portrait-en']);
  const snap = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/verify/desktop-landscape-pseudo.json'), 'utf8'));
  assert.equal(snap.language, 'pseudo');

  const bad = JSON.parse((await run(['verify', '--size', 'tv', '--json'], root)).stdout);
  assert.equal(bad.errors[0].code, 'LGUI-CLI-061');
});
