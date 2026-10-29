import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';

async function api() {
  const entry = new URL('../../unity/acceptance/heap-snapshot.mjs', import.meta.url);
  assert.ok(fs.existsSync(entry), '同步快照包装器必须存在');
  return import(entry.href);
}
const graph = () => ({snapshot: {meta: {node_fields: ['type', 'name', 'id', 'self_size', 'edge_count'],
  node_types: [['synthetic', 'object'], 'string', 'number', 'number', 'number'],
  edge_fields: ['type', 'name_or_index', 'to_node'], edge_types: [['property'], 'string_or_number', 'node']},
  node_count: 2, edge_count: 1}, nodes: [0, 0, 1, 0, 1, 1, 1, 3, 16, 0], edges: [0, 2, 5], strings: ['root', 'Object', 'child']});

function protocol({text = JSON.stringify(graph()), fail, never = false, resumeFail = false, delayEnable = false} = {}) {
  const listeners = new Map();
  const calls = [];
  let acknowledges;
  let acknowledgeEnable;
  const client = {
    onNotification(method, handler) {
      const handlers = listeners.get(method) ?? new Set();
      listeners.set(method, handlers); handlers.add(handler);
      return () => { handlers.delete(handler); };
    },
    async send(method, params) {
      calls.push({method, params});
      if (method === 'HeapProfiler.enable' && delayEnable) return new Promise(resolve => { acknowledgeEnable = () => resolve({}); });
      if (method === 'HeapProfiler.enable' || method === 'HeapProfiler.disable') return {};
      if (method === 'HeapProfiler.takeHeapSnapshot') {
        assert.deepEqual(params, {reportProgress: false});
        const emit = chunk => {
          const raw = {method: 'HeapProfiler.addHeapSnapshotChunk', params: {chunk}};
          for (const handler of [...(listeners.get(raw.method) ?? [])]) handler(raw.params, raw);
        };
        emit(text.slice(0, 43));
        if (text.length > 43) emit(text.slice(43));
        if (fail) throw new Error('LGUI-RT-001 Snapshot command rejected');
        if (never) return new Promise(() => {});
        return new Promise(resolve => { acknowledges = () => resolve({}); });
      }
      if (method === 'Debugger.resume') {
        if (resumeFail) throw new Error('LGUI-RT-001 Resume refused');
        return {};
      }
      throw new Error('Unexpected command: ' + method);
    },
    close() { listeners.clear(); }
  };
  return {client, calls, listeners, acknowledge: () => acknowledges(), enable: () => acknowledgeEnable(),
    paused(wrapper) {
      const raw = {method: 'Debugger.paused', params: {callFrames: [{functionName: 'lguiPostGcSnapshot'}]}};
      const off = wrapper.onNotification('Debugger.paused', () => {});
      for (const handler of [...(listeners.get(raw.method) ?? [])]) handler(raw.params, raw);
      return off;
    }};
}

// PuerTS 3.0.3 / V8 13.6.233.17 actual snapshot-probe1 metadata: six
// serialized node fields but seven type annotations. Preserve that real shape.
function nativeMetadataGraph() {
  return {snapshot: {meta: {
    node_fields: ['type', 'name', 'id', 'self_size', 'edge_count', 'detachedness'],
    node_types: [['hidden', 'array', 'string', 'object', 'code', 'closure', 'regexp', 'number', 'native',
      'synthetic', 'concatenated string', 'sliced string', 'symbol', 'bigint', 'object shape'],
      'string', 'number', 'number', 'number', 'number', 'number'],
    edge_fields: ['type', 'name_or_index', 'to_node'],
    edge_types: [['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak'], 'string_or_number', 'node']},
    node_count: 2, edge_count: 1}, nodes: [9, 0, 1, 0, 1, 0, 3, 1, 3, 16, 0, 0],
    edges: [2, 2, 6], strings: ['root', 'Object', 'child']};
}
async function setup(t, settings = {}, options = {}) {
  const module = await api();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-heap-snapshot-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const file = path.join(directory, 'native.heapsnapshot');
  const wire = protocol(settings);
  const capture = module.createSnapshotClient(wire.client, {file, timeoutMs: settings.never ? 40 : 300, ...options});
  const off = wire.paused(capture.client);
  t.after(off);
  return {module, directory, file, wire, capture};
}

