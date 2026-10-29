// lgui new view / new module：生成的文件、ID、登记、文本表；名字和模式写错、目标已存在时报错不覆盖。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './helpers.mjs';

const fresh = async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-new-'));
  assert.equal((await run(['init', 'g'], parent)).code, 0);
  return path.join(parent, 'g');
};
const json = async (argv, root) => JSON.parse((await run([...argv, '--json'], root)).stdout);
const codes = r => r.errors.map(e => e.code);

test('new view：新包里生成横竖两版和子项，登记进 package.xml，ID 是 8 位', async () => {
  const root = await fresh();
  const r = await json(['new', 'view', 'Shop/ShopPanel', '--pattern', 'grid'], root);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.deepEqual(r.data.ui, ['ui/assets/Shop/ShopPanel.xml', 'ui/assets/Shop/ShopPanel@portrait.xml', 'ui/assets/Shop/ShopPanelItem.xml']);
  assert.deepEqual(r.data.code, ['src/modules/shop/ShopPanelView.ts', 'src/modules/shop/ShopPanelItemView.ts']);
  const pkg = fs.readFileSync(path.join(root, 'ui/assets/Shop/package.xml'), 'utf8');
  const pkgId = /packageDescription id="([^"]+)"/.exec(pkg)[1];
  assert.match(pkgId, /^[a-z0-9]{8}$/);
  const ids = [...pkg.matchAll(/<component id="([^"]+)" name="([^"]+)"/g)].map(m => [m[2], m[1]]);
  assert.deepEqual(ids.map(([n]) => n), ['ShopPanel.xml', 'ShopPanel@portrait.xml', 'ShopPanelItem.xml']);
  for (const [, id] of ids) assert.match(id, /^[a-z0-9]{8}$/);
  assert.equal(new Set(ids.map(([, id]) => id)).size, 3);
  // 列表的 defaultItem 指向新的子项组件
  assert.ok(fs.readFileSync(path.join(root, 'ui/assets/Shop/ShopPanel.xml'), 'utf8').includes(`defaultItem="ui://${pkgId}${ids[2][1]}"`));
  // 新的固定文字补进了每种语言的文本表
  const en = JSON.parse(fs.readFileSync(path.join(root, 'i18n/en.json'), 'utf8'));
  assert.ok(Object.values(en).includes('关闭'), '英文表里先填原文，等翻译');
  assert.ok(r.data.translate.every(k => k.startsWith('en: ')));
  assert.deepEqual((await json(['check'], root)).data.findings, []);
});

test('new view：已有的包里追加组件，包 ID 不变', async () => {
  const root = await fresh();
  const before = /packageDescription id="([^"]+)"/.exec(fs.readFileSync(path.join(root, 'ui/assets/Main/package.xml'), 'utf8'))[1];
  assert.equal((await json(['new', 'view', 'Main/MainDialog', '--pattern', 'dialog'], root)).ok, true);
  const pkg = fs.readFileSync(path.join(root, 'ui/assets/Main/package.xml'), 'utf8');
  assert.ok(pkg.includes(`id="${before}"`));
  assert.ok(pkg.includes('name="MainView.xml"') && pkg.includes('name="MainDialog@portrait.xml"'));
  assert.deepEqual((await json(['check'], root)).data.findings, []);
});

test('new module 不带 --pattern：只生成 Model、Controller 和测试', async () => {
  const root = await fresh();
  const r = await json(['new', 'module', 'bag'], root);
  assert.deepEqual(r.data.code, ['src/modules/bag/BagModel.ts', 'src/modules/bag/BagController.ts', 'tests/bag.test.ts']);
  assert.deepEqual(r.data.ui, []);
  assert.deepEqual((await json(['check'], root)).data.findings, []);
});

test('报错：模式不存在、名字写法不对、目标已存在（不覆盖）', async () => {
  const root = await fresh();
  assert.deepEqual(codes(await json(['new', 'view', 'Shop/ShopPanel', '--pattern', 'carousel'], root)), ['LGUI-CLI-090']);
  assert.deepEqual(codes(await json(['new', 'view', 'Shop/ShopPanel'], root)), ['LGUI-CLI-090']);
  assert.deepEqual(codes(await json(['new', 'view', 'shop-panel', '--pattern', 'tabs'], root)), ['LGUI-CLI-093']);
  assert.deepEqual(codes(await json(['new', 'module', 'Bag'], root)), ['LGUI-CLI-093']);
  assert.equal((await json(['new', 'view', 'Main/MainView', '--pattern', 'tabs'], root)).errors[0].code, 'LGUI-CLI-091');
  const view = path.join(root, 'src/modules/main/MainView.ts');
  const text = fs.readFileSync(view, 'utf8');
  assert.equal((await json(['new', 'module', 'main', '--pattern', 'tabs'], root)).errors[0].code, 'LGUI-CLI-091');
  assert.equal(fs.readFileSync(view, 'utf8'), text);
  assert.ok(!fs.existsSync(path.join(root, 'ui/assets/Main/MainPanel.xml')), '报错时不能留下一半文件');
});
