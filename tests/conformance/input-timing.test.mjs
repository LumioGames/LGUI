import test from 'node:test';
import assert from 'node:assert/strict';
import {launchBrowser} from '../helpers/browser.mjs';
import {conformanceProject, runHeadless, runH5} from './runner.mjs';

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
