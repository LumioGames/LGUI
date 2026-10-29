import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {launchBrowser} from '../helpers/browser.mjs';
import {conformanceProject, runHeadless, runH5} from './runner.mjs';

test('h5 一致性输入：click 保留 Harness 指定的真实触摸类型', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let context;
  try {
    context = await conformanceProject();
    fs.writeFileSync(path.join(context.root, 'conformance/cases/touch-click.ts'), `
import type {Case} from '../harness';
import {ShopPanelView} from '../src/modules/shop/ShopPanelView';
const c: Case = {
  screen: {width: 1280, height: 720},
  async run(t) {
    await t.open(ShopPanelView);
    t.setInputType('touch');
    const before = t.snapshot().inputType;
    await t.click('Shop/ShopPanel.secondTab');
    return {before, after: t.snapshot().inputType};
  }
};
export default c;
`);
    const expected = await runHeadless(context, 'touch-click');
    assert.deepEqual(expected.data, {before: 'touch', after: 'touch'});
    assert.equal(expected.snapshot.inputType, 'touch');
    const actual = await runH5(context, 'touch-click', browser);
    assert.deepEqual(actual, expected);
    const pointers = context.h5Trace.dom.filter(event => event.type === 'pointerdown' || event.type === 'pointerup');
    assert.deepEqual(pointers.map(event => [event.type, event.pointerType, event.trusted]), [
      ['pointerdown', 'touch', true], ['pointerup', 'touch', true]
    ], '必须由 Chromium 消费真实触摸，不能只改快照中的 inputType');
    const command = context.h5Trace.protocol.find(entry => entry.method === 'Input.synthesizeTapGesture');
    assert.equal(command?.params.gestureSourceType, 'touch');
    assert.equal(command.params.duration, 50, '保留原有 click 时长');
  } catch (error) {
    console.error(`h5 input trace (touch-click): ${JSON.stringify(context?.h5Trace)}`);
    throw error;
  } finally { await browser.close(); }
});

test('h5 一致性输入：驱动响应迟到 400ms，不应把一次 50ms 点击变成长按', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let events = [];
  let samplingError = null;
  let delayedDown = false;
  let delayedGesture = false;
  const delayResponse = () => new Promise(resolve => setTimeout(resolve, 400));
  const instrumented = {
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(() => {
        globalThis.__inputTiming = [];
        let frame = 0;
        const tick = () => { frame++; requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
        for (const type of ['pointerdown', 'pointerup']) window.addEventListener(type, event => {
          globalThis.__inputTiming.push({type, frame, time: performance.now(), timestamp: event.timeStamp, trusted: event.isTrusted, pointerType: event.pointerType, button: event.button});
        }, true);
      });
      // Delay the driver's response after Chromium has consumed its input. The old
      // down -> Node timer -> up sequence keeps the mouse pressed throughout it.
      const down = page.mouse.down.bind(page.mouse);
      page.mouse.down = async (...args) => {
        const result = await down(...args);
        if (!delayedDown) { delayedDown = true; await delayResponse(); }
        return result;
      };
      const browserContext = page.context();
      const newSession = browserContext.newCDPSession.bind(browserContext);
      browserContext.newCDPSession = async (...args) => {
        const session = await newSession(...args);
        const send = session.send.bind(session);
        session.send = async (method, params) => {
          const result = await send(method, params);
          if (method === 'Input.synthesizeTapGesture' && !delayedGesture) { delayedGesture = true; await delayResponse(); }
          return result;
        };
        return session;
      };
      const close = page.close.bind(page);
      page.close = async () => {
        try { events = await page.evaluate(() => globalThis.__inputTiming); }
        catch (error) { samplingError = error; }
        finally { await close(); }
      };
      return page;
    }
  };
  try {
    const context = await conformanceProject();
    const expected = await runHeadless(context, 'stack-keys');
    const actual = await runH5(context, 'stack-keys', instrumented);
    if (samplingError) throw samplingError;
    assert.deepEqual(actual, expected, JSON.stringify({events}));
    const firstDown = events.find(event => event.type === 'pointerdown');
    const firstUp = events.find(event => event.type === 'pointerup');
    assert.ok(firstDown?.trusted && firstUp?.trusted, '必须是 Chromium 派发的真实原始输入');
    assert.equal(firstDown.pointerType, 'mouse');
    assert.equal(firstUp.pointerType, 'mouse');
    assert.equal(firstDown.button, 0);
    assert.equal(firstUp.button, 0);
    assert.ok(firstUp.time - firstDown.time < 300, JSON.stringify({events}));
    assert.ok(delayedDown || delayedGesture, '必须实际覆盖原生输入完成后的驱动响应延迟');
  } finally { await browser.close(); }
});

