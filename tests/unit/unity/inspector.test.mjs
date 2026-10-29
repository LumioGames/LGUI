import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture} from './inspector-fixture.mjs';

const entry = new URL('../../unity/acceptance/inspector.mjs', import.meta.url);
async function api() {
  assert.ok(fs.existsSync(entry), 'Release 验证应提供真实 Inspector 连接与采样接口');
  return import(entry.href);
}

async function connected(t, handle, discovery, options = {}) {
  const module = await api();
  const server = await fixture(handle, discovery);
  t.after(() => server.close());
  const client = await module.connectInspector({port: server.port, ...options});
  t.after(() => client.close());
  return {module, server, client};
}

test('V8 sampling waits for native GC acknowledgement before requesting heap usage', async t => {
  let acknowledgeGc;
  let receivedGc;
  const gcReceived = new Promise(resolve => { receivedGc = resolve; });
  const {module, server, client} = await connected(t, (message, wire) => {
    if (message.method === 'HeapProfiler.collectGarbage') {
      acknowledgeGc = () => wire.reply({});
      receivedGc();
    } else if (message.method === 'Runtime.evaluate') wire.reply({result: {type: 'number', value: 0}});
    else if (message.method === 'Runtime.getHeapUsage') wire.reply({usedSize: 42, totalSize: 128, backingStorageSize: 8});
    else assert.fail(message.method);
  });
  const sampled = module.sampleV8(client);
  await gcReceived;
  await client.send('Runtime.evaluate', {expression: '0'});
  assert.deepEqual(server.requests.map(value => value.method), ['HeapProfiler.collectGarbage', 'Runtime.evaluate']);
  acknowledgeGc();
  assert.deepEqual(await sampled, {usedSize: 42, totalSize: 128, backingStorageSize: 8});
  assert.deepEqual(server.requests.map(value => value.method),
    ['HeapProfiler.collectGarbage', 'Runtime.evaluate', 'Runtime.getHeapUsage']);
});

test('readV8Heap reads the existing VM without issuing a CDP GC command', async t => {
  const {module, client, server} = await connected(t, (message, wire) => {
    assert.equal(message.method, 'Runtime.getHeapUsage');
    wire.reply({usedSize: 64, totalSize: 256, embedderHeapUsedSize: 0, backingStorageSize: 32});
  });
  assert.equal(typeof module.readV8Heap, 'function', '应提供独立读取原VM堆数据的接口');
  assert.deepEqual(await module.readV8Heap(client),
    {usedSize: 64, totalSize: 256, embedderHeapUsedSize: 0, backingStorageSize: 32});
  assert.deepEqual(server.requests.map(value => value.method), ['Runtime.getHeapUsage']);
});

test('readV8Heap preserves strict validation for direct native heap reads', async t => {
  const {module, client, server} = await connected(t, (message, wire) => {
    assert.equal(message.method, 'Runtime.getHeapUsage');
    wire.raw(`{"id":${message.id},"result":{"usedSize":1,"totalSize":1e400}}`);
  });
  assert.equal(typeof module.readV8Heap, 'function', '直接堆读取也应校验原生数值');
  await assert.rejects(module.readV8Heap(client), /LGUI-RT-001.*heap/i);
  assert.deepEqual(server.requests.map(value => value.method), ['Runtime.getHeapUsage']);
});

test('CDP replies pair by id when native replies arrive out of order', async t => {
  let first;
  const {client} = await connected(t, (message, wire) => {
    if (message.params.expression === 'first') first = wire;
    else { wire.reply({value: 'second'}); first.reply({value: 'first'}); }
  });
  assert.deepEqual(await Promise.all([
    client.send('Runtime.evaluate', {expression: 'first'}),
    client.send('Runtime.evaluate', {expression: 'second'})
  ]), [{value: 'first'}, {value: 'second'}]);
});

test('discovery retries a not-ready endpoint until its actual target is available', async t => {
  const {server, client} = await connected(t, (_, wire) => wire.reply({ready: true}),
    ({count}) => count < 3 ? {status: 503, body: {error: 'starting'}} : undefined);
  assert.equal(server.discoveryCount, 3);
  assert.deepEqual(await client.send('Runtime.evaluate'), {ready: true});
});

