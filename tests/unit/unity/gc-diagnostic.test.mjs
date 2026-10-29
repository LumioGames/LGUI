import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';

const identity = ['Puerts.BackendV8', 'boot-1', 'vm-1'];
function client({wrongPool = false} = {}) {
  const commands = [];
  let frame = 10, heaps = 0;
  return {commands, async send(method, params) {
    if (method === 'Runtime.getHeapUsage') { commands.push('heap'); return {usedSize: ++heaps * 100, totalSize: 1000}; }
    assert.equal(method, 'Runtime.evaluate');
    const expression = params.expression;
    if (expression === 'CS.UnityEngine.Time.frameCount') {
      commands.push('frame'); return {result: {type: 'number', value: frame}};
    }
    if (expression.includes('.CollectV8(')) {
      commands.push('v8');
      return {result: {value: JSON.stringify({ok: true, method: 'JsEnv.Backend.LowMemoryNotification', backend: identity[0], bootEntityId: identity[1],
        environmentIdentity: identity[2], queuedFrame: frame, frame: ++frame})}};
    }
    if (expression.includes('.CollectManaged(')) {
      commands.push('managed');
      return {result: {value: JSON.stringify({ok: true, frame, counts: {available: true}, managedHeap: {available: true, bytes: 1234}})}};
    }
    assert.match(expression, /\.ObjectPoolSnapshot\(\)/);
    commands.push('pool');
    return {result: {value: JSON.stringify({available: true, backend: identity[0], bootEntityId: identity[1], environmentIdentity: wrongPool ? 'other' : identity[2],
      scriptEnvIdentity: 'script-1', capacity: 8, highWater: 4, referencedSlots: 2, activeSlots: 2, activeNullSlots: 0, types: [{type: 'Example', count: 2}]})}};
  }};
}

test('bounded alternating collection records every phase and uses fixed rounds regardless of increasing heap values', async () => {
  const {collectAlternatingGC} = await import('../../unity/acceptance/memory-host.mjs');
  assert.equal(typeof collectAlternatingGC, 'function');
  const connection = client();
  const result = await collectAlternatingGC(connection, identity);
  assert.equal(result.rounds, 2);
  assert.deepEqual(result.phases[0].heapFrames, {before: 10, after: 10});
  assert.deepEqual(result.phases.map(phase => phase.phase), ['before', 'after-v8-1', 'after-managed-1', 'after-v8-2', 'after-managed-2', 'after-v8-final']);
  const read = ['frame', 'heap', 'frame', 'pool'];
  assert.deepEqual(connection.commands, [...read, 'v8', ...read, 'managed', ...read, 'v8', ...read, 'managed', ...read, 'v8', ...read]);
  assert.deepEqual(result.phases.map(phase => phase.heap.usedSize), [100, 200, 300, 400, 500, 600]);
  assert.equal(result.acceptancePassed, null, 'A bounded diagnostic does not decide a memory verdict');
});

test('bounded collection rejects a different ObjectPool VM rather than reading another environment', async () => {
  const {collectAlternatingGC} = await import('../../unity/acceptance/memory-host.mjs');
  assert.equal(typeof collectAlternatingGC, 'function');
  await assert.rejects(collectAlternatingGC(client({wrongPool: true}), identity), /LGUI-RT-001.*identity/);
});

test('paused heap remains an explicit boolean opt-in and rejects a string before any Player launch', async () => {
  const {runMemoryPlayer} = await import('../../unity/acceptance/memory-host.mjs');
  await assert.rejects(runMemoryPlayer({player: 'not-a-player', evidence: os.tmpdir(), port: 9227,
    pausedHeap: 'true'}), /LGUI-RT-001.*pausedHeap.*boolean/);
});

test('paused heap appends after the original and fixed GC samples without replacing any old raw field', () => {
  // Protocol execution/abort/cleanup has real WS fixtures in paused-heap.test.mjs.
  // This contract protects its opt-in location in the native Player orchestrator.
  const source = fs.readFileSync(new URL('../../unity/acceptance/memory-host.mjs', import.meta.url), 'utf8');
  assert.match(source, /runMemoryPlayer\(\{[^}]*pausedHeap = false/);
  const alternating = source.indexOf('if (alternatingGC)');
  const paused = source.indexOf('if (pausedHeap)');
  const resume = source.indexOf('globalThis.__lguiResumeSample({recordedByHost:true})');
  assert.ok(alternating > 0 && paused > alternating && resume > paused,
    'Append the paused diagnostic after the unchanged samples, before resuming the case');
  const block = source.slice(paused, source.indexOf('// Keep measurements', paused));
  assert.match(block, /sample\.pausedHeap\s*=\s*await collectPausedHeap\(snapshot\?\.client \?\? client,/);
  assert.match(block, /sample\.pausedHeap\.processAfter\s*=\s*await sampleProcess\(pid\)/);
  assert.match(block, /onFailure:[\s\S]*paused-failure\.json/);
  assert.match(block, /paused-heap\.json/);
  assert.match(block, /save\(path\.join\(evidence, 'samples\.json'\), samples\)/);
  assert.doesNotMatch(block, /sample\.(heap|native|collection|heapFrames|alternatingGC)\s*=/);
  assert.doesNotMatch(block, /signal:\s*signal\b/,
    'The outer Player lifetime signal must not abort cleanup inside the helper');
  assert.match(source, /measurement\.json'\), \{acquisitionCompleted: true, acceptancePassed: null,[^\n]*pausedHeap/);
});

test('CLI paused-heap flag requires explicit true and forwards that value without a memory pass verdict', () => {
  const source = fs.readFileSync(new URL('../../unity/acceptance/memory-host.mjs', import.meta.url), 'utf8');
  assert.match(source, /options\['paused-heap'\] !== undefined && options\['paused-heap'\] !== 'true'/);
  assert.match(source, /pausedHeap: options\['paused-heap'\] === 'true'/);
  assert.doesNotMatch(source, /acceptancePassed:\s*true/);
});

test('heap snapshots are an explicit boolean and require the settled paused control', async () => {
  const {runMemoryPlayer} = await import('../../unity/acceptance/memory-host.mjs');
  const base = {player: 'not-a-player', evidence: os.tmpdir(), port: 9227};
  await assert.rejects(runMemoryPlayer({...base, heapSnapshots: 'true'}), /LGUI-RT-001.*heapSnapshots.*boolean/);
  await assert.rejects(runMemoryPlayer({...base, heapSnapshots: true}), /LGUI-RT-001.*memory-settled.*pausedHeap/);
});

test('heap snapshot checkpoints preserve the original heap and only bracket formal 0 and 200', () => {
  const source = fs.readFileSync(new URL('../../unity/acceptance/memory-host.mjs', import.meta.url), 'utf8');
  assert.match(source, /heapSnapshots && point\.series === 'measured' && \[0, 200\]\.includes\(point\.cycle\)/);
  assert.match(source, /createSnapshotClient\(client,/);
  assert.match(source, /sample\.heapSnapshot = snapshot\.report/);
  assert.match(source, /options\['heap-snapshots'\] !== undefined && options\['heap-snapshots'\] !== 'true'/);
  assert.match(source, /heapSnapshots: options\['heap-snapshots'\] === 'true'/);
});
