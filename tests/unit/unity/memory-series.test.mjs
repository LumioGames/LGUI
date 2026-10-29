import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as host from '../../unity/acceptance/memory-host.mjs';
import {createInventoryContext} from '../../unity/acceptance/context.mjs';
import {esbuild} from '../../../plugin/tools/lib/vendor.mjs';

const cycles = [0, 10, 50, 100, 150, 200];
function tracker(scenario) {
  assert.equal(typeof host.createMemorySeriesTracker, 'function', 'Host 必须按 series/cycle 保留两轮完整原始点');
  return host.createMemorySeriesTracker(scenario);
}

test('settled acquisition preserves all 12 points and never finishes at warmup200', () => {
  const acquisition = tracker('memory-settled');
  const points = [];
  for (const series of ['warmup', 'measured']) for (const cycle of cycles) {
    const point = acquisition.take({series, cycle});
    points.push(point);
    assert.equal(point.probeOriginalVM, series === 'warmup' && cycle === 0);
    assert.equal(point.final, series === 'measured' && cycle === 200);
    assert.equal(acquisition.take({series, cycle}), null, 'A duplicate pair cannot overwrite or append a sample');
    assert.equal(acquisition.completed, point.final);
  }
  assert.equal(acquisition.expectedCount, 12);
  assert.deepEqual(points.map(({series, cycle}) => [series, cycle]),
    ['warmup', 'measured'].flatMap(series => cycles.map(cycle => [series, cycle])));
});

test('the original memory scenario remains six measured points without requiring a new series field', () => {
  const acquisition = tracker('memory');
  for (const cycle of cycles) {
    const point = acquisition.take({cycle});
    assert.equal(point.series, 'measured');
    assert.equal(point.probeOriginalVM, cycle === 0);
    assert.equal(point.final, cycle === 200);
  }
  assert.equal(acquisition.expectedCount, 6);
  assert.equal(acquisition.completed, true);
});

test('the host rejects missing, invalid or out-of-order settled checkpoints', () => {
  for (const point of [{cycle: 0}, {series: 'other', cycle: 0}, {series: 'warmup', cycle: -1},
    {series: 'warmup', cycle: 10}, {series: 'warmup', cycle: '0'}, {series: 'measured', cycle: 0}])
    assert.throws(() => tracker('memory-settled').take(point), /LGUI-RT-001/);
  assert.throws(() => tracker('unknown'), /LGUI-RT-001/);
  assert.equal(tracker('memory-settled').take(null), null);
});

test('the generated settled case runs two series in one app and preserves both internal warmup results', async () => {
  const context = await createInventoryContext();
  const entry = path.join(context.root, 'conformance/cases/memory-settled.ts');
  assert.ok(fs.existsSync(entry), 'Inventory context must include the explicit settled-control case');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-memory-series-'));
  const stub = path.join(temp, 'cycles.mjs');
  // Isolate only the orchestration contract. Actual Native cycles remain a Release Player test.
  fs.writeFileSync(stub, `export async function runArtTextCycles(t,{cycles,sample}) {
    const index=t.calls.length;t.calls.push({cycles,t});
    for(const cycle of [0,10,50,100,150,200]) {
      const pending=sample(cycle);await t.observe(index,cycle);t.markers.push(await pending);
    }
    return t.results[index];
  }`);
  const output = path.join(temp, 'case.mjs');
  await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: output,
    logLevel: 'silent', plugins: [{name: 'cycle-orchestration-boundary', setup(build) {
      build.onResolve({filter: /\/acceptance\/memory\.ts$/}, () => ({path: stub}));
    }}]});
  const scenario = (await import(pathToFileURL(output).href)).default;
  const observed = [];
  const t = {calls: [], markers: [], results: [
    {cycles: 200, warmupCycles: 1, warmupTextChanges: 4, textChanges: 800, sentinel: 'warmup-result'},
    {cycles: 200, warmupCycles: 1, warmupTextChanges: 4, textChanges: 800, sentinel: 'measured-result'}
  ], async observe(index, cycle) {
    const point = globalThis.__lguiMemoryPoint;
    assert.deepEqual(point, {series: index === 0 ? 'warmup' : 'measured', cycle});
    observed.push({...point});
    globalThis.__lguiResumeSample({recordedByHost: true});
  }};
  const result = await scenario.run(t);
  assert.deepEqual(t.calls.map(call => call.cycles), [200, 200]);
  assert.ok(t.calls.every(call => call.t === t), 'Both series must use the same test/app context');
  assert.equal(result.warmup, t.results[0]);
  assert.equal(result.measured, t.results[1]);
  assert.equal(result.totalExecutedCycles, 402);
  assert.equal(observed.length, 12);
  assert.deepEqual(t.markers, Array.from({length: 12}, () => ({recordedByHost: true})));
  assert.equal(globalThis.__lguiMemoryPoint, undefined);
  assert.equal(globalThis.__lguiResumeSample, undefined);
});
