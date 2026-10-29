// lgui i18n extract：横竖两版共用的键，原文明确取横版的文字，和 package.xml 里谁先登记无关；两版的字不一样时 lgui check 警告。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './helpers.mjs';

test('竖版先登记、两版的字不一样：原文还是横版的，lgui check 警告 LGUI-UI-063', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-i18n-order-'));
  assert.equal((await run(['init', 'g'], parent)).code, 0);
  const root = path.join(parent, 'g');
  const pkg = path.join(root, 'ui/assets/Main/package.xml');
  const text = fs.readFileSync(pkg, 'utf8');
  const landscape = /\n\s*<component id="mainvw01"[^>]*\/>/.exec(text)[0];
  const portrait = /\n\s*<component id="mainvw02"[^>]*\/>/.exec(text)[0];
  fs.writeFileSync(pkg, text.replace(landscape, '').replace(portrait, portrait + landscape));
  assert.ok(fs.readFileSync(pkg, 'utf8').indexOf('mainvw02') < fs.readFileSync(pkg, 'utf8').indexOf('mainvw01'), '竖版先登记');
  const xml = path.join(root, 'ui/assets/Main/MainView@portrait.xml');
  fs.writeFileSync(xml, fs.readFileSync(xml, 'utf8').replace('text="你好，LGUI"', 'text="竖版的字"'));

  const r = JSON.parse((await run(['i18n', 'extract', '--json'], root)).stdout);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'i18n/zh-CN.json'), 'utf8'))['Main/MainView/title'], '你好，LGUI');
  const warned = JSON.parse((await run(['check', '--json'], root)).stdout).data.findings.filter(f => f.code === 'LGUI-UI-063');
  assert.equal(warned.length, 1);
  assert.equal(warned[0].file, 'ui/assets/Main/MainView@portrait.xml');
  assert.match(warned[0].message, /横版「你好，LGUI」，竖版「竖版的字」/);
});
