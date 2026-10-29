import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture} from './inspector-fixture.mjs';
import {connectInspector} from '../../unity/acceptance/inspector.mjs';

const entry = new URL('../../unity/acceptance/paused-heap.mjs', import.meta.url);
const expression = 'new Promise(resolve=>CS.LGUI.Tests.PlayerAcceptance.CollectV8(function lguiPostGcSnapshot(report){debugger;resolve(report)}))';
const frameExpression = 'CS.UnityEngine.Time.frameCount';
const poolExpression = 'CS.LGUI.Tests.PlayerAcceptance.ObjectPoolSnapshot()';
const gc = {ok: true, method: 'JsEnv.Backend.LowMemoryNotification', backend: 'Puerts.BackendV8',
  queuedFrame: 99, frame: 100, bootEntityId: '567:256', environmentIdentity: 'A1B2C3D4'};
const pool = {available: true, backend: gc.backend, bootEntityId: gc.bootEntityId,
  environmentIdentity: gc.environmentIdentity, scriptEnvIdentity: '1234ABCD', frame: 100,
  highWater: 12, capacity: 512, activeSlots: 8, referencedSlots: 8, activeNullSlots: 0, types: []};
const paused = {method: 'Debugger.paused', params: {reason: 'other', callFrames: [
  {callFrameId: 'frame:0', functionName: 'lguiPostGcSnapshot', location: {scriptId: '17', lineNumber: 0, columnNumber: 93}}
]}};

async function api() {
  assert.ok(fs.existsSync(entry), '同原 VM 的暂停堆读取工具必须存在');
  const module = await import(entry.href);
  assert.equal(typeof module.collectPausedHeap, 'function');
  return module;
}

async function scenario(t, options = {}) {
  let evaluation;
  let pendingPause;
  const server = await fixture((message, wire) => {
    options.observe?.(message);
    if (message.method === 'Debugger.enable') { wire.reply({debuggerId: 'existing-vm'}); return; }
    if (message.method === 'Runtime.evaluate' && message.params.expression === expression) {
      assert.equal(message.params.awaitPromise, true);
      assert.equal(message.params.returnByValue, true);
      evaluation = wire;
      pendingPause = () => wire.raw(JSON.stringify(options.paused ?? paused));
      if (!options.neverPause) pendingPause();
      options.onQueued?.();
      return;
    }
    if (message.method === 'Runtime.getHeapUsage') {
      if (options.heapError) wire.error({code: -32000, message: 'Read failed'});
      else if (options.abortAtHeap) options.abortAtHeap();
      else wire.reply(options.heap ?? {usedSize: 128, totalSize: 512});
      return;
    }
    if (message.method === 'Runtime.evaluate' && message.params.expression === frameExpression) {
      wire.reply({result: {type: 'number', value: 100}}); return;
    }
    if (message.method === 'Runtime.evaluate' && message.params.expression === poolExpression) {
      wire.reply({result: {type: 'string', value: JSON.stringify(options.pool ?? pool)}}); return;
    }
    if (message.method === 'Debugger.resume') {
      if (options.resumeError) wire.error({code: -32000, message: 'Resume rejected'});
      else wire.reply({});
      wire.raw(JSON.stringify({method: 'Debugger.resumed', params: {}}));
      evaluation?.reply({result: {type: 'string', value: JSON.stringify(options.gc ?? gc)}});
      return;
    }
    if (message.method === 'Debugger.disable') { wire.reply({}); return; }
    assert.fail(`Unexpected CDP command: ${JSON.stringify(message)}`);
  });
  t.after(() => server.close());
  const client = await connectInspector({port: server.port, timeoutMs: 300});
  t.after(() => client.close());
  return {client, server, sendPause: () => pendingPause()};
}

test('paused heap brackets the real heap read and resumes before consuming the original GC receipt', async t => {
  const module = await api();
  const {client, server} = await scenario(t);
  const report = await module.collectPausedHeap(client, {timeoutMs: 250});
  assert.equal(report.acquisitionCompleted, true);
  assert.equal(report.acceptancePassed, null);
  assert.deepEqual(report.pausedEvents, [paused]);
  assert.equal(report.preflightFrame, 100);
  assert.deepEqual(report.heap, {usedSize: 128, totalSize: 512});
  assert.deepEqual(report.gc, gc);
  assert.deepEqual(report.objectPool, pool);
  assert.deepEqual(report.frames, {beforeHeap: 100, afterHeap: 100});
  assert.deepEqual(report.frameGap, {beforeHeapMinusGC: 0, afterHeapMinusGC: 0, heapReadWindow: 0});
  assert.deepEqual(report.cleanupErrors, []);
  const operations = server.requests.map(message => message.method === 'Runtime.evaluate' ? message.params.expression : message.method);
  assert.deepEqual(operations, [frameExpression, 'Debugger.enable', expression, frameExpression,
    'Runtime.getHeapUsage', frameExpression, poolExpression, 'Debugger.resume', 'Debugger.disable']);
  assert.ok(server.requests.every(message => message.method !== 'HeapProfiler.collectGarbage'));
  // An off listener must not reject or retain data after this operation ends.
  await client.send('Runtime.evaluate', {expression: frameExpression});
  assert.equal(report.pausedEvents.length, 1);
});

