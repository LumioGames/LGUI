// lgui ux crop（放大量图）和 lgui ux page（校验设计稿、生成原型页）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run, tempProject} from './cli/helpers.mjs';
import {writeFixture} from '../helpers/fixture.mjs';
import {sharp} from '../../plugin/tools/lib/vendor.mjs';
import {estimateWidth, contrast, parseAnchor} from '../../plugin/tools/lib/ux/design.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-ux-'));
const json = async (argv, cwd) => JSON.parse((await run([...argv, '--json'], cwd)).stdout);

// 200×100 的图：左半红、右半蓝。
async function twoColors(dir) {
  const data = Buffer.alloc(200 * 100 * 4);
  for (let y = 0; y < 100; y++) for (let x = 0; x < 200; x++) data.set(x < 100 ? [255, 0, 0, 255] : [0, 0, 255, 255], (y * 200 + x) * 4);
  const file = path.join(dir, 'ref.png');
  await sharp()(data, {raw: {width: 200, height: 100, channels: 4}}).png().toFile(file);
  return file;
}

test('ux crop：不在工程里也能跑，按 --rect 裁、按 --zoom 放大，报出主色', async () => {
  const dir = tmp();
  await twoColors(dir);
  const result = await json(['ux', 'crop', 'ref.png', '--rect', '0,0,100,50', '--zoom', '2', '--scale', '1.2'], dir);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.data.out, 'crops/ref-0-0-100-50.png');
  assert.deepEqual(result.data.colors, [{color: '#ff0000', percent: 100}]);
  assert.equal(result.data.scale, 1.2);
  const meta = await sharp()(path.join(dir, result.data.out)).metadata();
  assert.deepEqual([meta.width, meta.height], [200, 100]);
  // 整张图：两个颜色各一半
  const whole = await json(['ux', 'crop', 'ref.png', '--out', 'all.png'], dir);
  assert.deepEqual(whole.data.colors.map(c => [c.color, c.percent]), [['#ff0000', 50], ['#0000ff', 50]]);
  assert.equal(whole.data.zoom, 6);
  assert.ok(fs.existsSync(path.join(dir, 'all.png')));
});

test('ux crop：参数不对报 LGUI-CLI-160，读不了的图报 LGUI-CLI-161', async () => {
  const dir = tmp();
  await twoColors(dir);
  fs.writeFileSync(path.join(dir, 'bad.png'), 'not an image');
  const code = async argv => (await json(['ux', 'crop', ...argv], dir)).errors[0]?.code;
  assert.equal(await code(['nope.png']), 'LGUI-CLI-160');
  assert.equal(await code(['ref.png', '--rect', '150,0,100,50']), 'LGUI-CLI-160');
  assert.equal(await code(['ref.png', '--rect', '0,0,10']), 'LGUI-CLI-160');
  assert.equal(await code(['ref.png', '--zoom', '0']), 'LGUI-CLI-160');
  assert.equal(await code(['bad.png']), 'LGUI-CLI-161');
});

test('估算用的小函数', () => {
  assert.equal(estimateWidth('开始游戏', 40), 160);
  assert.ok(estimateWidth('Start', 40) < 160);
  assert.ok(contrast('#ffffff', '#000000') > 20);
  assert.ok(contrast('#eeeeee', '#ffffff') < 1.5);
  assert.deepEqual(parseAnchor('right-top'), {h: 'right', v: 'top'});
  assert.deepEqual(parseAnchor('fill'), {h: 'stretch', v: 'stretch'});
  assert.equal(parseAnchor('top-left'), null);
});

