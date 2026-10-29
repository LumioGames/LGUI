// Explicit Inspector verification of the actual game VM. Ordinary review runs
// never call this helper and keep LGUIBoot's default debugPort=-1.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {connectInspector, readV8Heap, sampleProcess} from './inspector.mjs';
import {collectPausedHeap} from './paused-heap.mjs';
import {createSnapshotClient} from './heap-snapshot.mjs';
import {runPlayer} from '../player-runner.mjs';

const execute = promisify(execFile);
const failure = message => new Error('LGUI-RT-001 Memory acceptance: ' + message);
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

/** Strict sequence and pair deduplication; no warmup point is discarded. */
export function createMemorySeriesTracker(scenario = 'memory') {
  if (!['memory', 'memory-settled'].includes(scenario)) throw failure('Expected memory or memory-settled scenario.');
  const series = scenario === 'memory-settled' ? ['warmup', 'measured'] : ['measured'];
  const expected = series.flatMap(name => [0, 10, 50, 100, 150, 200].map(cycle => `${name}:${cycle}`));
  const seen = new Set();
  let next = 0;
  return {
    expectedCount: expected.length,
    get completed() { return next === expected.length; },
    take(checkpoint) {
      if (checkpoint === null || checkpoint === undefined) return null;
      const name = checkpoint.series ?? (scenario === 'memory' ? 'measured' : undefined);
      if (!series.includes(name) || !Number.isInteger(checkpoint.cycle) || checkpoint.cycle < 0)
        throw failure('Invalid memory series/cycle checkpoint: ' + JSON.stringify(checkpoint));
      const key = `${name}:${checkpoint.cycle}`;
      if (seen.has(key)) return null;
      if (key !== expected[next]) throw failure(`Expected memory point ${expected[next] ?? '<complete>'}, received ${key}.`);
      seen.add(key);
      const probeOriginalVM = next === 0;
      next++;
      return {series: name, cycle: checkpoint.cycle, probeOriginalVM, final: next === expected.length};
    }
  };
}

async function listenerFor(pid, port) {
  const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const command = `Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction Stop | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Compress`;
  const {stdout} = await execute(executable, ['-NoProfile', '-NonInteractive', '-Command', command], {windowsHide: true});
  const parsed = JSON.parse(stdout);
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  if (!entries.length || entries.some(entry => entry.OwningProcess !== pid)) throw failure('Inspector listener does not belong exclusively to the started Player PID.');
  return entries;
}

async function collectOriginalVM(client) {
  const response = await client.send('Runtime.evaluate', {
    expression: 'new Promise(resolve => CS.LGUI.Tests.PlayerAcceptance.CollectV8(resolve))', awaitPromise: true, returnByValue: true});
  if (response.exceptionDetails) throw failure('Queuing original-VM collection threw: ' + JSON.stringify(response.exceptionDetails));
  const report = JSON.parse(response.result.value);
  if (!report.ok || report.method !== 'JsEnv.Backend.LowMemoryNotification' || report.backend !== 'Puerts.BackendV8' ||
      !report.bootEntityId || !report.environmentIdentity || !Number.isInteger(report.frame) || !Number.isInteger(report.queuedFrame) ||
      report.queuedFrame < 0 || report.queuedFrame >= report.frame) throw failure('Original-VM collection was not acknowledged outside its calling frame: ' + JSON.stringify(report));
  return report;
}

async function collectManaged(client) {
  const response = await client.send('Runtime.evaluate', {
    expression: 'new Promise(resolve => CS.LGUI.Tests.PlayerAcceptance.CollectManaged(resolve))', awaitPromise: true, returnByValue: true});
  if (response.exceptionDetails) throw failure('Managed collection threw: ' + JSON.stringify(response.exceptionDetails));
  const native = JSON.parse(response.result.value);
  if (!native.ok || !native.counts.available) throw failure('Native object enumeration was unavailable: ' + JSON.stringify(native));
  return native;
}

async function readFrame(client) {
  const response = await client.send('Runtime.evaluate', {expression: 'CS.UnityEngine.Time.frameCount', returnByValue: true});
  const value = response.result?.value;
  if (response.exceptionDetails || !Number.isInteger(value) || value < 0) throw failure('Native frame reading failed: ' + JSON.stringify(response));
  return value;
}

