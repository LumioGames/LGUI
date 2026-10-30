// lgui verify：模板工程截出 8 张图（6 组尺寸 × 2 种方向，去掉 4 张重复的画面），每张旁边一份快照，按尺寸模拟安全区；--lang pseudo、--size、--view 能用。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';
import {launchBrowser} from '../helpers/browser.mjs';
import {pseudo, verifyShots} from '../../plugin/tools/lib/commands/verify.mjs';
import {defaultVerifySizes} from '../../plugin/tools/lib/project.mjs';

test('伪翻译：字母换成带重音的、加长 40%、两头加 [ ]，占位符原样保留', () => {
  assert.equal(pseudo('Sold {count} items'), '[Sóld {count} ítéms~~~~~]');
  assert.equal(pseudo('你好'), '[你好~]');
});

test('要截的图：同一个画面只截一次；安全区按尺寸本来的方向用，转到另一个方向时四边跟着转', () => {
  const shots = verifyShots(defaultVerifySizes);
  assert.deepEqual(shots.map(s => `${s.size.name}-${s.orientation} ${s.viewport.width}x${s.viewport.height}`), [
    'desktop-landscape 1920x1080', 'desktop-portrait 1080x1920', 'ultrawide-landscape 2560x1080', 'ultrawide-portrait 1080x2560',
    'phone-landscape-landscape 844x390', 'tablet-landscape 1024x768', 'phone-portrait-portrait 390x844', 'tablet-portrait-portrait 768x1024'
  ]);
  const insets = name => shots.find(s => `${s.size.name}-${s.orientation}` === name).safeArea;
  assert.deepEqual(insets('phone-landscape-landscape'), {top: 0, right: 47, bottom: 21, left: 47});
  assert.deepEqual(insets('phone-portrait-portrait'), {top: 47, right: 0, bottom: 34, left: 0});
  assert.deepEqual(insets('desktop-portrait'), {top: 0, right: 0, bottom: 0, left: 0});
  // 只截一组手机横屏：竖屏那张没有重复，安全区跟着转（左边的刘海转到上边）
  const one = verifyShots([defaultVerifySizes[2]]);
  assert.deepEqual(one.map(s => [s.orientation, s.safeArea]), [['landscape', {top: 0, right: 47, bottom: 21, left: 47}], ['portrait', {top: 47, right: 0, bottom: 47, left: 21}]]);
});

test('lgui verify：8 张图、快照里的方向对、按尺寸设了安全区；--size、--view、--lang pseudo', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  await browser.close();
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-verify-'));
  await run(['init', 'game'], parent);
  const root = path.join(parent, 'game');
  const all = JSON.parse((await run(['verify', '--json'], root)).stdout);
  assert.equal(all.ok, true, JSON.stringify(all.errors));
  assert.equal(all.data.shots.length, 8);
  assert.equal(new Set(all.data.shots.map(s => `${s.viewport.width}x${s.viewport.height}`)).size, 8, '没有重复的画面');
  for (const shot of all.data.shots) {
    assert.ok(fs.statSync(path.join(root, shot.image)).size > 1000, shot.image);
    const snap = JSON.parse(fs.readFileSync(path.join(root, shot.image.replace(/\.png$/, '.json')), 'utf8'));
    assert.equal(snap.orientation, shot.name.endsWith('-portrait') ? 'portrait' : 'landscape', shot.name);
    assert.deepEqual(snap.layers.page, ['MainView']);
  }
  assert.ok(all.data.shots.some(s => s.name === 'phone-portrait-portrait' && s.viewport.width === 390 && s.viewport.height === 844));
  assert.deepEqual(all.data.shots.find(s => s.name === 'phone-landscape-landscape').safeArea, {top: 0, right: 47, bottom: 21, left: 47});

  const one = JSON.parse((await run(['verify', '--size', 'desktop', '--view', 'MainView', '--json'], root)).stdout);
  assert.deepEqual(one.data.shots.map(s => s.name), ['desktop-landscape', 'desktop-portrait']);

  const pseudoRun = JSON.parse((await run(['verify', '--size', 'desktop', '--lang', 'pseudo', '--json'], root)).stdout);
  assert.deepEqual(pseudoRun.data.shots.map(s => s.name), ['desktop-landscape-pseudo', 'desktop-portrait-pseudo', 'desktop-landscape-en', 'desktop-portrait-en']);
  const snap = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/verify/desktop-landscape-pseudo.json'), 'utf8'));
  assert.equal(snap.language, 'pseudo');

  const bad = JSON.parse((await run(['verify', '--size', 'tv', '--json'], root)).stdout);
  assert.equal(bad.errors[0].code, 'LGUI-CLI-061');
});