// 一份最小的合格设计稿：两个方向、两种语言；一个全屏画面（背景、标题、开始按钮）和一个弹窗（面板、关闭）。
const both = (p, l) => ({portrait: p, landscape: l});
function base() {
  return {
    name: 'demo', mode: 'design', source: {kind: 'mockup', original: true},
    project: {orientation: 'both', designSize: {portrait: [1080, 1920], landscape: [1920, 1080]}, languages: ['zh-CN', 'en'], defaultLanguage: 'zh-CN', platforms: ['web'], inputs: ['touch']},
    screens: [
      {id: 'home', name: '主页', layer: 'page', fullscreen: true, flow: ['点开始 → 打开确认。'], elements: [
        {id: 'B01', name: '背景', type: 'image', scope: 'display', rect: both([0, 0, 1080, 1920], [0, 0, 1920, 1080]), anchor: 'fill', anchorTo: 'screen', source: both('measured', 'designed'), assets: ['homeBg']},
        {id: 'T01', name: '标题', type: 'text', scope: 'display', rect: both([240, 200, 600, 80], [660, 100, 600, 80]), anchor: 'center-top', source: both('measured', 'designed'),
          text: {content: {'zh-CN': '我的游戏', en: 'My Game'}, fontSize: 60, color: '#ffffff', overflow: 'shrink'}},
        {id: 'M01', name: '开始', type: 'button', control: 'startButton', scope: 'full', rect: both([340, 1500, 400, 120], [760, 860, 400, 120]), anchor: 'center-bottom', source: both('measured', 'designed'),
          action: '打开确认', opens: 'confirm', reuse: {from: 'reskin', ref: 'Common/Button'}, uses: ['lockWhilePending', 'lgui.confirm'],
          text: {content: {'zh-CN': '开始', en: 'Start'}, fontSize: 48, color: '#ffffff', stroke: [3, '#000000'], overflow: 'shrink'}}
      ]},
      {id: 'confirm', name: '确认', layer: 'popup', fullscreen: false, pattern: 'dialog', entry: 'M01', elements: [
        {id: 'P01', name: '面板', type: 'image', scope: 'display', rect: [0, 0, 800, 480], source: 'designed', assets: ['panel']},
        {id: 'P02', name: '关闭', type: 'button', scope: 'full', rect: [700, 20, 80, 80], source: 'designed', closes: true, action: '关闭', reuse: {from: 'reskin', ref: 'Common/Button'}}
      ]}
    ],
    components: [],
    assets: [
      {id: 'homeBg', kind: 'illustration', size: [1080, 1920], package: 'Home', reuse: {from: 'new'}, by: 'ai'},
      {id: 'panel', kind: 'image', size: [200, 200], nine: [40, 40, 40, 40], radius: 32, reuse: {from: 'new'}, by: 'ai', sheet: 'A1'}
    ]
  };
}
function write(design, dir = tmp()) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'design.json'), JSON.stringify(design));
  return dir;
}
const page = async (design, dir) => { const at = write(design, dir); return {dir: at, result: await json(['ux', 'page', '.'], at)}; };
const rules = result => result.data.warnings.map(w => w.rule);
const messages = result => result.errors.map(e => e.message).join('\n');

test('ux page：合格的设计稿生成原型页、每个画面每个方向一张线框图、图集页的名字文件；设计稿模式不出开发交接', async () => {
  const {dir, result} = await page(base());
  assert.equal(result.ok, true, messages(result));
  assert.deepEqual(result.data.warnings, []);
  assert.deepEqual(result.data.written, ['prototype.html', 'wireframe/home-portrait.png', 'wireframe/home-landscape.png', 'wireframe/confirm-portrait.png', 'wireframe/confirm-landscape.png', 'art/A1.txt']);
  const html = fs.readFileSync(path.join(dir, 'prototype.html'), 'utf8');
  assert.match(html, /<title>demo · UX 设计稿<\/title>/);
  assert.ok(html.includes('"name":"demo"') && !html.includes('__LGUI_UX_DATA__'));
  assert.equal(fs.readFileSync(path.join(dir, 'art/A1.txt'), 'utf8'), 'panel=200x200 9grid=40,40,40,40\n');
  assert.equal(fs.existsSync(path.join(dir, 'handoff.md')), false);
  assert.deepEqual(result.data.summary.scope, {display: 3, full: 2});
  assert.deepEqual(result.data.summary.toBuild, ['homeBg', 'panel']);
  const meta = await sharp()(path.join(dir, 'wireframe/home-landscape.png')).metadata();
  assert.ok(meta.width > meta.height);
});