test('snapshot chunks stream completely and the reply precedes the real debugger resume', async t => {
  const {wire, capture, file} = await setup(t);
  const resumed = capture.client.send('Debugger.resume');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(wire.calls.some(call => call.method === 'Debugger.resume'), false, 'Chunks alone do not complete a snapshot');
  assert.equal(fs.readFileSync(file, 'utf8'), JSON.stringify(graph()));
  wire.acknowledge();
  assert.deepEqual(await resumed, {});
  assert.deepEqual(wire.calls.map(call => call.method).slice(0, 3),
    ['HeapProfiler.enable', 'HeapProfiler.takeHeapSnapshot', 'Debugger.resume']);
  const report = capture.report;
  assert.equal(report.acquisitionCompleted, true);
  assert.equal(report.acceptancePassed, null);
  assert.equal(report.chunks, 2);
  assert.equal(report.bytes, Buffer.byteLength(JSON.stringify(graph())));
  assert.equal(report.sha256, createHash('sha256').update(JSON.stringify(graph())).digest('hex'));
  assert.deepEqual(report.schema, {nodeCount: 2, edgeCount: 1, nodeFieldCount: 5, edgeFieldCount: 3, stringCount: 3});
  assert.equal(JSON.parse(fs.readFileSync(file + '.report.json', 'utf8')).acquisitionCompleted, true);
  assert.equal(wire.listeners.get('HeapProfiler.addHeapSnapshotChunk').size, 0);
  await capture.client.send('Debugger.resume');
  assert.equal(wire.calls.filter(call => call.method === 'HeapProfiler.takeHeapSnapshot').length, 1);
});

for (const kind of ['command-error', 'timeout', 'malformed-json', 'invalid-edge']) {
  test(`${kind} retains the raw file and report and still attempts actual resume`, async t => {
    const invalid = graph(); invalid.edges[2] = 6;
    const settings = kind === 'command-error' ? {fail: true} : kind === 'timeout' ? {never: true} :
      {text: kind === 'malformed-json' ? '{partial' : JSON.stringify(invalid)};
    const {wire, capture, file} = await setup(t, settings);
    const resumed = capture.client.send('Debugger.resume');
    if (!['command-error', 'timeout'].includes(kind)) {
      await new Promise(resolve => setImmediate(resolve)); wire.acknowledge();
    }
    await assert.rejects(resumed, error => error.code === 'LGUI-RT-001' && error.diagnostics === capture.report);
    assert.equal(wire.calls.filter(call => call.method === 'Debugger.resume').length, 1);
    assert.equal(capture.report.acquisitionCompleted, false);
    assert.equal(capture.report.acceptancePassed, null);
    assert.ok(capture.report.firstCause.message);
    assert.ok(fs.existsSync(file)); assert.ok(fs.existsSync(file + '.report.json'));
    assert.equal(wire.listeners.get('HeapProfiler.addHeapSnapshotChunk').size, 0);
    // Opening for exclusive sharing is not portable; rename proves the writer fd was closed on Windows.
    fs.renameSync(file, file + '.retained');
  });
}

test('a snapshot failure remains primary when the actual resume also fails', async t => {
  const {capture} = await setup(t, {fail: true, resumeFail: true});
  await assert.rejects(capture.client.send('Debugger.resume'), error => {
    assert.match(error.diagnostics.firstCause.message, /Snapshot command rejected/);
    assert.equal(error.diagnostics.cleanupErrors[0].phase, 'Debugger.resume');
    assert.match(error.diagnostics.cleanupErrors[0].message, /Resume refused/);
    return error.code === 'LGUI-RT-001';
  });
});

