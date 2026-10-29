// 测试用的小界面工程：Bag 包（BagPanel 横竖两版、按钮、格子、没导出的 header）和 Common 包（CurrencyBar）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const xml = body => `<?xml version="1.0" encoding="utf-8"?>\n${body}\n`;

export function bagPanel({size = '1920,1080', goldName = 'gold', extra = ''} = {}) {
  return xml(`<component size="${size}">
  <controller name="tabs" pages="0,equip,1,item" selected="0"/>
  <displayList>
    <text id="n0" name="${goldName}" xy="0,0" size="200,40" fontSize="24" autoSize="shrink" singleLine="true" text="0"/>
    <component id="n1" name="sellButton" src="btn00001" xy="0,50" size="160,56"><Button title="出售"/></component>
    <list id="n2" name="list" xy="0,120" size="800,600" layout="flow_hz" defaultItem="ui://bag00001slot0001" overflow="scroll"/>
    <component id="n3" name="header" src="header01" xy="0,0" size="1920,100"/>
    <component id="n4" name="topBar" src="curbar01" pkg="cmn00001" xy="0,0" size="600,80"/>
    ${extra}
  </displayList>
</component>`);
}

export function writeFixture(root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-ui-')), {portrait = bagPanel({size: '1080,1920'}), landscape = bagPanel()} = {}) {
  const ui = path.join(root, 'ui');
  const bag = path.join(ui, 'assets', 'Bag');
  const common = path.join(ui, 'assets', 'Common');
  fs.mkdirSync(bag, {recursive: true});
  fs.mkdirSync(common, {recursive: true});
  fs.writeFileSync(path.join(ui, 'UI.fairy'), xml('<projectDescription id="fixture" type="Layabox" version="3.0"/>'));
  fs.writeFileSync(path.join(bag, 'package.xml'), xml(`<packageDescription id="bag00001">
  <resources>
    <component id="bagpnl01" name="BagPanel.xml" path="/" exported="true"/>
    <component id="bagpnl02" name="BagPanel@portrait.xml" path="/" exported="true"/>
    <component id="btn00001" name="Btn.xml" path="/"/>
    <component id="slot0001" name="ItemSlot.xml" path="/" exported="true"/>
    <component id="header01" name="Header.xml" path="/"/>
    <component id="bar00001" name="Bar.xml" path="/" exported="true"/>
  </resources>
</packageDescription>`));
  fs.writeFileSync(path.join(bag, 'BagPanel.xml'), landscape);
  fs.writeFileSync(path.join(bag, 'BagPanel@portrait.xml'), portrait);
  fs.writeFileSync(path.join(bag, 'Btn.xml'), xml(`<component size="160,56" extention="Button">
  <controller name="button" pages="0,up,1,down" selected="0"/>
  <displayList>
    <text id="n0" name="title" xy="0,0" size="160,56" fontSize="24" autoSize="shrink" singleLine="true" text=""/>
    <component id="n1" name="holdProgress" src="bar00001" xy="0,50" size="160,6"/>
  </displayList>
  <Button/>
</component>`));
  fs.writeFileSync(path.join(bag, 'Bar.xml'), xml(`<component size="160,6" extention="ProgressBar">
  <displayList>
    <graph id="n0" name="bar" xy="0,0" size="160,6" type="rect" lineSize="0" fillColor="#6aa7ff"/>
  </displayList>
  <ProgressBar/>
</component>`));
  fs.writeFileSync(path.join(bag, 'ItemSlot.xml'), xml(`<component size="128,128">
  <displayList>
    <loader id="n0" name="icon" xy="0,0" size="128,128"/>
    <text id="n1" name="count" xy="80,100" size="48,28" fontSize="20" autoSize="shrink" singleLine="true" text="1"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(bag, 'Header.xml'), xml(`<component size="1920,100">
  <controller name="mode" pages="0,normal,1,edit" selected="0"/>
  <displayList>
    <text id="n0" name="count" xy="0,0" size="200,40" fontSize="24" autoSize="shrink" singleLine="true" text="0"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'package.xml'), xml(`<packageDescription id="cmn00001">
  <resources>
    <component id="curbar01" name="CurrencyBar.xml" path="/" exported="true"/>
    <component id="hintbar1" name="ActionHintBar.xml" path="/" exported="true"/>
    <component id="hint0001" name="ActionHint.xml" path="/" exported="true"/>
  </resources>
</packageDescription>`));
  fs.writeFileSync(path.join(common, 'CurrencyBar.xml'), xml(`<component size="600,80">
  <displayList>
    <text id="n0" name="gold" xy="0,0" size="200,40" fontSize="24" autoSize="shrink" singleLine="true" text="0"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'ActionHintBar.xml'), xml(`<component size="1920,64">
  <displayList>
    <list id="n0" name="list" xy="0,0" size="1920,64" layout="row" defaultItem="ui://cmn00001hint0001"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'ActionHint.xml'), xml(`<component size="220,56">
  <displayList>
    <text id="n0" name="key" xy="0,0" size="80,56" fontSize="24" autoSize="shrink" singleLine="true" text=""/>
    <text id="n1" name="label" xy="88,0" size="132,56" fontSize="24" autoSize="ellipsis" singleLine="true" text=""/>
  </displayList>
</component>`));
  return root;
}
