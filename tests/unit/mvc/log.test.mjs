// 报错和日志：三类错误（写错了 → 开发和测试里抛错、正式构建里记 error；外部失败 → 记 warn；正常的先后顺序 → 记 info），
// lgui.log 和可替换的平台日志接口（形状和 Lumio 引擎的 Logger 一样）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {headless, started, loadFramework} from '../../helpers/framework.mjs';
import {writeFixture} from '../../helpers/fixture.mjs';
import {typecheck} from '../../helpers/ts.mjs';

const framework = fileURLToPath(new URL('../../../plugin/framework', import.meta.url));

// 一个记录型的日志接口，形状和引擎的 Logger 一样。
function recorder(records = [], category = 'game.demo.ui', context = {}) {
  const write = level => (event, a, b) => {
    const [data, error] = level === 'error' ? [b, a] : [a, b];
    records.push({level, category, event, data: typeof data === 'function' ? data() : data, error, context});
  };
  return {
    records,
    enabled: () => true,
    debug: write('debug'), info: write('info'), warn: write('warn'), error: write('error'),
    child: (extra, sub) => recorder(records, sub ? `${category}.${sub}` : category, {...context, ...extra})
  };
}

const lastOf = (backend, event) => backend.state.logs.filter(r => r.event === event).at(-1);

test('开发模式：lgui dev、lgui test 的打包是开发模式，正式构建（LGUI_DEV=false）不是', async () => {
  assert.equal((await loadFramework()).devMode(), true);
  assert.equal((await loadFramework({production: true})).devMode(), false);
});

test('lgui.log：游戏代码的日志进平台日志接口；main.ts 用 lgui.app({ platform: { log } }) 换掉它，child 带上分类', async () => {
  const log = recorder();
  const {fw, backend} = await started({app: {platform: {log}}});
  const {lgui} = fw;
  lgui.log.info('bag_opened', {count: 2});
  lgui.log.child({slot: 3}, 'bag').warn('slot_locked', () => ({slot: 3}));
  lgui.log.error('save_failed', new Error('磁盘满'), {file: 'save'});
  assert.deepEqual(log.records.map(r => [r.level, r.category, r.event, r.data]), [
    ['info', 'game.demo.ui', 'bag_opened', {count: 2}],
    ['warn', 'game.demo.ui.bag', 'slot_locked', {slot: 3}],
    ['error', 'game.demo.ui', 'save_failed', {file: 'save'}]
  ]);
  assert.equal(log.records[2].error.message, '磁盘满');
  assert.equal(lgui.log.enabled('debug'), true);
  assert.equal(backend.state.logs.length, 0, '换掉以后不再记进 headless 的默认日志');
});

test('lgui.log.child 可以在框架启动前写在模块顶层，启动后才真正写；启动前写日志报 LGUI-RT-050', async () => {
  const fw = await loadFramework();
  fw.clearRuntime();
  const log = fw.lgui.log.child({}, 'shop');
  assert.throws(() => log.info('too_early'), e => e.code === 'LGUI-RT-050');
  const {backend} = await started();
  log.info('opened', {id: 1});
  assert.deepEqual(lastOf(backend, 'opened'), {level: 'info', category: 'game.shop', event: 'opened', data: {id: 1}, time: backend.state.now});
});

test('headless 的默认日志记进 state.logs：级别、分类、事件、数据（写成函数的数据会先算出来）、错误', async () => {
  const {backend} = await headless();
  backend.platform.log.warn('careful', () => ({n: 1}), new Error('x'));
  backend.platform.log.child({}, 'net').error('lost', new Error('断线'));
  const [a, b] = backend.state.logs.slice(-2);
  assert.deepEqual([a.level, a.category, a.event, a.data, a.error.message], ['warn', 'game', 'careful', {n: 1}, 'x']);
  assert.deepEqual([b.level, b.category, b.event, b.data, b.error.message], ['error', 'game.net', 'lost', undefined, '断线']);
  assert.equal(backend.platform.log.enabled('debug'), true);
});

test('写错了（第 ① 类，开发模式）：缺文本键 → 抛 LGUI-RT-090 并记 error；事件名由错误码得来，数据里有 code、message、fix', async () => {
  const {fw, backend} = await started();
  const {lgui} = fw;
  assert.throws(() => lgui.t('nope.key'), e => e.code === 'LGUI-RT-090' && /i18n\/zh-CN\.json/.test(e.message));
  assert.throws(() => lgui.t('nope.key'), e => e.code === 'LGUI-RT-090', '每次都抛');
  const records = backend.state.logs.filter(r => r.event === 'lgui_rt_090');
  assert.equal(records.length, 1, '同一个键只记一次');
  assert.equal(records[0].level, 'error');
  assert.deepEqual(Object.keys(records[0].data), ['code', 'message', 'fix', 'key', 'language']);
  assert.equal(records[0].data.code, 'LGUI-RT-090');
  assert.match(records[0].data.message, /^文本表 i18n\/zh-CN\.json 里没有键 nope\.key。$/);
  assert.match(records[0].data.fix, /lgui check/);
  assert.equal(records[0].error.code, 'LGUI-RT-090');
});

