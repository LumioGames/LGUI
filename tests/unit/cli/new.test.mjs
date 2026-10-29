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
// 新界面的固定文字在别的语言里先填的是原文：lgui check 只给「还没翻」的警告（LGUI-UI-062），没有别的
const onlyUntranslated = async root => {
  const findings = (await json(['check'], root)).data.findings;
  assert.deepEqual(findings.filter(f => f.code !== 'LGUI-UI-062'), []);
  assert.ok(findings.every(f => f.level === 'warning' && f.file === 'i18n/en.json'));
  return findings;
};

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
  assert.equal((await onlyUntranslated(root)).length, r.data.translate.length);
  // 全屏界面两版都有 safe，贴边的控件关联到它
  for (const f of ['ShopPanel.xml', 'ShopPanel@portrait.xml']) {
    const xml = fs.readFileSync(path.join(root, 'ui/assets/Shop', f), 'utf8');
    const id = /<graph id="(n\d+)" name="safe"/.exec(xml)?.[1];
    assert.ok(id, `${f} 里要有 safe`);
    assert.match(xml, new RegExp(`name="closeButton"[^>]*>\\s*<relation target="${id}" sidePair="right-right,top-top"/>`));
  }
});

test('new view：已有的包里追加组件，包 ID 不变', async () => {
  const root = await fresh();
  const before = /packageDescription id="([^"]+)"/.exec(fs.readFileSync(path.join(root, 'ui/assets/Main/package.xml'), 'utf8'))[1];
  assert.equal((await json(['new', 'view', 'Main/MainDialog', '--pattern', 'dialog'], root)).ok, true);
  const pkg = fs.readFileSync(path.join(root, 'ui/assets/Main/package.xml'), 'utf8');
  assert.ok(pkg.includes(`id="${before}"`));
  assert.ok(pkg.includes('name="MainView.xml"') && pkg.includes('name="MainDialog@portrait.xml"'));
  await onlyUntranslated(root);
  assert.ok(!fs.readFileSync(path.join(root, 'ui/assets/Main/MainDialog.xml'), 'utf8').includes('name="safe"'), '弹窗不是全屏界面，不要 safe');
});

test('new module 不带 --pattern：只生成 Model、Controller 和测试', async () => {
  const root = await fresh();
  const r = await json(['new', 'module', 'bag'], root);
  assert.deepEqual(r.data.code, ['src/modules/bag/BagModel.ts', 'src/modules/bag/BagController.ts', 'tests/bag.test.ts']);
  assert.deepEqual(r.data.ui, []);
  assert.deepEqual((await json(['check'], root)).data.findings, []);
  const model = fs.readFileSync(path.join(root, 'src/modules/bag/BagModel.ts'), 'utf8');
  assert.ok(!/tab/i.test(model) && !/tab/i.test(fs.readFileSync(path.join(root, 'src/modules/bag/BagController.ts'), 'utf8')), '没有标签页的模块不带 tab');
});

test('new module 的代码里不写死用户能看到的文字：子项用文本键，键补进每种语言的文本表；只有 tabs 模式带标签页', async () => {
  const root = await fresh();
  for (const pattern of ['split', 'tabs']) assert.equal((await json(['new', 'module', pattern === 'split' ? 'bag' : 'shop', '--pattern', pattern], root)).ok, true);
  const cjk = /[\u4e00-\u9fff]/;
  for (const f of ['bag/BagModel.ts', 'bag/BagPanelItemView.ts', 'bag/BagPanelView.ts', 'bag/BagController.ts', 'shop/ShopModel.ts']) assert.ok(!cjk.test(fs.readFileSync(path.join(root, 'src/modules', f), 'utf8').replace(/\/\/.*$/gm, '')), `${f} 里写死了中文`);
  assert.match(fs.readFileSync(path.join(root, 'src/modules/bag/BagPanelItemView.ts'), 'utf8'), /lgui\.t\('bag\.item'/);
  for (const lang of ['zh-CN', 'en']) assert.equal(JSON.parse(fs.readFileSync(path.join(root, `i18n/${lang}.json`), 'utf8'))['bag.item'], '第 {n} 项');
  assert.ok(!/tab/i.test(fs.readFileSync(path.join(root, 'src/modules/bag/BagModel.ts'), 'utf8')));
  assert.match(fs.readFileSync(path.join(root, 'src/modules/shop/ShopModel.ts'), 'utf8'), /switchTab/);
  assert.match(fs.readFileSync(path.join(root, 'src/modules/shop/ShopController.ts'), 'utf8'), /switchTab/);
  await onlyUntranslated(root);
  const tests = await json(['test'], root);
  assert.equal(tests.ok, true, JSON.stringify(tests.errors));
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