async function readBracketedHeap(client) {
  const before = await readFrame(client);
  const heap = await readV8Heap(client);
  const after = await readFrame(client);
  if (after < before) throw failure('Native frame count moved backwards around the heap query.');
  return {heap, heapFrames: {before, after}};
}

/** Fixed diagnostic, never a loop until a desired number: two V8/managed rounds,
 * then one queued V8 collection after the last managed finalizers and Boot.Tick. */
export async function collectAlternatingGC(client, identity, onPhase = () => {}) {
  if (!Array.isArray(identity) || identity.length !== 3 || identity.some(value => typeof value !== 'string' || !value))
    throw failure('A fixed original-VM identity is required for alternating GC diagnostics.');
  const phases = [];
  const checkIdentity = report => {
    if (JSON.stringify([report.backend, report.bootEntityId, report.environmentIdentity]) !== JSON.stringify(identity))
      throw failure('The diagnostic ObjectPool/collection identity differs from the original VM.');
  };
  const record = async (phase, collection = null, native = null) => {
    const {heap, heapFrames} = await readBracketedHeap(client);
    const response = await client.send('Runtime.evaluate', {expression: 'CS.LGUI.Tests.PlayerAcceptance.ObjectPoolSnapshot()', returnByValue: true});
    if (response.exceptionDetails) throw failure('Read-only ObjectPool observation threw: ' + JSON.stringify(response.exceptionDetails));
    const pool = JSON.parse(response.result.value);
    phases.push({phase, collection, native, heap, heapFrames,
      gcToHeapFrames: collection ? heapFrames.before - collection.frame : null, pool});
    await onPhase([...phases]);
    if (!pool.available) throw failure('Read-only ObjectPool observation is unavailable: ' + JSON.stringify(pool));
    checkIdentity(pool);
    if (!pool.scriptEnvIdentity || !Array.isArray(pool.types) ||
        ['capacity', 'highWater', 'referencedSlots', 'activeSlots', 'activeNullSlots'].some(key => !Number.isInteger(pool[key]) || pool[key] < 0) ||
        pool.highWater > pool.capacity || pool.referencedSlots > pool.highWater || pool.activeSlots > pool.highWater || pool.activeNullSlots > pool.activeSlots ||
        pool.types.some(type => typeof type.type !== 'string' || !Number.isInteger(type.count) || type.count <= 0) ||
        pool.types.reduce((sum, type) => sum + type.count, 0) !== pool.activeSlots - pool.activeNullSlots)
      throw failure('Read-only ObjectPool observation has an invalid live-slot schema.');
  };
  await record('before');
  for (let round = 1; round <= 2; round++) {
    const collection = await collectOriginalVM(client);
    checkIdentity(collection);
    await record('after-v8-' + round, collection);
    await record('after-managed-' + round, collection, await collectManaged(client));
  }
  const finalCollection = await collectOriginalVM(client);
  checkIdentity(finalCollection);
  await record('after-v8-final', finalCollection);
  return {rounds: 2, acceptancePassed: null, phases,
    interpretation: 'All phase values are raw. Queued V8 collections run after a later Boot.Tick; no SDK queue is modified and no threshold selects the number of collections.'};
}

/** Proves the explicit GC route with a real temporary JS allocation first. */
export async function probeOriginalVMGC(client) {
  const before = await readV8Heap(client);
  const allocatedResponse = await client.send('Runtime.evaluate', {expression: "globalThis.__lguiGcAllocation=Array.from({length:50000},(_,i)=>({label:'gc-probe-'+i+'x'.repeat(256),values:[i,i+1,i+2]}));globalThis.__lguiGcAllocation.length", returnByValue: true});
  if (allocatedResponse.exceptionDetails || allocatedResponse.result.value !== 50000) throw failure('The temporary JS allocation did not complete.');
  const allocated = await readV8Heap(client);
  const released = await client.send('Runtime.evaluate', {expression: 'delete globalThis.__lguiGcAllocation', returnByValue: true});
  if (released.exceptionDetails || released.result.value !== true) throw failure('The temporary JS allocation was not released.');
  const collection = await collectOriginalVM(client);
  const collected = await readV8Heap(client);
  if (allocated.usedSize <= before.usedSize || collected.usedSize >= allocated.usedSize) throw failure('Allocation/release/collection did not demonstrate an actual heap decrease: ' + JSON.stringify({before, allocated, collected}));
  return {method: 'Explicit queued original JsEnv.Backend.LowMemoryNotification; Inspector Runtime.getHeapUsage', before, allocated, collection, collected};
}

