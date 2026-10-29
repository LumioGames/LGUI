// lgui check：每条规则一对样例。不通过：在新工程上改一处，应该报这个错误码；通过：新工程本身（或改对以后）不报。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';

const fresh = async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-check-'));
  assert.equal((await run(['init', 'g'], parent)).code, 0);
  return path.join(parent, 'g');
};
const edit = (root, file, from, to) => {
  const full = path.join(root, file);
  const text = fs.readFileSync(full, 'utf8');
  assert.ok(typeof from === 'string' ? text.includes(from) : from.test(text), `${file} 里找不到 ${from}`);
  fs.writeFileSync(full, text.replace(from, to));
};
const write = (root, file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), text); };
const codes = async root => {
  const json = JSON.parse((await run(['check', '--json'], root)).stdout);
  return json.data ? json.data.findings.map(f => f.code) : json.errors.map(e => e.code);
};
const VIEW = 'src/modules/main/MainView.ts';
const CTRL = 'src/modules/main/MainController.ts';
const MAIN_XML = 'ui/assets/Main/MainView.xml';
const MAIN_PKG = 'ui/assets/Main/package.xml';

const cases = {
  'LGUI-UI-001': {fail: r => edit(r, MAIN_PKG, 'id="main0001"', 'id="Main"')},
  'LGUI-UI-002': {fail: r => edit(r, MAIN_PKG, 'id="mainvw02"', 'id="mainvw01"')},
  'LGUI-UI-003': {fail: r => edit(r, MAIN_XML, '<text id="n3"', '<text id="n2"')},
  'LGUI-UI-004': {fail: r => edit(r, MAIN_XML, 'name="status"', 'name="Status"')},
  'LGUI-UI-005': {fail: r => edit(r, MAIN_XML, '<displayList>', '<controller name="title" pages="0,a,1,b" selected="0"/>\n  <displayList>')},
  'LGUI-UI-006': {fail: r => edit(r, MAIN_PKG, 'name="MainView@portrait.xml"', 'name="MainView@tall.xml"') || fs.renameSync(path.join(r, 'ui/assets/Main/MainView@portrait.xml'), path.join(r, 'ui/assets/Main/MainView@tall.xml'))},
  'LGUI-UI-007': {fail: r => edit(r, 'ui/assets/Main/MainView@portrait.xml', 'name="status"', 'name="state"')},
  'LGUI-UI-009': {fail: r => edit(r, 'ui/assets/Common/Confirm.xml', 'name="cancel" src="button01"', 'name="cancel" src="nope0001"')},
  'LGUI-UI-010': {fail: r => edit(r, MAIN_XML, /(name="title"[^>]*?) autoSize="shrink"/, '$1')},
  'LGUI-UI-011': {fail: r => edit(r, MAIN_XML, 'fontSize="64"', 'fontSize="14"')},
  'LGUI-UI-012': {fail: r => edit(r, VIEW, "button: { click: () => mainController.click() },", "button: { click: () => mainController.click(), redDot: 'main' },")},
  'LGUI-UI-013': {fail: r => edit(r, MAIN_XML, '</displayList>', '  <component id="n9" name="damage" fileName="ArtText.xml" pkg="cmn00001" src="arttext1" xy="0,0" size="200,40" customData="font=dmg"/>\n  </displayList>')},
  'LGUI-UI-014': {fail: r => edit(r, 'ui/assets/Common/Confirm.xml', 'name="ok"', 'name="yes"')},
  'LGUI-UI-015': {fail: r => edit(r, 'ui/assets/Common/package.xml', 'name="placeholder.png" path="/"', 'name="placeholder.png" path="/" scale="9grid"')},
  'LGUI-UI-016': {fail: r => edit(r, MAIN_XML, '</displayList>', '  <list id="n9" name="items" xy="0,0" size="100,100"/>\n  </displayList>')},
  'LGUI-UI-017': {fail: r => { fs.copyFileSync(path.join(r, 'ui/assets/Common/placeholder.png'), path.join(r, 'ui/assets/Common/logo@fr.png')); edit(r, 'ui/assets/Common/package.xml', '</resources>', '  <image id="logo0001" name="logo@fr.png" path="/" exported="true"/>\n  </resources>'); }},
  'LGUI-UI-018': {fail: r => fs.copyFileSync(path.join(r, 'ui/assets/Common/placeholder.png'), path.join(r, 'ui/assets/Main/stray.png'))},
  'LGUI-UI-019': {fail: r => { edit(r, MAIN_PKG, 'name="MainView.xml" path="/" exported="true"', 'name="MainView.xml" path="/"'); edit(r, MAIN_PKG, 'name="MainView@portrait.xml" path="/" exported="true"', 'name="MainView@portrait.xml" path="/"'); }},
  'LGUI-UI-020': {fail: r => edit(r, MAIN_XML, 'pkg="cmn00001" src="button01"', 'fileName="Button.xml" pkg="cmn00001" src="button01"'), warning: true},
  'LGUI-UI-030': {fail: r => edit(r, 'i18n/en.json', /\s*"main\.hint": "[^"]*",/, '')},
  'LGUI-UI-031': {fail: r => edit(r, 'i18n/en.json', '{', '{\n  "nope.unused": "x",'), warning: true},
  'LGUI-UI-032': {fail: r => edit(r, 'i18n/en.json', 'Clicked {count} times', 'Clicked {n} times')},
  'LGUI-MVC-001': {fail: r => edit(r, CTRL, 'click() { mainModel.addClick(); }', 'click() { mainModel.addClick(); document.title = "x"; }')},
  'LGUI-MVC-002': {fail: r => edit(r, VIEW, "  static layer = 'page' as const;\n", '')},
  'LGUI-MVC-003': {fail: r => edit(r, VIEW, "  static fullScreen = true;", "  static fullScreen = true;\n  static cache = true;")},
  'LGUI-MVC-004': {fail: r => edit(r, VIEW, "static layer = 'page' as const;", "static layer = 'dialog' as const;")},
  'LGUI-MVC-005': {fail: r => edit(r, VIEW, '    button: {', "    nope: { visible: true },\n    button: {")},
  'LGUI-MVC-006': {fail: r => edit(r, VIEW, 'button: { click:', 'button: { label: 1, click:')},
  'LGUI-MVC-007': {fail: r => edit(r, VIEW, "    button: {", "    title: { visible: mainModel.get().clicks > 0 },\n    button: {")},
  'LGUI-MVC-008': {fail: r => edit(r, VIEW, 'click: () => mainController.click()', 'click: () => { console.log(1); }')},
  'LGUI-MVC-009': {fail: r => edit(r, VIEW, "  keys: Keys = { back: 'none' };", "  keys: Keys = { back: 'none' };\n  onOpen() { mainModel.addClick(); }")},
  'LGUI-MVC-010': {fail: r => edit(r, VIEW, "  keys: Keys = { back: 'none' };", "  keys: Keys = { back: 'none' };\n  onOpen() { lgui.service<object>('x'); }")},
  'LGUI-MVC-011': {fail: r => edit(r, CTRL, "click() { mainModel.addClick(); }", "click() { mainModel.addClick(); void lgui.ui.get(MainView)?.__component; }") || edit(r, CTRL, "import { Controller } from 'lgui';", "import { Controller, lgui } from 'lgui';\nimport { MainView } from './MainView';")},
  'LGUI-MVC-012': {fail: r => edit(r, 'src/modules/main/MainModel.ts', "import { lgui } from 'lgui';", "import { lgui } from 'lgui';\nimport './MainView';")},
  'LGUI-MVC-013': {fail: r => write(r, 'src/modules/main/MainService.ts', "import { lgui } from 'lgui';\nexport class RealMainService { ping() { lgui.toast('main.hint'); } }\n")},
  'LGUI-MVC-014': {fail: r => edit(r, CTRL, "click() { mainModel.addClick(); }", "click() { mainModel.addClick(); lgui.toast('已售出'); }") || edit(r, CTRL, "import { Controller } from 'lgui';", "import { Controller, lgui } from 'lgui';")},
  'LGUI-MVC-015': {fail: r => edit(r, VIEW, "  keys: Keys = { back: 'none' };", "  keys: Keys = { back: 'none' };\n  onOpen() { this.ui.title.rect = { x: 0, y: 0, width: 10, height: 10 }; }")},
  'LGUI-MVC-016': {
    fail: r => { edit(r, MAIN_PKG, /\s*<component id="mainvw02"[^>]*\/>/, ''); fs.rmSync(path.join(r, 'ui/assets/Main/MainView@portrait.xml')); },
    pass: r => { edit(r, MAIN_PKG, /\s*<component id="mainvw02"[^>]*\/>/, ''); fs.rmSync(path.join(r, 'ui/assets/Main/MainView@portrait.xml')); edit(r, VIEW, '  static fullScreen = true;', '  static fullScreen = true;\n  static bothOrientations = true;'); }
  },
  'LGUI-MVC-017': {fail: r => write(r, 'src/helpers.ts', 'export const x = 1;\n')},
  'LGUI-MVC-018': {fail: r => write(r, 'src/modules/main/OtherView.ts', "import { View, lgui } from 'lgui';\nimport { MainView } from './MainView';\nexport class OtherView extends View<object> { static component = 'Main/MainView'; static layer = 'popup' as const; onOpen() { void lgui.ui.get(MainView)?.__component; } }\n"), warning: true},
  'LGUI-MVC-019': {fail: r => edit(r, VIEW, "keys: Keys = { back: 'none' };", "keys: Keys = { back: 'none', confirm: { do: () => mainController.click(), hint: '出售' } };")}
};

test('新建的工程检查通过：没有任何错误和警告', async () => {
  assert.deepEqual(await codes(await fresh()), []);
});

for (const [code, c] of Object.entries(cases)) {
  test(`${code}：不通过的样例报这个错误码${c.pass ? '；改对以后不报' : ''}`, async () => {
    const root = await fresh();
    c.fail(root);
    const found = await codes(root);
    assert.ok(found.includes(c.code ?? code), `应该报 ${c.code ?? code}，实际：${found.join(', ')}`);
    if (c.pass) {
      const ok = await fresh();
      c.pass(ok);
      assert.ok(!(await codes(ok)).includes(code), '改对以后不应该再报');
    }
  });
}

test('LGUI-UI-017：带字图片放在图片控件里（不会随语言换）报错', async () => {
  const root = await fresh();
  fs.copyFileSync(path.join(root, 'ui/assets/Common/placeholder.png'), path.join(root, 'ui/assets/Common/placeholder@en.png'));
  edit(root, 'ui/assets/Common/package.xml', '</resources>', '  <image id="placehd2" name="placeholder@en.png" path="/" exported="true"/>\n  </resources>');
  assert.ok(!(await codes(root)).includes('LGUI-UI-017'), '只有图片、没有用到时不报');
  edit(root, 'ui/assets/Common/Toast.xml', '</displayList>', '  <image id="n9" name="pic" src="placehd1" xy="0,0" size="32,32"/>\n  </displayList>');
  assert.ok((await codes(root)).includes('LGUI-UI-017'));
});

test('LGUI-UI-031：用模板字符串或条件表达式拼的键算用到了', async () => {
  const root = await fresh();
  for (const lang of ['zh-CN', 'en']) edit(root, `i18n/${lang}.json`, '{', '{\n  "main.tip.a": "A",\n  "main.tip.b": "B",\n  "main.yes": "Y",\n  "main.no": "N",');
  edit(root, CTRL, 'click() { mainModel.addClick(); }', "click() { mainModel.addClick(); lgui.toast(`main.tip.${mainModel.get().clicks % 2 ? 'a' : 'b'}`); lgui.toast(mainModel.get().clicks ? 'main.yes' : 'main.no'); }");
  edit(root, CTRL, "import { Controller } from 'lgui';", "import { Controller, lgui } from 'lgui';");
  assert.deepEqual(await codes(root), []);
});

test('LGUI-MVC-001：window、CS（Unity 的 C# 入口）、globalThis、fetch、setTimeout 也拦得住', async () => {
  for (const use of ['window.alert(1);', 'void CS.UnityEngine.Debug;', 'void globalThis.x;', "void fetch('/x');", 'setTimeout(() => {}, 1);']) {
    const root = await fresh();
    edit(root, CTRL, 'click() { mainModel.addClick(); }', `click() { mainModel.addClick(); ${use} }`);
    assert.ok((await codes(root)).includes('LGUI-MVC-001'), use);
  }
});

test('报错格式：文件:行:列  错误码  说明  → 怎么改；有错误时退出码 1', async () => {
  const root = await fresh();
  cases['LGUI-MVC-001'].fail(root);
  const result = await run(['check'], root);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /^src\/modules\/main\/MainController\.ts:\d+  LGUI-MVC-001  用了平台全局对象 document。.*  → /m);
});