test('h5 一致性输入：保留 CDP 应答、trusted DOM 与框架原始指针轨迹供失败定位', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let context;
  try {
    context = await conformanceProject();
    const expected = await runHeadless(context, 'gestures');
    const actual = await runH5(context, 'gestures', browser);
    assert.deepEqual(actual, expected);
    const trace = context.h5Trace;
    assert.ok(trace, '运行器必须保留本次输入的完整诊断，不使用前一个用例的数据');
    assert.equal(trace.name, 'gestures');
    assert.ok(trace.protocol.length > 0);
    assert.ok(trace.protocol.every(command => command.replyEpoch >= command.sendEpoch));
    assert.ok(trace.dom.length > 0);
    assert.ok(trace.dom.every(event => event.trusted && Number.isFinite(event.timestampEpoch) && Number.isFinite(event.handledEpoch)));
    assert.ok(trace.normalized.length > 0);
    assert.ok(trace.normalized.every(event => Number.isFinite(event.time) && Number.isFinite(event.epoch) && event.scale > 0));
    assert.ok(trace.normalized.some(event => event.type === 'move' && event.pointerType === 'touch'));
  } catch (error) {
    console.error(`h5 input trace (gestures): ${JSON.stringify(context?.h5Trace)}`);
    throw error;
  } finally { await browser.close(); }
});

test('h5 一致性输入：触摸驱动应答迟到 160ms，仍区分快滑与慢拖', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let delayedTouchCommands = 0;
  let context;
  const instrumented = {
    async newPage(options) {
      const page = await browser.newPage(options);
      const browserContext = page.context();
      const newSession = browserContext.newCDPSession.bind(browserContext);
      browserContext.newCDPSession = async (...args) => {
        const session = await newSession(...args);
        const send = session.send.bind(session);
        session.send = async (method, params) => {
          const result = await send(method, params);
          if (method === 'Input.dispatchTouchEvent' && params.type === 'touchMove') {
            delayedTouchCommands++;
            await new Promise(resolve => setTimeout(resolve, 160));
          }
          return result;
        };
        return session;
      };
      return page;
    }
  };
  try {
    context = await conformanceProject();
    const expected = await runHeadless(context, 'gestures');
    const actual = await runH5(context, 'gestures', instrumented);
    assert.deepEqual(actual, expected);
    assert.ok(delayedTouchCommands > 0, '必须实际覆盖触摸输入后的驱动应答延迟');
    const touches = context.h5Trace.dom.filter(event => event.pointerType === 'touch');
    assert.equal(touches.filter(event => event.type === 'pointerdown').length, 2);
    assert.equal(touches.filter(event => event.type === 'pointerup').length, 2);
    assert.equal(touches.filter(event => event.type === 'pointercancel').length, 0);
    assert.ok(touches.some(event => event.type === 'pointermove'));
    assert.ok(touches.every(event => event.trusted), '必须由 Chromium 派发真实触摸，不注入 DOM 合成事件');
  } catch (error) {
    console.error(`h5 input trace (gestures, delayed touch): ${JSON.stringify(context?.h5Trace)}`);
    throw error;
  } finally { await browser.close(); }
});

