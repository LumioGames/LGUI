// Explicit diagnostic of one existing Player VM at an idle memory checkpoint.
// Debugger suspension is a sampling instrument, not a replacement for normal cycle acceptance.
import {readV8Heap} from './inspector.mjs';

const collectExpression = 'new Promise(resolve=>CS.LGUI.Tests.PlayerAcceptance.CollectV8(function lguiPostGcSnapshot(report){debugger;resolve(report)}))';
const frameExpression = 'CS.UnityEngine.Time.frameCount';
const poolExpression = 'CS.LGUI.Tests.PlayerAcceptance.ObjectPoolSnapshot()';
const activeClients = new WeakSet();

function failure(message, cause) {
  const error = new Error(`LGUI-RT-001 paused-heap.mjs: ${message} → Preserve this diagnostic and verify the original Player VM and Inspector cleanup.`, {cause});
  error.code = 'LGUI-RT-001';
  return error;
}
function describe(error, phase) {
  return {phase, code: error?.code ?? null, message: error?.message ?? String(error),
    cause: error?.cause?.message ?? null};
}
function bounded(promise, timeoutMs, label) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(failure(`${label} timed out after ${timeoutMs} ms.`)), timeoutMs);
  })]).finally(() => clearTimeout(timer));
}
function remoteValue(response, label) {
  if (response?.exceptionDetails) throw failure(`${label} threw in the original VM: ${JSON.stringify(response.exceptionDetails)}`);
  if (!response?.result || !Object.hasOwn(response.result, 'value')) throw failure(`${label} did not return a by-value result.`);
  return response.result.value;
}
function frameValue(response, label) {
  const value = remoteValue(response, label);
  if (!Number.isSafeInteger(value) || value < 0) throw failure(`${label} must return a non-negative integer native frame.`);
  return value;
}
function jsonValue(response, label) {
  const value = remoteValue(response, label);
  if (typeof value !== 'string') throw failure(`${label} did not return the native JSON string.`);
  let parsed;
  try { parsed = JSON.parse(value); }
  catch (error) { throw failure(`${label} returned invalid JSON.`, error); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw failure(`${label} returned a non-object report.`);
  return parsed;
}
function validateIdentity(value, label) {
  if (value.backend !== 'Puerts.BackendV8' ||
      !['bootEntityId', 'environmentIdentity'].every(key => typeof value[key] === 'string' && value[key]) ||
      !Number.isSafeInteger(value.frame) || value.frame < 0)
    throw failure(`${label} did not identify the existing V8 VM and native frame.`);
}

/**
 * The caller keeps client alive until this resolves/rejects; a diagnostic AbortSignal does
 * not close that client, so resume/disable can still run. Each cleanup command is bounded
 * independently by timeoutMs even after cancellation. Errors carry .diagnostics and may
 * be persisted by onFailure before rejection. No native or JS VM is constructed here.
 */
export async function collectPausedHeap(client, {timeoutMs = 10000, signal, onFailure} = {}) {
  if (typeof client?.send !== 'function' || typeof client?.onNotification !== 'function')
    throw failure('Paused sampling requires a connected Inspector with notification subscriptions.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 0x7fffffff)
    throw failure('timeoutMs must be a positive timer duration.');
  if (signal !== undefined && !(signal instanceof AbortSignal)) throw failure('signal must be an AbortSignal.');
  if (onFailure !== undefined && typeof onFailure !== 'function') throw failure('onFailure must be a persistence callback.');
  if (activeClients.has(client)) throw failure('Only one paused diagnostic may use an Inspector client at a time.');
  activeClients.add(client);
  const report = {acquisitionCompleted: false, acceptancePassed: null,
    method: 'original-vm-gc-debugger-paused-heap', collectExpression, preflightFrame: null,
    pausedEvents: [], frames: {beforeHeap: null, afterHeap: null}, heap: null,
    objectPool: null, objectPoolResponse: null, gc: null, gcResponse: null, frameGap: null,
    cleanup: {resumeAttempted: false, resumeResponse: null, disableAttempted: false, disableResponse: null},
    firstCause: null, cleanupErrors: []};
  let firstCause;
  let off;
  let debuggerAttempted = false;
  let gcPending;
  let resumeStarted = false;
  let prematureGC = false;
  let resolvePaused;
  const pause = new Promise(resolve => { resolvePaused = resolve; });
  let rejectStopped;
  const stopped = new Promise((_, reject) => { rejectStopped = reject; });
  // May abort before the first raced command is installed.
  stopped.catch(() => {});
  const aborted = () => rejectStopped(failure('Paused heap diagnostic was aborted.', signal.reason));
  signal?.addEventListener('abort', aborted, {once: true});
  if (signal?.aborted) aborted();
  const timer = setTimeout(() => rejectStopped(failure(`Paused heap diagnostic timed out after ${timeoutMs} ms.`)), timeoutMs);
  const step = promise => Promise.race([promise, stopped]);
  const evaluate = expression => client.send('Runtime.evaluate', {expression, returnByValue: true});
  try {
    if (signal?.aborted) await stopped;
    off = client.onNotification('Debugger.paused', (_params, raw) => {
      report.pausedEvents.push(raw);
      resolvePaused(raw);
    });
    // Warm the Time namespace/getter before GC; never first bind it inside the measured heap window.
    report.preflightFrame = frameValue(await step(evaluate(frameExpression)), 'Preflight Time.frameCount');
    debuggerAttempted = true;
    await step(client.send('Debugger.enable'));
    gcPending = client.send('Runtime.evaluate', {expression: collectExpression, awaitPromise: true, returnByValue: true})
      .then(response => { if (!resumeStarted) prematureGC = true; return {response}; }, error => ({error}));
    const event = await step(Promise.race([pause, gcPending.then(outcome => {
      if (outcome.error) throw outcome.error;
      throw failure('GC evaluation completed before the expected debugger pause.');
    })]));
    if (event.params?.callFrames?.[0]?.functionName !== 'lguiPostGcSnapshot')
      throw failure('Debugger did not pause in the exact lguiPostGcSnapshot GC callback.');
    report.frames.beforeHeap = frameValue(await step(evaluate(frameExpression)), 'Time.frameCount before heap');
    report.heap = await step(readV8Heap(client));
    report.frames.afterHeap = frameValue(await step(evaluate(frameExpression)), 'Time.frameCount after heap');
    // Reflection and its JSON result intentionally happen after the heap sample.
    report.objectPoolResponse = await step(evaluate(poolExpression));
    report.objectPool = jsonValue(report.objectPoolResponse, 'ObjectPoolSnapshot');
    if (report.pausedEvents.length !== 1 || prematureGC) throw failure('The diagnostic did not retain one uninterrupted GC callback pause.');
  } catch (error) { firstCause = error; }
  finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', aborted);
    if (debuggerAttempted) {
      resumeStarted = true;
      report.cleanup.resumeAttempted = true;
      try { report.cleanup.resumeResponse = await bounded(client.send('Debugger.resume'), timeoutMs, 'Debugger.resume cleanup'); }
      catch (error) { report.cleanupErrors.push(describe(error, 'Debugger.resume')); }
      report.cleanup.disableAttempted = true;
      try { report.cleanup.disableResponse = await bounded(client.send('Debugger.disable'), timeoutMs, 'Debugger.disable cleanup'); }
      catch (error) { report.cleanupErrors.push(describe(error, 'Debugger.disable')); }
    }
    try { off?.(); }
    catch (error) { report.cleanupErrors.push(describe(error, 'notification.off')); }
    // The awaited Promise can resolve only after the GC callback steps past debugger.
    if (gcPending) {
      try {
        const outcome = await bounded(gcPending, timeoutMs, 'Original GC awaitPromise receipt');
        if (outcome.error) throw outcome.error;
        report.gcResponse = outcome.response;
        report.gc = jsonValue(outcome.response, 'CollectV8');
      } catch (error) {
        if (!firstCause) firstCause = error;
        else report.cleanupErrors.push(describe(error, 'original GC receipt'));
      }
    }
    activeClients.delete(client);
  }
  try {
    if (report.gc) {
      validateIdentity(report.gc, 'CollectV8');
      if (!report.gc.ok || report.gc.method !== 'JsEnv.Backend.LowMemoryNotification' ||
          !Number.isSafeInteger(report.gc.queuedFrame) || report.gc.queuedFrame < 0 || report.gc.queuedFrame >= report.gc.frame)
        throw failure('CollectV8 did not complete the queued original-VM GC in a later native Update.');
    }
    if (!firstCause) {
      if (!report.gc) throw failure('The original GC callback report is missing.');
      validateIdentity(report.objectPool, 'ObjectPoolSnapshot');
      if (!report.objectPool.available || !['bootEntityId', 'environmentIdentity', 'backend'].every(key => report.objectPool[key] === report.gc[key]))
        throw failure('ObjectPoolSnapshot and CollectV8 identity do not refer to the same original VM.');
      if (report.frames.beforeHeap < report.gc.frame || report.frames.afterHeap < report.frames.beforeHeap)
        throw failure('The heap frame bracket precedes GC or reverses native frame order.');
      report.frameGap = {beforeHeapMinusGC: report.frames.beforeHeap - report.gc.frame,
        afterHeapMinusGC: report.frames.afterHeap - report.gc.frame,
        heapReadWindow: report.frames.afterHeap - report.frames.beforeHeap};
    }
  } catch (error) {
    if (!firstCause) firstCause = error;
    else report.cleanupErrors.push(describe(error, 'native report validation'));
  }
  if (!firstCause && report.cleanupErrors.length) firstCause = failure('Paused heap cleanup failed.');
  if (firstCause) {
    report.firstCause = describe(firstCause, 'sampling');
    if (onFailure) {
      try { await bounded(Promise.resolve().then(() => onFailure(report)), timeoutMs, 'Diagnostic persistence'); }
      catch (error) { report.cleanupErrors.push(describe(error, 'onFailure')); }
    }
    const error = failure(`Paused heap diagnostic failed: ${firstCause.message}${report.cleanupErrors.length ? ` (${report.cleanupErrors.length} cleanup/report error(s); inspect diagnostics).` : ''}`, firstCause);
    error.diagnostics = report;
    throw error;
  }
  report.acquisitionCompleted = true;
  return report;
}