test('a late snapshot reply cannot rewrite an already persisted timeout report', async t => {
  const {wire, capture, file} = await setup(t, {}, {timeoutMs: 30});
  await assert.rejects(capture.client.send('Debugger.resume'), /LGUI-RT-001.*timed out/);
  const retained = JSON.parse(fs.readFileSync(file + '.report.json', 'utf8'));
  wire.acknowledge();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(capture.report, retained);
});

test('an enable reply after the capture deadline cannot start a snapshot after resume', async t => {
  const {wire, capture} = await setup(t, {delayEnable: true}, {timeoutMs: 30});
  await assert.rejects(capture.client.send('Debugger.resume'), /LGUI-RT-001.*timed out/);
  wire.enable();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(wire.calls.map(call => call.method), ['HeapProfiler.enable', 'Debugger.resume']);
});

test('fresh plain absolute paths are validated before the wrapper can issue commands', async t => {
  const {module, file, wire} = await setup(t);
  fs.writeFileSync(file, 'existing evidence');
  for (const invalid of [file, file + '\0', 'relative.heapsnapshot', new URL('file:///C:/snapshot.json'),
    'https://example.com/file.heapsnapshot']) assert.throws(() => module.createSnapshotClient(wire.client, {file: invalid}), /LGUI-RT-001/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'existing evidence');
  assert.equal(wire.calls.length, 0);
});

test('actual V8 13.6 metadata may retain an unused extra node type annotation', async t => {
  const {wire, capture} = await setup(t, {text: JSON.stringify(nativeMetadataGraph())});
  const resumed = capture.client.send('Debugger.resume');
  await new Promise(resolve => setImmediate(resolve)); wire.acknowledge();
  await resumed;
  assert.equal(capture.report.acquisitionCompleted, true);
  assert.deepEqual(capture.report.schema, {nodeCount: 2, edgeCount: 1, nodeFieldCount: 6, edgeFieldCount: 3, stringCount: 3});
});

test('the pure graph validator accepts actual metadata while preserving strict table offsets and counts', async () => {
  const {validateHeapSnapshotGraph} = await api();
  assert.equal(typeof validateHeapSnapshotGraph, 'function');
  assert.equal(validateHeapSnapshotGraph(nativeMetadataGraph()).nodeCount, 2);
  const wrongOffset = nativeMetadataGraph(); wrongOffset.edges[2] = 7;
  assert.throws(() => validateHeapSnapshotGraph(wrongOffset), /LGUI-RT-001.*target index/);
  const wrongCount = nativeMetadataGraph(); wrongCount.snapshot.node_count = 3;
  assert.throws(() => validateHeapSnapshotGraph(wrongCount), /LGUI-RT-001.*lengths\/counts/);
});

for (const kind of ['missing-field-type', 'invalid-field-type', 'missing-enum', 'invalid-enum']) {
  test(`native metadata still rejects ${kind} for a referenced field`, async t => {
    const native = nativeMetadataGraph();
    if (kind === 'missing-field-type') native.snapshot.meta.node_types.length = 5;
    if (kind === 'invalid-field-type') native.snapshot.meta.node_types[2] = null;
    if (kind === 'missing-enum') native.snapshot.meta.node_types[0] = 'number';
    if (kind === 'invalid-enum') native.snapshot.meta.node_types[0] = [0];
    const {wire, capture} = await setup(t, {text: JSON.stringify(native)});
    const resumed = capture.client.send('Debugger.resume');
    const rejected = assert.rejects(resumed, /LGUI-RT-001.*schema/);
    await new Promise(resolve => setImmediate(resolve)); wire.acknowledge();
    await rejected;
    assert.equal(capture.report.acquisitionCompleted, false);
    assert.equal(wire.calls.filter(call => call.method === 'Debugger.resume').length, 1);
  });
}