test('h5 一致性输入：快滑与慢拖的 dx/dy 精确对应请求位移', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let context;
  try {
    context = await conformanceProject();
    fs.writeFileSync(path.join(context.root, 'conformance', 'cases', 'precise-touch.ts'), `
import {View} from 'lgui';
import type {Bind} from 'lgui';
import type {ShopPanelUI} from 'lgui/ui';
import type {Case} from '../harness';
const swipes: {dx: number; dy: number}[] = [];
const drags: {dx: number; dy: number}[] = [];
class DistanceView extends View<ShopPanelUI> {
  static component = 'Shop/ShopPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  bind: Bind<ShopPanelUI> = {bg: {
    swipe: e => swipes.push({dx: e.dx, dy: e.dy}),
    drag: e => { if (e.phase === 'end') drags.push({dx: e.dx, dy: e.dy}); }
  }};
}
const c: Case = {
  screen: {width: 1280, height: 720},
  async run(t) {
    await t.open(DistanceView);
    await t.swipe('Shop/ShopPanel.bg', -300, 0);
    await t.drag('Shop/ShopPanel.bg', 0, 150);
    return {swipes, drags};
  }
};
export default c;
`);
    const expected = await runHeadless(context, 'precise-touch');
    assert.deepEqual(expected.data, {swipes: [{dx: -300, dy: 0}], drags: [{dx: -300, dy: 0}, {dx: 0, dy: 150}]});
    const actual = await runH5(context, 'precise-touch', browser);
    assert.deepEqual(actual, expected);
  } catch (error) {
    console.error(`h5 input trace (precise-touch): ${JSON.stringify(context?.h5Trace)}`);
    throw error;
  } finally { await browser.close(); }
});

test('h5 原始输入：真实主线程延迟 180ms，保留发生时间且不把慢拖当快滑', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let context;
  let stalled = false;
  const instrumented = {
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(() => {
        let touches = 0;
        window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touches++; }, true);
        window.addEventListener('pointermove', event => {
          if (touches !== 2 || event.pointerType !== 'touch' || event.clientY < 450 || globalThis.__touchStalled) return;
          globalThis.__touchStalled = true;
          const until = performance.now() + 180;
          while (performance.now() < until) { /* real renderer work; no clock or event rewrite */ }
        }, true);
      });
      const close = page.close.bind(page);
      page.close = async () => {
        try { stalled = await page.evaluate(() => globalThis.__touchStalled === true); }
        finally { await close(); }
      };
      return page;
    }
  };
  try {
    context = await conformanceProject();
    const expected = await runHeadless(context, 'gestures');
    const actual = await runH5(context, 'gestures', instrumented);
    assert.deepEqual(actual, expected);
    assert.ok(stalled, '必须实际执行真实的浏览器主线程延迟');
    const {dom, normalized} = context.h5Trace;
    for (let i = 0; i < dom.length; i++) {
      assert.equal(normalized[i].time, dom[i].timestamp, '指针时间必须来自真实 DOM 发生时刻，不能改成稍后的消费时刻');
    }
    assert.ok(dom.some(event => event.handledEpoch - event.timestampEpoch >= 150), '必须实际覆盖输入发生后的延迟消费');
  } catch (error) {
    console.error(`h5 input trace (gestures, renderer stall): ${JSON.stringify(context?.h5Trace)}`);
    throw error;
  } finally { await browser.close(); }
});

test('h5 一致性输入：真实抬起已消费但驱动应答悬挂，明确超时报错', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let context, operation, watchdog, release;
  let heldReply = false;
  const instrumented = {
    async newPage(options) {
      const page = await browser.newPage(options);
      const browserContext = page.context();
      const newSession = browserContext.newCDPSession.bind(browserContext);
      browserContext.newCDPSession = async (...args) => {
        const session = await newSession(...args);
        const send = session.send.bind(session);
        session.send = async (method, params) => {
          const result = await send(method, params);
          if (method === 'Input.dispatchTouchEvent' && params.type === 'touchEnd' && !heldReply) {
            heldReply = true;
            await new Promise(resolve => { release = resolve; });
          }
          return result;
        };
        return session;
      };
      return page;
    }
  };
  try {
    context = await conformanceProject();
    operation = runH5(context, 'gestures', instrumented);
    const watched = Promise.race([operation, new Promise((_, reject) => {
      watchdog = setTimeout(() => reject(new Error('test watchdog: 运行器没有在有限期限内报告输入超时')), 10000);
    })]);
    await assert.rejects(watched, /h5 触摸输入超时.*CDP 应答尚未完成.*抬起已消费/);
    assert.ok(heldReply, '必须实际悬挂原生输入完成后的应答');
    assert.ok(context.h5Trace.dom.some(event => event.type === 'pointerup' && event.pointerType === 'touch' && event.trusted));
    assert.ok(context.h5Trace.normalized.some(event => event.type === 'up' && event.pointerType === 'touch'));
  } finally {
    clearTimeout(watchdog);
    release?.();
    await operation?.catch(() => {});
    await browser.close();
  }
});