/** Records every post-GC point in either the original or same-VM settled control. */
export async function runMemoryPlayer({player, evidence, port, scenario = 'memory', alternatingGC = false, graphical = false, pausedHeap = false, heapSnapshots = false}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw failure('Choose an explicit verification Inspector port.');
  if (!path.isAbsolute(evidence)) throw failure('Evidence must be an absolute directory.');
  if (typeof alternatingGC !== 'boolean') throw failure('alternatingGC must be an explicit boolean.');
  if (typeof graphical !== 'boolean') throw failure('graphical must be an explicit boolean.');
  if (typeof pausedHeap !== 'boolean') throw failure('pausedHeap must be an explicit boolean.');
  if (typeof heapSnapshots !== 'boolean') throw failure('heapSnapshots must be an explicit boolean.');
  if (heapSnapshots && (scenario !== 'memory-settled' || !pausedHeap))
    throw failure('heapSnapshots requires the explicit memory-settled scenario and pausedHeap sampling.');
  fs.mkdirSync(evidence, {recursive: true});
  const samples = [];
  const tracker = createMemorySeriesTracker(scenario);
  const result = path.join(evidence, 'result.json');
  const log = path.join(evidence, 'Player.log');
  const output = await runPlayer({player, scenario, result, log, graphical, timeoutMs: 240000, inspectorPort: port,
    onStarted: async ({pid, signal}) => {
      const client = await connectInspector({port, signal});
      try {
        save(path.join(evidence, 'inspector-listener.json'), {pid, port, listeners: await listenerFor(pid, port)});
        let identity = null;
        while (!signal.aborted) {
          const response = await client.send('Runtime.evaluate', {expression: 'JSON.stringify(globalThis.__lguiMemoryPoint ?? null)', returnByValue: true});
          if (response.exceptionDetails) throw failure('Reading the memory checkpoint threw: ' + JSON.stringify(response.exceptionDetails));
          const checkpoint = JSON.parse(response.result.value);
          const point = tracker.take(checkpoint);
          if (!point) { await new Promise(resolve => setTimeout(resolve, 25)); continue; }
          if (point.probeOriginalVM) {
            save(path.join(evidence, 'frame-getter-preflight.json'), {frame: await readFrame(client)});
            const probe = await probeOriginalVMGC(client);
            save(path.join(evidence, 'gc-route-probe.json'), probe);
            identity = [probe.collection.backend, probe.collection.bootEntityId, probe.collection.environmentIdentity];
          }
          // First collect JS wrappers; then collect their managed counterparts and
          // finish native destruction, and finally sample JS again after that work.
          const collection = await collectOriginalVM(client);
          if (!identity || JSON.stringify([collection.backend, collection.bootEntityId, collection.environmentIdentity]) !== JSON.stringify(identity)) throw failure('The measured VM/Boot identity changed after the allocation probe.');
          const native = await collectManaged(client);
          const {heap, heapFrames} = await readBracketedHeap(client);
          const process = await sampleProcess(pid);
          const sample = {series: point.series, cycle: point.cycle, collection, native, heap, heapFrames,
            gcToHeapFrames: heapFrames.before - collection.frame, managedToHeapFrames: heapFrames.before - native.frame, process};
          samples.push(sample);
          save(path.join(evidence, 'samples.json'), samples);
          if (alternatingGC) {
            sample.alternatingGC = await collectAlternatingGC(client, identity, phases =>
              save(path.join(evidence, point.series + '-' + point.cycle + '-gc-phases.json'), {acquisitionCompleted: false, phases}));
            sample.alternatingGC.processAfter = await sampleProcess(pid);
            save(path.join(evidence, point.series + '-' + point.cycle + '-gc-phases.json'), {acquisitionCompleted: true, ...sample.alternatingGC});
          }
          if (pausedHeap) {
            const snapshot = heapSnapshots && point.series === 'measured' && [0, 200].includes(point.cycle)
              ? createSnapshotClient(client, {file: path.join(evidence, point.series + '-' + point.cycle + '.heapsnapshot')}) : null;
            try {
              // Keep cancellation local to the diagnostic; its timeout still restores the
              // debugger. The outer Player lifetime retains its existing client.close path.
              const diagnosticSignal = new AbortController().signal;
              sample.pausedHeap = await collectPausedHeap(snapshot?.client ?? client, {signal: diagnosticSignal,
                onFailure: raw => save(path.join(evidence, point.series + '-' + point.cycle + '-paused-failure.json'), raw)});
              save(path.join(evidence, 'samples.json'), samples);
              const pausedIdentity = [sample.pausedHeap.gc.backend, sample.pausedHeap.gc.bootEntityId, sample.pausedHeap.gc.environmentIdentity];
              if (JSON.stringify(pausedIdentity) !== JSON.stringify(identity))
                throw failure('The paused diagnostic VM/Boot identity changed after the allocation probe.');
              sample.pausedHeap.processAfter = await sampleProcess(pid);
              save(path.join(evidence, point.series + '-' + point.cycle + '-paused-heap.json'), sample.pausedHeap);
            } catch (error) {
              // collectPausedHeap already persists its full protocol failure via onFailure.
              // A later identity/process failure must also retain the completed raw snapshot.
              if (!error.diagnostics) save(path.join(evidence, point.series + '-' + point.cycle + '-paused-failure.json'),
                {error: error.message, pausedHeap: sample.pausedHeap ?? null});
              throw error;
            } finally {
              if (snapshot) sample.heapSnapshot = snapshot.report;
              save(path.join(evidence, 'samples.json'), samples);
            }
          }
          save(path.join(evidence, 'samples.json'), samples);
          // Keep measurements in this host only. Injecting every full sample as
          // a new evaluated source and retaining it in the game perturbs its heap.
          const resumed = await client.send('Runtime.evaluate', {expression: 'globalThis.__lguiResumeSample({recordedByHost:true})', returnByValue: true});
          if (resumed.exceptionDetails) throw failure('Resuming the measured case threw: ' + JSON.stringify(resumed.exceptionDetails));
          if (point.final) break;
        }
      } finally { client.close(); }
    }});
  if (!tracker.completed || samples.length !== tracker.expectedCount || samples.at(-1)?.series !== 'measured' || samples.at(-1)?.cycle !== 200)
    throw failure('The Player ended without every required series/cycle sample and the final measured:200 point.');
  save(path.join(evidence, 'measurement.json'), {acquisitionCompleted: true, acceptancePassed: null, scenario, alternatingGC, graphical, pausedHeap, heapSnapshots,
    interpretation: 'Sampling completed. Evaluate the recorded object and heap trends in a separate verdict; this field does not claim memory acceptance.',
    sampling: 'Explicit queued original JsEnv.Backend.LowMemoryNotification and native/managed GC; Inspector reads heap only',
    ordinaryPreviewInspector: -1, samples, result: output.result});
  return {output, samples, scenario};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = Object.fromEntries(process.argv.slice(2).reduce((entries, value, index, all) => value.startsWith('--') ? [...entries, [value.slice(2), all[index + 1]]] : entries, []));
  if (options['alternating-gc'] !== undefined && options['alternating-gc'] !== 'true') throw failure('Use --alternating-gc true for the fixed diagnostic.');
  if (options.graphical !== undefined && options.graphical !== 'true') throw failure('Use --graphical true for the normal rendered Player.');
  if (options['paused-heap'] !== undefined && options['paused-heap'] !== 'true') throw failure('Use --paused-heap true for the explicit paused diagnostic.');
  if (options['heap-snapshots'] !== undefined && options['heap-snapshots'] !== 'true') throw failure('Use --heap-snapshots true for formal 0/200 retained-graph diagnostics.');
  const output = await runMemoryPlayer({player: options.player, evidence: options.evidence, port: Number(options.port), scenario: options.scenario ?? 'memory', alternatingGC: options['alternating-gc'] === 'true', graphical: options.graphical === 'true', pausedHeap: options['paused-heap'] === 'true', heapSnapshots: options['heap-snapshots'] === 'true'});
  console.log(JSON.stringify({scenario: output.scenario, acquisitionCompleted: true, acceptancePassed: null,
    cycles: output.samples.at(-1).cycle, samples: output.samples.map(sample => ({series: sample.series, cycle: sample.cycle,
    jsUsed: sample.heap.usedSize, nativeObjects: sample.native.counts.displayObjectInfos, detachedLoaders: sample.native.counts.detachedLoaders,
    managedUsed: sample.native.managedHeap.bytes, privateBytes: sample.process.privateMemorySize64,
    pausedJsUsed: sample.pausedHeap?.heap.usedSize ?? null, pausedFrameGap: sample.pausedHeap?.frameGap ?? null}))}, null, 2));
}
