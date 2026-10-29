import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFixture, bagPanel} from '../helpers/fixture.mjs';
import {typecheck} from '../helpers/ts.mjs';
import {generateProjectTypes} from '../../plugin/tools/lib/generate/index.mjs';
import {run, tempProject} from './cli/helpers.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const core = path.join(repo, 'plugin/framework/core/index.ts');

// 用生成的类型写一段绑定代码，做类型检查。
function checkBinding(root, body) {
  const file = path.join(root, 'binding.ts');
  fs.writeFileSync(file, `import type { BagPanelUI, LGUIComponents } from './.lgui/build/types/index';\ndeclare const ui: BagPanelUI;\n${body}\nexport {};\n`);
  return typecheck([file], {baseUrl: root, paths: {lgui: [core]}});
}

test('生成的类型：控件、控制器页名、点号路径、导出子组件', async () => {
  const root = writeFixture();
  await generateProjectTypes(root);
  const errors = checkBinding(root, [
    "const t: string = ui.gold.text;",
    "ui.tabs.selectedPage = 'item';",
    "const c: string = ui['header.count'].text;",
    "ui['header.mode'].selectedPage = 'edit';",
    "const n: 'Common/CurrencyBar' = ui.topBar.componentName;",
    "ui.list.numItems = 3; ui.sellButton.title = 'x';",
    "const k: keyof LGUIComponents = 'Bag/ItemSlot';"
  ].join('\n'));
  assert.deepEqual(errors, []);
  const bag = fs.readFileSync(path.join(root, '.lgui/build/types/Bag.d.ts'), 'utf8');
  assert.doesNotMatch(bag, /sellButton\.button/);
});

test('改 ui/ 里一个控件的名字 → 重新生成 → 用旧名字的绑定在类型检查里报错', async () => {
  const root = writeFixture(undefined, {landscape: bagPanel({goldName: 'coins'}), portrait: bagPanel({size: '1080,1920', goldName: 'coins'})});
  await generateProjectTypes(root);
  const errors = checkBinding(root, "const t: string = ui.gold.text;");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /gold/);
  assert.deepEqual(checkBinding(root, "ui.tabs.selectedPage = 'shop';").length, 1, '不存在的页名也要报错');
});

test('横竖两版控件不一致时报 LGUI-UI-007，并列出差异', async () => {
  const root = writeFixture(undefined, {portrait: bagPanel({size: '1080,1920', goldName: 'coins'})});
  await assert.rejects(generateProjectTypes(root), error => {
    const item = error.errors.find(e => e.code === 'LGUI-UI-007');
    return item && /gold：横版text，竖版没有/.test(item.message) && /coins：横版没有，竖版text/.test(item.message);
  });
});

test('同一组件里控件和控制器重名报 LGUI-UI-005，控件重名报 LGUI-UI-004', async () => {
  const extra = '<text id="n9" name="tabs" xy="0,0" size="10,10" fontSize="20" autoSize="shrink" text=""/><text id="n10" name="gold" xy="0,0" size="10,10" fontSize="20" autoSize="shrink" text=""/>';
  const root = writeFixture(undefined, {landscape: bagPanel({extra}), portrait: bagPanel({size: '1080,1920', extra})});
  await assert.rejects(generateProjectTypes(root), error => {
    const codes = error.errors.map(e => e.code);
    return codes.includes('LGUI-UI-005') && codes.includes('LGUI-UI-004') && error.errors.every(e => e.file && e.line);
  });
});

test('headless 描述：控件树、初始属性、控制器、列表子项和子组件引用', async () => {
  const root = writeFixture();
  await generateProjectTypes(root);
  const bag = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/headless/Bag.json'), 'utf8'));
  const panel = bag.components.find(c => c.name === 'Bag/BagPanel');
  assert.deepEqual(panel.controllers, [{name: 'tabs', pages: ['equip', 'item'], selected: 'equip'}]);
  const byName = Object.fromEntries(panel.children.map(c => [c.name, c]));
  assert.equal(byName.gold.props.text, '0');
  assert.equal(byName.sellButton.kind, 'button');
  assert.equal(byName.sellButton.props.title, '出售');
  assert.equal(byName.list.defaultItem, 'Bag/ItemSlot');
  assert.equal(byName.topBar.ref, 'Common/CurrencyBar');
  assert.equal(byName.header.ref, 'Bag/Header');
});

test('lgui ui list 列出包、组件和控件，标出导出和竖版', async () => {
  const root = tempProject();
  writeFixture(root);
  const result = await run(['ui', 'list'], root);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Bag\/BagPanel@portrait {2}\[导出，竖版\]/);
  assert.match(result.stdout, /header\.count {2}text/);
  const json = JSON.parse((await run(['ui', 'list', '--json'], root)).stdout);
  const panel = json.data.packages.find(p => p.name === 'Bag').components.find(c => c.name === 'Bag/BagPanel');
  assert.ok(panel.controls.some(c => c.path === 'tabs' && c.pages.join() === 'equip,item'));
});

test('背包示例的界面能生成类型和 headless 描述', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-inv-'));
  fs.cpSync(path.join(repo, 'examples/inventory/legacy/project'), path.join(root, 'ui'), {recursive: true});
  fs.renameSync(path.join(root, 'ui/Inventory.fairy'), path.join(root, 'ui/UI.fairy'));
  const {types} = await generateProjectTypes(root);
  assert.ok(types.components.includes('Inventory/ComplexMain'));
});
