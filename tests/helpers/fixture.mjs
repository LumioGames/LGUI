// 测试用的小界面工程：Bag 包（BagPanel 横竖两版、按钮、格子、没导出的 header）和 Common 包（CurrencyBar）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

// 生成一张纯色 PNG（同步，测试界面里的字符小图用）。
export function png(width, height, [r, g, b] = [255, 200, 0]) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({length: width}, () => [r, g, b, 255]).flat())]);
  const raw = Buffer.concat(Array.from({length: height}, () => row));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// 美术字 dmg 的字符：0–9 宽 12（1 宽 8），+ 宽 10，高都是 16。
const glyphs = [...'0123456789'.split('').map(c => [c, c === '1' ? 8 : 12]), ['plus', 10]];

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
    <component id="reddot01" name="RedDot.xml" path="/"/>
    <component id="fx000001" name="Fx.xml" path="/" exported="true"/>
    <image id="flag0001" name="flag.png" path="/" exported="true"/>
    <image id="flag0002" name="flag@en.png" path="/" exported="true"/>
${glyphs.map(([c, w], i) => `    <image id="dmg${String(i).padStart(5, '0')}" name="dmg_${c}.png" path="/artfont/dmg/" exported="true" width="${w}" height="16"/>`).join('\n')}
  </resources>
</packageDescription>`));
  fs.writeFileSync(path.join(bag, 'BagPanel.xml'), landscape);
  fs.writeFileSync(path.join(bag, 'BagPanel@portrait.xml'), portrait);
  fs.writeFileSync(path.join(bag, 'Btn.xml'), xml(`<component size="160,56" extention="Button">
  <controller name="button" pages="0,up,1,down" selected="0"/>
  <displayList>
    <text id="n0" name="title" xy="0,0" size="160,56" fontSize="24" autoSize="shrink" singleLine="true" text=""/>
    <component id="n1" name="holdProgress" src="bar00001" xy="0,50" size="160,6"/>
    <component id="n2" name="redDot" src="reddot01" xy="140,-8" size="32,32" visible="false"/>
  </displayList>
  <Button/>
</component>`));
  fs.writeFileSync(path.join(bag, 'flag.png'), png(8, 8, [200, 0, 0]));
  fs.writeFileSync(path.join(bag, 'flag@en.png'), png(8, 8, [0, 0, 200]));
  fs.mkdirSync(path.join(bag, 'artfont', 'dmg'), {recursive: true});
  for (const [c, w] of glyphs) fs.writeFileSync(path.join(bag, 'artfont', 'dmg', `dmg_${c}.png`), png(w, 16));
  fs.writeFileSync(path.join(bag, 'Fx.xml'), xml(`<component size="400,100">
  <displayList>
    <component id="n0" name="damage" fileName="ArtText.xml" pkg="cmn00001" src="arttext1" xy="100,30" size="200,40" customData="font=Bag/dmg;align=center;spacing=2"/>
    <component id="n1" name="bad" fileName="ArtText.xml" pkg="cmn00001" src="arttext1" xy="0,0" size="200,40" customData="font=dmg"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(bag, 'RedDot.xml'), xml(`<component size="32,32">
  <displayList>
    <text id="n0" name="count" xy="0,0" size="32,32" fontSize="20" autoSize="shrink" singleLine="true" text=""/>
  </displayList>
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
    <component id="arttext1" name="ArtText.xml" path="/" exported="true"/>
    <component id="toast001" name="Toast.xml" path="/" exported="true"/>
    <component id="confirm1" name="Confirm.xml" path="/" exported="true"/>
    <component id="loading1" name="Loading.xml" path="/" exported="true"/>
    <component id="cbtn0001" name="Button.xml" path="/" exported="true"/>
  </resources>
</packageDescription>`));
  fs.writeFileSync(path.join(common, 'CurrencyBar.xml'), xml(`<component size="600,80">
  <displayList>
    <text id="n0" name="gold" xy="0,0" size="200,40" fontSize="24" autoSize="shrink" singleLine="true" text="0"/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'ArtText.xml'), xml(`<component size="200,64">
  <displayList/>
</component>`));
  fs.writeFileSync(path.join(common, 'Toast.xml'), xml(`<component size="720,96">
  <displayList>
    <text id="n0" name="text" xy="0,0" size="720,96" fontSize="28" autoSize="shrink" singleLine="true" text=""/>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'Button.xml'), xml(`<component size="240,72" extention="Button">
  <displayList>
    <text id="n0" name="title" xy="0,0" size="240,72" fontSize="28" autoSize="shrink" singleLine="true" text=""/>
  </displayList>
  <Button/>
</component>`));
  fs.writeFileSync(path.join(common, 'Confirm.xml'), xml(`<component size="800,480">
  <displayList>
    <text id="n0" name="title" xy="40,32" size="720,56" fontSize="36" autoSize="shrink" singleLine="true" text="提示"/>
    <text id="n1" name="message" xy="40,112" size="720,200" fontSize="28" autoSize="height" text=""/>
    <component id="n2" name="cancel" src="cbtn0001" xy="120,360" size="240,72"><Button title="取消"/></component>
    <component id="n3" name="ok" src="cbtn0001" xy="440,360" size="240,72"><Button title="确定"/></component>
  </displayList>
</component>`));
  fs.writeFileSync(path.join(common, 'Loading.xml'), xml(`<component size="1920,1080">
  <displayList>
    <text id="n0" name="text" xy="660,500" size="600,80" fontSize="32" autoSize="shrink" singleLine="true" text="加载中…"/>
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