test('ux page：全套模式生成开发交接，没有用例的完整实现元素会警告', async () => {
  const design = base();
  design.mode = 'full';
  design.open = [{id: 'O-01', question: '标题用哪个字体', owner: 'user', default: '系统粗体', blocks: ['T01']}];
  design.cases = [{id: 'C-01', name: '点开始打开确认', steps: '点 M01', expect: '确认弹窗打开', covers: ['M01'], runner: 'headless'}];
  const {dir, result} = await page(design);
  assert.equal(result.ok, true, messages(result));
  assert.deepEqual(rules(result), ['uncovered']);
  const handoff = fs.readFileSync(path.join(dir, 'handoff.md'), 'utf8');
  // 改回设计稿模式：上次生成的交接去掉；自己放在 wireframe/ 里的文件不动
  fs.writeFileSync(path.join(dir, 'wireframe/mine.txt'), 'keep');
  await page({...design, mode: 'design', cases: []}, dir);
  assert.equal(fs.existsSync(path.join(dir, 'handoff.md')), false);
  assert.equal(fs.readFileSync(path.join(dir, 'wireframe/mine.txt'), 'utf8'), 'keep');
  for (const part of ['# demo · 开发交接', '## 范围', '## 复用：先用现成的', '`lgui.confirm`：M01', '## 要新做的', 'lgui art cut ui/art-src/atlas/A1.png --pkg Common --names', '| C-01 |', '| O-01 |']) assert.ok(handoff.includes(part), part);
});

test('ux page：有错就什么都不写，一次报出全部问题（LGUI-CLI-163）', async () => {
  const design = base();
  const [bg, title, start] = design.screens[0].elements;
  design.screens[1].elements[0].id = 'B01';        // 编号重复
  start.opens = 'nowhere';                           // 打开不存在的画面
  delete title.rect.landscape;                       // 缺一个方向
  delete bg.anchor;                                  // 缺贴边方式
  delete title.text.overflow;                        // 缺超长处理
  start.reuse = {from: 'framework', ref: 'Common/Nope'};
  start.uses = ['format.compact', 'lgui.nothing'];
  design.assets[1].nine = [100, 0, 100, 0];          // 边距占满了图
  const {dir, result} = await page(design);
  assert.equal(result.ok, false);
  assert.ok(result.errors.every(e => e.code === 'LGUI-CLI-163'));
  const text = messages(result);
  for (const part of ['编号 B01 重复', 'opens 写的 nowhere', 'T01：缺 landscape 的位置', 'B01：缺 portrait 的贴边方式', '没写超长怎么办', '框架没有自带 Common/Nope', '"lgui.nothing"', '九宫格边距 [100, 0, 100, 0]']) assert.ok(text.includes(part), `${part}\n${text}`);
  assert.ok(!text.includes('format.compact'));
  assert.deepEqual(fs.readdirSync(dir), ['design.json']);
  // 不是合法 JSON
  fs.writeFileSync(path.join(dir, 'design.json'), '{');
  assert.equal((await json(['ux', 'page', 'design.json'], dir)).errors[0].code, 'LGUI-CLI-162');
  assert.equal((await json(['ux', 'page', 'missing'], dir)).errors[0].code, 'LGUI-CLI-160');
});

test('ux page：文字的警告——字太小、描边太粗、某种语言放不下、对比度低', async () => {
  const design = base();
  const [, title, start] = design.screens[0].elements;
  title.text.fontSize = 18;                                           // 小于 20，最小手机上也不到 8 像素
  start.text.stroke = [5, '#000000'];                                 // 5 > 48 × 7.5%
  start.text.content.en = 'Start the adventure right now';            // 英文放不下
  start.text.width = 300;
  design.screens[1].elements.push({id: 'P03', name: '说明', type: 'text', scope: 'display', rect: [40, 120, 720, 60], source: 'designed',
    text: {content: {'zh-CN': '确定吗'}, fontSize: 28, color: '#eeeeee', background: '#ffffff', overflow: 'height'}});
  const {result} = await page(design);
  assert.equal(result.ok, true, messages(result));
  assert.deepEqual([...new Set(rules(result))].sort(), ['text-contrast', 'text-fit', 'text-min-font', 'text-small', 'text-stroke']);
  const fit = result.data.warnings.find(w => w.rule === 'text-fit');
  assert.equal(fit.where, 'M01');
  assert.match(fit.message, /^en的文字/);
});

test('ux page：没翻译的语言按加长 40% 估；会变的文字不估', async () => {
  const design = base();
  const start = design.screens[0].elements[2];
  start.text = {content: {'zh-CN': '立即开始全新的冒险旅程'}, fontSize: 48, overflow: 'shrink', width: 400};
  let {result} = await page(design);
  assert.match(result.data.warnings.find(w => w.rule === 'text-fit').message, /en（没翻译，按加长 40% 估）/);
  start.text.dynamic = true;
  ({result} = await page(design));
  assert.deepEqual(rules(result), []);
});