test('an unrelated pause fails explicitly and still resumes and disables the debugger', async t => {
  const module = await api();
  const {client, server} = await scenario(t, {paused: {method: 'Debugger.paused', params: {
    callFrames: [{functionName: 'otherCallback'}], reason: 'other'}}});
  let saved;
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250, onFailure: value => { saved = value; }}), error =>
    error.code === 'LGUI-RT-001' && /lguiPostGcSnapshot/.test(error.message) && error.diagnostics === saved);
  assert.equal(saved.acquisitionCompleted, false);
  assert.equal(saved.pausedEvents[0].params.callFrames[0].functionName, 'otherCallback');
  assert.deepEqual(server.requests.slice(-2).map(value => value.method), ['Debugger.resume', 'Debugger.disable']);
  assert.equal(saved.gc.frame, 100);
});

for (const kind of ['timeout', 'abort']) {
  test(`${kind} while waiting for a pause restores execution and preserves diagnostics`, async t => {
    const module = await api();
    const controller = new AbortController();
    const {client, server} = await scenario(t, {neverPause: true,
      onQueued: kind === 'abort' ? () => controller.abort(new Error('Stopped diagnostic')) : undefined});
    let saved;
    await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 80, signal: controller.signal,
      onFailure: value => { saved = value; }}), error => error.code === 'LGUI-RT-001' && error.diagnostics === saved);
    assert.match(saved.firstCause.message, kind === 'abort' ? /aborted/ : /timed out/);
    assert.deepEqual(server.requests.slice(-2).map(value => value.method), ['Debugger.resume', 'Debugger.disable']);
    assert.deepEqual(saved.pausedEvents, []);
    assert.equal(saved.gc.ok, true);
  });
}

test('a primary heap error remains primary when resume also fails', async t => {
  const module = await api();
  const {client, server} = await scenario(t, {heapError: true, resumeError: true});
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250}), error => {
    assert.match(error.diagnostics.firstCause.message, /Read failed/);
    assert.equal(error.diagnostics.cleanupErrors.length, 1);
    assert.equal(error.diagnostics.cleanupErrors[0].phase, 'Debugger.resume');
    assert.match(error.diagnostics.cleanupErrors[0].message, /Resume rejected/);
    return error.code === 'LGUI-RT-001';
  });
  assert.equal(server.requests.at(-1).method, 'Debugger.disable');
});

test('a cleanup failure prevents a successful acquisition verdict', async t => {
  const module = await api();
  const {client} = await scenario(t, {resumeError: true});
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250}), error =>
    error.diagnostics.acquisitionCompleted === false && error.diagnostics.cleanupErrors[0].phase === 'Debugger.resume');
});

test('pool and GC identities must refer to the same existing VM', async t => {
  const module = await api();
  const {client} = await scenario(t, {pool: {...pool, environmentIdentity: 'DIFFERENT'}});
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250}), error =>
    error.code === 'LGUI-RT-001' && /identity/.test(error.message));
});

test('abort inside the paused heap read still sends both debugger cleanup commands', async t => {
  const module = await api();
  const controller = new AbortController();
  const {client, server} = await scenario(t, {abortAtHeap: () => controller.abort(new Error('Stop paused read'))});
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250, signal: controller.signal}), error => {
    assert.match(error.diagnostics.firstCause.message, /aborted/);
    assert.equal(error.diagnostics.pausedEvents.length, 1);
    assert.equal(error.diagnostics.heap, null);
    assert.equal(error.diagnostics.gc.ok, true);
    return true;
  });
  assert.deepEqual(server.requests.slice(-2).map(value => value.method), ['Debugger.resume', 'Debugger.disable']);
});

test('a failed persistence callback is visible without replacing the sampling failure', async t => {
  const module = await api();
  const {client} = await scenario(t, {heapError: true});
  await assert.rejects(module.collectPausedHeap(client, {timeoutMs: 250,
    onFailure: () => { throw new Error('Evidence disk failed'); }}), error => {
    assert.match(error.diagnostics.firstCause.message, /Read failed/);
    assert.equal(error.diagnostics.cleanupErrors.at(-1).phase, 'onFailure');
    assert.match(error.diagnostics.cleanupErrors.at(-1).message, /Evidence disk failed/);
    return true;
  });
});