for (const target of ['ws://example.com:PORT', 'ws://127.0.0.1:1', 'ws://user:secret@127.0.0.1:PORT']) {
  test(`discovery rejects an unexpected target: ${target}`, async t => {
    const module = await api();
    const server = await fixture(() => assert.fail('Unsafe discovery must never connect'),
      ({port}) => ({body: [{webSocketDebuggerUrl: target.replace('PORT', String(port))}]}));
    t.after(() => server.close());
    await assert.rejects(module.connectInspector({port: server.port}), error =>
      error.code === 'LGUI-RT-001' && /discovery/i.test(error.message));
  });
}

for (const kind of ['malformed-json', 'unknown-id', 'protocol-error', 'closed']) {
  test(`native ${kind} rejects pending CDP commands with an error code`, async t => {
    const {client} = await connected(t, (message, wire) => {
      if (kind === 'malformed-json') wire.raw('not-json');
      else if (kind === 'unknown-id') wire.raw(JSON.stringify({id: message.id + 1, result: {}}));
      else if (kind === 'protocol-error') wire.error({code: -32601, message: 'Method not found'});
      else wire.close();
    });
    await assert.rejects(client.send('Runtime.evaluate'), error => error.code === 'LGUI-RT-001');
  });
}

test('a native command that never responds times out and close rejects remaining work', async t => {
  const {client} = await connected(t, () => {}, undefined, {timeoutMs: 150});
  await assert.rejects(client.send('Runtime.evaluate'), /LGUI-RT-001.*timed out/);
  const pending = client.send('Runtime.evaluate');
  client.close();
  await assert.rejects(pending, /LGUI-RT-001.*closed/);
});

test('notifications do not disturb pairing, and a failed native GC never requests heap usage', async t => {
  const {module, client, server} = await connected(t, (message, wire) => {
    wire.raw(JSON.stringify({method: 'Runtime.consoleAPICalled', params: {type: 'log'}}));
    wire.error({code: -32000, message: 'GC unavailable'});
  });
  await assert.rejects(module.sampleV8(client), /LGUI-RT-001.*GC unavailable/);
  assert.deepEqual(server.requests.map(value => value.method), ['HeapProfiler.collectGarbage']);
});

test('notification subscriptions fan out and each off removes exactly its subscription', async t => {
  const {client} = await connected(t, (_, wire) => {
    wire.raw(JSON.stringify({method: 'Debugger.paused', params: {reason: 'other', callFrames: []}}));
    wire.raw(JSON.stringify({method: 'Runtime.consoleAPICalled', params: {type: 'log'}}));
    wire.reply({});
  });
  assert.equal(typeof client.onNotification, 'function', 'Inspector notifications need cancellable subscriptions');
  const events = [];
  const record = (params, raw) => events.push({params, raw});
  const offFirst = client.onNotification('Debugger.paused', record);
  const offSecond = client.onNotification('Debugger.paused', record);
  await client.send('Runtime.evaluate');
  assert.equal(events.length, 2);
  assert.deepEqual(events[0], {params: {reason: 'other', callFrames: []},
    raw: {method: 'Debugger.paused', params: {reason: 'other', callFrames: []}}});
  offFirst(); offFirst();
  await client.send('Runtime.evaluate');
  assert.equal(events.length, 3);
  offSecond();
  await client.send('Runtime.evaluate');
  assert.equal(events.length, 3);
  client.close();
  assert.throws(() => client.onNotification('Debugger.paused', record), /LGUI-RT-001.*closed/);
});

