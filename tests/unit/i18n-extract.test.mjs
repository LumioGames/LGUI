import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './cli/helpers.mjs';

async function project() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-i18n-'));
  assert.equal((await run(['init', 'game'], parent)).code, 0);
  return path.join(parent, 'game');
}

test('lgui i18n extract：提取固定文字到默认语言的文本表，已有的保留，新增的追加，ui/ 里没了的只报告', async () => {
  const root = await project();
  const zh = path.join(root, 'i18n/zh-CN.json');
  const first = JSON.parse((await run(['i18n', 'extract', '--json'], root)).stdout);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  const table = JSON.parse(fs.readFileSync(zh, 'utf8'));
  assert.equal(table['Main/MainView/title'], '你好，LGUI');
  assert.equal(table['Main/MainView/button'], '点我');
  assert.equal(table['Common/Confirm/ok'], '确定');
  assert.equal(table['main.hint'], '点下面的按钮试试', '代码里用的键不动');
  // 改过的翻译保留，再提取一次不新增
  table['Main/MainView/title'] = '改过的';
  fs.writeFileSync(zh, JSON.stringify(table));
  const second = JSON.parse((await run(['i18n', 'extract', '--json'], root)).stdout);
  assert.deepEqual([second.data.added, JSON.parse(fs.readFileSync(zh, 'utf8'))['Main/MainView/title']], [[], '改过的']);
  // 删掉标题控件：键只报告，不删
  for (const f of ['MainView.xml', 'MainView@portrait.xml']) {
    const xml = path.join(root, 'ui/assets/Main', f);
    fs.writeFileSync(xml, fs.readFileSync(xml, 'utf8').replace(/<text id="n1" name="title"[\s\S]*?<\/text>\n/, ''));
  }
  const third = JSON.parse((await run(['i18n', 'extract', '--json'], root)).stdout);
  assert.deepEqual(third.data.stale, ['Main/MainView/title']);
  assert.ok('Main/MainView/title' in JSON.parse(fs.readFileSync(zh, 'utf8')));
});

test('翻译文件：名字是 <包ID><组件ID>-<元素ID>，竖版和横版共用一个键；对照表写进 .lgui/build/i18n/map.json', async () => {
  const root = await project();
  await run(['i18n', 'extract'], root);
  const en = path.join(root, 'i18n/en.json');
  fs.writeFileSync(en, JSON.stringify({...JSON.parse(fs.readFileSync(en, 'utf8')), 'Main/MainView/button': 'Click me'}));
  await run(['i18n', 'extract'], root);
  const xml = fs.readFileSync(path.join(root, '.lgui/build/web/i18n/en.xml'), 'utf8');
  assert.match(xml, /<string name="main0001mainvw01-n2">Click me<\/string>/);
  assert.match(xml, /<string name="main0001mainvw02-n2">Click me<\/string>/);
  const map = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/i18n/map.json'), 'utf8'));
  assert.deepEqual(map['Main/MainView/button'], ['main0001mainvw01-n2', 'main0001mainvw02-n2']);
});

test('运行时切换语言（headless，lgui test）：固定文字、lgui.t 文字都变；数据保留', async () => {
  const root = await project();
  await run(['i18n', 'extract'], root);
  const en = path.join(root, 'i18n/en.json');
  fs.writeFileSync(en, JSON.stringify({...JSON.parse(fs.readFileSync(en, 'utf8')), 'Main/MainView/button': 'Click me', 'Main/MainView/title': 'Hello'}));
  fs.writeFileSync(path.join(root, 'tests/lang.test.ts'), `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';

test('中文 → 英文', async () => {
  const t = await lgui.testing.start(app);
  await t.click('Main/MainView.button');
  assert.equal(t.text('Main/MainView.status'), '点了 1 次');
  await t.setLanguage('en');
  assert.equal(t.text('Main/MainView.title'), 'Hello');
  assert.equal(t.text('Main/MainView.button'), 'Click me');
  assert.equal(t.text('Main/MainView.status'), 'Clicked 1 times');
  assert.equal(t.snapshot().language, 'en');
  await assert.rejects(t.setLanguage('fr'), (e: unknown) => (e as { code: string }).code === 'LGUI-RT-140');
  t.end();
});
`);
  const result = await run(['test', '--json'], root);
  const json = JSON.parse(result.stdout);
  assert.equal(json.ok, true, JSON.stringify(json.errors, null, 1));
  assert.equal(json.data.passed, 2);
});
