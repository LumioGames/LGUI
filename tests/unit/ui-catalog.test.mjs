// lgui ui list --shared：通用资源清单（谁是通用的、谁在用、哪些可以合并）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {run, tempProject} from './cli/helpers.mjs';
import {writeFixture} from '../helpers/fixture.mjs';
import {readUiModel} from '../../plugin/tools/lib/generate/model.mjs';
import {buildCatalog, duplicateImages} from '../../plugin/tools/lib/generate/catalog.mjs';

const xml = body => `<?xml version="1.0" encoding="utf-8"?>\n${body}\n`;
const card = xml(`<component size="200,260">
  <displayList>
    <loader id="n0" name="icon" xy="0,0" size="200,200"/>
    <text id="n1" name="title" xy="0,200" size="200,30" fontSize="24" autoSize="ellipsis" singleLine="true" text=""/>
    <text id="n2" name="count" xy="0,230" size="200,30" fontSize="24" autoSize="shrink" singleLine="true" text=""/>
  </displayList>
</component>`);

// 在测试界面上加一个 Shop 包：列表子项用 Bag 的格子，图片和 Bag 的 flag.png 内容一样，Card 和 Bag/Card 长得一样。
function withShop(root) {
  const shop = path.join(root, 'ui/assets/Shop');
  const bag = path.join(root, 'ui/assets/Bag');
  fs.mkdirSync(shop, {recursive: true});
  fs.writeFileSync(path.join(shop, 'package.xml'), xml(`<packageDescription id="shop0001">
  <resources>
    <component id="shoppnl1" name="ShopPanel.xml" path="/" exported="true"/>
    <component id="card0001" name="Card.xml" path="/" exported="true"/>
    <image id="flag0001" name="banner.png" path="/"/>
  </resources>
</packageDescription>`));
  fs.writeFileSync(path.join(shop, 'ShopPanel.xml'), xml(`<component size="1920,1080">
  <displayList>
    <list id="n0" name="list" xy="0,0" size="800,600" layout="flow_hz" defaultItem="ui://bag00001slot0001" overflow="scroll"/>
    <image id="n1" name="flag" pkg="bag00001" src="flag0001" xy="0,0"/>
    <component id="n2" name="topBar" src="curbar01" pkg="cmn00001" xy="0,0" size="600,80"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(shop, 'Card.xml'), card);
  fs.copyFileSync(path.join(bag, 'flag.png'), path.join(shop, 'banner.png'));
  fs.writeFileSync(path.join(bag, 'Card.xml'), card);
  const pkg = path.join(bag, 'package.xml');
  fs.writeFileSync(pkg, fs.readFileSync(pkg, 'utf8').replace('  </resources>', '    <component id="card0001" name="Card.xml" path="/" exported="true"/>\n  </resources>'));
  return root;
}

const find = (catalog, name) => catalog.shared.find(item => item.name === name);

test('框架自带的 Common 组件标成 framework，带必有控件；项目加进 Common 的标成 project，列出谁在用', () => {
  const root = writeFixture();
  const catalog = buildCatalog(readUiModel(path.join(root, 'ui/UI.fairy')), {projectRoot: root});
  assert.equal(find(catalog, 'Common/Toast').layer, 'framework');
  assert.deepEqual(find(catalog, 'Common/Toast').required, ['text']);
  const bar = find(catalog, 'Common/CurrencyBar');
  assert.equal(bar.layer, 'project');
  assert.deepEqual(bar.usedBy, ['Bag/BagPanel', 'Bag/BagPanel@portrait']);
  assert.equal(bar.note, '只有 Bag 在用');
  assert.deepEqual(bar.controls, [{name: 'gold', kind: 'text'}]);
  // Common/Button 在 Common 自己的确认框里用着，不提示
  assert.equal(find(catalog, 'Common/Button').note, undefined);
  // 功能包自己用的东西不进清单
  assert.equal(find(catalog, 'Bag/ItemSlot'), undefined);
});

test('功能包里被别的包引用的资源进清单，并写明在哪、被谁用', () => {
  const root = withShop(writeFixture());
  const catalog = buildCatalog(readUiModel(path.join(root, 'ui/UI.fairy')), {projectRoot: root});
  const slot = find(catalog, 'Bag/ItemSlot');
  assert.equal(slot.layer, 'project');
  assert.ok(slot.usedBy.includes('Shop/ShopPanel'));
  assert.match(slot.note, /放在功能包 Bag 里，已经被 Shop 用到/);
  assert.match(find(catalog, 'Bag/flag').note, /已经被 Shop 用到/);
  // 两个包都在用以后，CurrencyBar 不再提示「只有一处在用」
  assert.equal(find(catalog, 'Common/CurrencyBar').note, undefined);
});

test('代码里写死的 ui:// 地址和 View 的 static component 也算引用；一个功能自己的 View 不算「被外面用到」', () => {
  const root = writeFixture();
  const write = (file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), text); };
  write('src/modules/bag/BagView.ts', `export class BagView { static component = 'Bag/BagPanel'; icon = 'ui://Bag/flag'; }\n`);
  let catalog = buildCatalog(readUiModel(path.join(root, 'ui/UI.fairy')), {projectRoot: root});
  assert.equal(find(catalog, 'Bag/BagPanel'), undefined);
  assert.equal(find(catalog, 'Bag/flag'), undefined);
  write('src/modules/shop/ShopView.ts', `export const banner = 'ui://Bag/flag';\n`);
  catalog = buildCatalog(readUiModel(path.join(root, 'ui/UI.fairy')), {projectRoot: root});
  assert.deepEqual(find(catalog, 'Bag/flag').usedBy, ['src/modules/bag/BagView.ts', 'src/modules/shop/ShopView.ts']);
});

test('Common 里没人引用的资源写明没找到引用；工程配置用到的不提示；美术字和项目字体进清单', () => {
  const root = writeFixture(undefined, {sounds: true});
  fs.mkdirSync(path.join(root, 'ui/fonts'));
  fs.writeFileSync(path.join(root, 'ui/fonts/TitleBold.ttf'), '');
  const project = {sounds: {click: 'ui://Common/click'}, placeholder: null, defaultFont: 'TitleBold'};
  const catalog = buildCatalog(readUiModel(path.join(root, 'ui/UI.fairy')), {projectRoot: root, project});
  assert.equal(find(catalog, 'Common/click').note, undefined);
  assert.deepEqual(find(catalog, 'Common/click').usedBy, ['工程配置']);
  assert.match(find(catalog, 'Common/bgm').note, /没找到引用/);
  assert.deepEqual(catalog.shared.filter(item => item.kind === 'font').map(item => [item.name, item.default]), [['TitleBold', true]]);
  // Bag 的美术字只有 Bag/Fx 自己在用，不算通用
  assert.equal(catalog.shared.some(item => item.kind === 'artfont'), false);
});

test('可以合并的候选：不同包里内容一样的图片、控件名和类型都一样的组件', () => {
  const root = withShop(writeFixture());
  const model = readUiModel(path.join(root, 'ui/UI.fairy'));
  const catalog = buildCatalog(model, {projectRoot: root});
  assert.deepEqual(catalog.candidates.find(c => c.reason === 'same-image').items, ['Bag/flag', 'Shop/banner']);
  assert.deepEqual(catalog.candidates.find(c => c.reason === 'same-structure').items, ['Bag/Card', 'Shop/Card']);
  // 同一个包里的美术字字符内容一样不算
  assert.equal(duplicateImages(model).length, 1);
});

test('lgui ui list --shared 按框架自带、项目通用、候选三段输出；不带 --shared 时和以前一样', async () => {
  const root = tempProject();
  withShop(writeFixture(root));
  const result = await run(['ui', 'list', '--shared'], root);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /框架自带（\d+）/);
  assert.match(result.stdout, /组件 {2}Common\/Toast {2}\[720×96，必有控件 text\]/);
  assert.match(result.stdout, /组件 {2}Bag\/ItemSlot {2}\[128×128\] {2}\d+ 处在用 {2}← 放在功能包 Bag 里/);
  assert.match(result.stdout, /可以合并的候选（2）/);
  const json = JSON.parse((await run(['ui', 'list', '--shared', '--json'], root)).stdout);
  assert.ok(Array.isArray(json.data.shared) && Array.isArray(json.data.candidates));
  const plain = JSON.parse((await run(['ui', 'list', '--json'], root)).stdout);
  assert.ok(plain.data.packages.some(p => p.name === 'Shop'));
});