test('写错了（正式构建）：缺文本键只记 error、显示键名；ArtText 缺字符记 error、其余字照常拼出来；界面照常打开', async () => {
  const {fw, backend} = await started({production: true});
  const {lgui, View, pick} = fw;
  assert.equal(lgui.t('nope.key'), 'nope.key');
  assert.equal(lastOf(backend, 'lgui_rt_090').level, 'error');
  const model = lgui.Model({damage: '1x2'});
  class FxView extends View { static component = 'Bag/Fx'; static layer = 'popup'; bind = {damage: {text: pick(model, s => s.damage)}}; }
  const view = await lgui.ui.open(FxView);
  assert.deepEqual(view.__component.child('damage').children.map(g => g.url), ['ui://Bag/dmg_1', 'ui://Bag/dmg_2']);
  assert.match(lastOf(backend, 'lgui_rt_130').data.message, /缺字符「x」/);
});

test('写错了：加载器要显示的图片所在的包没加载 → 开发模式抛 LGUI-RT-071，正式构建只记 error', async () => {
  for (const production of [false, true]) {
    const {fw, backend} = await started({production});
    const {lgui, View} = fw;
    class SlotView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; bind = {icon: {icon: 'ui://Shop/coin'}}; }
    if (production) {
      await lgui.ui.open(SlotView);
      assert.equal(lastOf(backend, 'lgui_rt_071').level, 'error');
    } else {
      await assert.rejects(lgui.ui.open(SlotView), e => e.code === 'LGUI-RT-080' && /LGUI-RT-071/.test(e.message));
    }
  }
});

test('写错了：ArtText 的字体所在的包没加载报 LGUI-RT-171（不是「缺字符」）', async () => {
  const root = writeFixture();
  const fx = path.join(root, 'ui/assets/Bag/Fx.xml');
  fs.writeFileSync(fx, fs.readFileSync(fx, 'utf8').replace('customData="font=dmg"', 'customData="font=Shop/dmg"'));
  const {fw} = await started({root});
  class FxView extends fw.View { static component = 'Bag/Fx'; static layer = 'popup'; bind = {bad: {text: '1'}}; }
  await assert.rejects(fw.lgui.ui.open(FxView), e => /LGUI-RT-171/.test(e.message) && /Shop/.test(e.message) && !/LGUI-RT-130/.test(e.message));
});

test('写错了：Common 包里没有 ActionHintBar → 开发模式启动就报 LGUI-RT-172；正式构建记 error，不建提示栏，照常启动', async () => {
  const strip = () => {
    const root = writeFixture();
    const pkg = path.join(root, 'ui/assets/Common/package.xml');
    fs.writeFileSync(pkg, fs.readFileSync(pkg, 'utf8').replace(/\s*<component id="hintbar1"[^>]*\/>/, ''));
    fs.rmSync(path.join(root, 'ui/assets/Common/ActionHintBar.xml'));
    return root;
  };
  await assert.rejects(started({root: strip()}), e => e.code === 'LGUI-RT-172' && /ActionHintBar/.test(e.message));
  const {backend} = await started({root: strip(), production: true});
  assert.equal(lastOf(backend, 'lgui_rt_172').level, 'error');
});

test('外部失败（第 ② 类）：请求失败交回 { ok: false } 并记 warn，不抛错', async () => {
  const {fw, backend} = await started();
  const {lgui} = fw;
  const req = lgui.request(async () => { throw new Error('库存不足'); });
  const result = await req.run();
  assert.deepEqual([result.ok, result.error.code], [false, 'LGUI-RT-101']);
  const record = lastOf(backend, 'lgui_rt_101');
  assert.deepEqual([record.level, record.data.code, record.error.code], ['warn', 'LGUI-RT-101', 'LGUI-RT-101']);
  assert.match(record.data.message, /库存不足/);
});

test('正常的先后顺序（第 ③ 类）：关闭一个已经关了的界面记 info（LGUI-RT-082）', async () => {
  const {fw, backend} = await started();
  const {lgui, View} = fw;
  class PickerView extends View { static component = 'Bag/ItemSlot'; static layer = 'popup'; }
  lgui.ui.close(PickerView);
  assert.deepEqual([lastOf(backend, 'lgui_rt_082').level, lastOf(backend, 'lgui_rt_082').data.view], ['info', 'PickerView']);
});

test('平台日志接口和 Lumio 引擎的 Logger 同形：sdk.logger.child({}, "ui") 能直接交给 lgui.app({ platform: { log } })', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-logger-'));
  const file = path.join(dir, 'engine.ts');
  fs.writeFileSync(file, `import {lgui} from ${JSON.stringify(path.join(framework, 'index').split(path.sep).join('/'))};
// 照抄 LumioEngine/runtime/core/log.ts 的 Logger。
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface LogContext { readonly runId?: string; readonly gameId?: string; readonly tick?: number; readonly connectionId?: number | string }
type LogData = unknown | (() => unknown);
interface Logger {
  enabled(level: LogLevel): boolean;
  debug(event: string, data?: LogData): void;
  info(event: string, data?: LogData): void;
  warn(event: string, data?: LogData, error?: unknown): void;
  error(event: string, error?: unknown, data?: LogData): void;
  child(context: LogContext, category?: string): Logger;
}
declare const sdk: {logger: Logger};
export default lgui.app({backend: 'h5', platform: {log: sdk.logger.child({}, 'ui')}, start() {}});
const child: Logger = lgui.log.child({}, 'bag');
void child;
`);
  assert.deepEqual(typecheck([file]), []);
});