for (const asynchronous of [false, true]) {
  test(`a ${asynchronous ? 'rejected' : 'throwing'} notification handler explicitly fails the client`, async t => {
    const {client} = await connected(t, (_, wire) => {
      wire.raw(JSON.stringify({method: 'Debugger.paused', params: {callFrames: []}}));
    });
    assert.equal(typeof client.onNotification, 'function');
    const cause = new Error('Sampling notification failed');
    client.onNotification('Debugger.paused', asynchronous ? async () => { throw cause; } : () => { throw cause; });
    await assert.rejects(client.send('Runtime.evaluate'), error =>
      error.code === 'LGUI-RT-001' && /handler/.test(error.message) && error.cause === cause);
    await assert.rejects(client.send('Runtime.evaluate'), /LGUI-RT-001.*handler/);
  });
}

test('off during notification dispatch prevents the removed listener from being called', async t => {
  const {client} = await connected(t, (_, wire) => {
    wire.raw(JSON.stringify({method: 'Debugger.paused', params: {callFrames: []}}));
    wire.reply({});
  });
  let removedCalls = 0;
  let offRemoved;
  client.onNotification('Debugger.paused', () => offRemoved());
  offRemoved = client.onNotification('Debugger.paused', () => { removedCalls++; });
  await client.send('Runtime.evaluate');
  assert.equal(removedCalls, 0);
});

test('abort after discovery closes the socket and rejects every pending command', async t => {
  const controller = new AbortController();
  const {client} = await connected(t, () => {}, undefined, {signal: controller.signal});
  const first = client.send('Runtime.evaluate');
  const second = client.send('Runtime.evaluate');
  controller.abort(new Error('Acceptance run ended'));
  await Promise.all([
    assert.rejects(first, /LGUI-RT-001.*aborted/),
    assert.rejects(second, /LGUI-RT-001.*aborted/),
    assert.rejects(client.send('Runtime.evaluate'), /LGUI-RT-001.*aborted/)
  ]);
});

test('abort while discovery is not ready terminates the readiness wait', async t => {
  const module = await api();
  const controller = new AbortController();
  let observed;
  const observedDiscovery = new Promise(resolve => { observed = resolve; });
  const server = await fixture(() => assert.fail('No target is available'), () => {
    observed();
    return {status: 503, body: {error: 'not ready'}};
  });
  t.after(() => server.close());
  const connecting = module.connectInspector({port: server.port, signal: controller.signal});
  await observedDiscovery;
  controller.abort();
  await assert.rejects(connecting, /LGUI-RT-001.*aborted/);
});

for (const heap of [{usedSize: -1, totalSize: 10}, {usedSize: '1', totalSize: 10}, {usedSize: 1},
  {usedSize: 1, totalSize: 10, embedderHeapUsedSize: -1}]) {
  test(`heap sampling rejects invalid native data ${JSON.stringify(heap)}`, async t => {
    const {module, client} = await connected(t, (message, wire) =>
      wire.reply(message.method === 'HeapProfiler.collectGarbage' ? {} : heap));
    await assert.rejects(module.sampleV8(client), error => error.code === 'LGUI-RT-001' && /heap/i.test(error.message));
  });
}

test('heap sampling rejects a finite-JSON number that overflows to Infinity', async t => {
  const {module, client} = await connected(t, (message, wire) => {
    if (message.method === 'HeapProfiler.collectGarbage') wire.reply({});
    else wire.raw(`{"id":${message.id},"result":{"usedSize":1e400,"totalSize":10}}`);
  });
  await assert.rejects(module.sampleV8(client), /LGUI-RT-001.*heap/i);
});

test('invalid process ids fail before any process sampling starts', async () => {
  const module = await api();
  for (const pid of [0, -1, 1.5, '1; Get-Process', Number.NaN, Number.MAX_SAFE_INTEGER])
    await assert.rejects(module.sampleProcess(pid), /LGUI-RT-001.*PID/);
});

test('external Windows sampling returns actual positive bytes for this Node process', {
  skip: process.platform !== 'win32'
}, async () => {
  const module = await api();
  const sample = await module.sampleProcess(process.pid);
  assert.equal(sample.pid, process.pid);
  assert.ok(Number.isSafeInteger(sample.privateMemorySize64) && sample.privateMemorySize64 > 0);
  assert.ok(Number.isSafeInteger(sample.workingSet64) && sample.workingSet64 > 0);
});