test('ux page：平台、流转、资源、通用化的警告', async () => {
  const design = base();
  design.project.platforms = ['web', 'unity'];
  design.project.languages = ['zh-CN', 'en', 'ar'];
  design.project.inputs = ['touch', 'keyboardMouse'];
  design.screens[0].elements[2].rect.portrait = [340, 1780, 400, 120];   // 贴底的按钮落在操作提示栏的位置
  design.renames = [{what: '标题', from: '别人的游戏', to: '我的游戏'}, {what: '角色', from: '别人的角色名字', to: '小明'}];
  design.screens[1].elements[1].closes = false;                       // 弹窗没有关闭元素
  design.screens.push({id: 'lost', name: '走不到', layer: 'popup', fullscreen: false, designed: false, entry: '？'});
  design.assets.push({id: 'arrow', kind: 'icon', size: [48, 48], reuse: {from: 'new'}, by: 'code'});          // 代码图标 + Unity；没人用
  design.assets.push({id: 'dot', kind: 'image', size: [16, 16], reuse: {from: 'new'}, by: 'ai', sheet: 'A1'});  // 和下面的 frame 同一页，尺寸差太多；没人用
  design.assets.push({id: 'frame', kind: 'image', size: [150, 150], reuse: {from: 'new'}, by: 'ai', sheet: 'A1'});
  design.assets.push({id: 'logo', kind: 'textImage', size: [400, 120], reuse: {from: 'new'}, by: 'ai'});       // 带字图片没确认语言版本
  design.assets[1].nine = [20, 20, 20, 20];                           // 边距比圆角 32 小
  design.components = [{id: 'Badge', name: '角标', type: 'label', size: [80, 40], reuse: {from: 'new'}, parts: [{name: 'text', type: 'text', rect: [0, 0, 80, 40], text: {content: {'zh-CN': '新'}, fontSize: 24, overflow: 'shrink', dynamic: true}}]}];
  design.screens[0].elements.push({id: 'M02', name: '角标', type: 'label', component: 'Badge', scope: 'display', rect: both([700, 1480, 80, 40], [1120, 840, 80, 40]), anchor: 'center-bottom', source: both('measured', 'designed')});
  design.screens[1].elements.push({id: 'P04', name: '角标', type: 'label', component: 'Badge', scope: 'display', rect: [20, 20, 80, 40], source: 'designed'});
  const {result} = await page(design);
  assert.equal(result.ok, true, messages(result));
  assert.deepEqual([...new Set(rules(result))].sort(), ['hint-bar', 'language-rtl', 'nine-radius', 'no-close', 'part-name', 'platform-icon', 'promote', 'rename-width', 'sheet-ratio', 'text-image', 'unreachable', 'unused']);
});

test('ux page：在工程里读工程配置（锁定竖屏就只要竖屏），并核对「工程已有」的复用来源', async () => {
  const root = tempProject({orientation: 'portrait', languages: ['zh-CN'], defaultLanguage: 'zh-CN'});
  writeFixture(root);
  const design = base();
  delete design.project;
  for (const el of design.screens[0].elements) { el.rect = el.rect.portrait; el.source = 'measured'; }
  design.screens[0].elements[2].reuse = {from: 'project', ref: 'Common/CurrencyBar'};
  const dir = path.join(root, 'design/demo');
  let {result} = await page(design, dir);
  assert.equal(result.ok, true, messages(result));
  assert.equal(result.data.inProject, true);
  assert.equal(result.data.conditions.orientation, 'portrait');
  assert.deepEqual(result.data.written.filter(f => f.includes('wireframe')), ['wireframe/home-portrait.png', 'wireframe/confirm-portrait.png']);
  design.screens[0].elements[2].reuse = {from: 'project', ref: 'Common/Nope'};
  ({result} = await page(design, dir));
  assert.match(messages(result), /工程里没有 Common\/Nope/);
  // 不在工程里：核对不了，只提醒
  ({result} = await page({...design, project: base().project, screens: base().screens.map((s, i) => i ? s : {...s, elements: s.elements.map(el => el.id === 'M01' ? {...el, reuse: {from: 'project', ref: 'Common/Nope'}} : el)})}));
  assert.equal(result.ok, true, messages(result));
  assert.deepEqual(rules(result), ['reuse-unchecked']);
});
