// Explicit native acceptance tools. Uses the existing Player's Inspector, never another JS VM.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execute = promisify(execFile);
function failure(message, cause) {
  const error = new Error(`LGUI-RT-001 inspector.mjs: ${message} → Check the explicit Player Inspector port, native logs and sampling checkpoint.`, {cause});
  error.code = 'LGUI-RT-001';
  return error;
}

function abortError(signal) {
  return signal.reason?.code === 'LGUI-RT-001' ? signal.reason : failure('Inspector operation was aborted.', signal.reason);
}

function waitForRetry(signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(abortError(signal)); return; }
    const aborted = () => { clearTimeout(timer); reject(abortError(signal)); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', aborted); resolve(); }, 50);
    signal.addEventListener('abort', aborted, {once: true});
  });
}

function discoveryURL(targets, port) {
  if (!Array.isArray(targets) || targets.length !== 1 || typeof targets[0]?.webSocketDebuggerUrl !== 'string')
    throw failure('Inspector discovery must expose exactly one WebSocket target.');
  let url;
  try { url = new URL(targets[0].webSocketDebuggerUrl); }
  catch (error) { throw failure('Inspector discovery returned an invalid WebSocket URL.', error); }
  if (url.protocol !== 'ws:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      Number(url.port || 80) !== port || url.username || url.password || url.hash)
    throw failure('Inspector discovery returned a target outside the requested localhost port.');
  return url.href;
}

function openClient(url, timeoutMs, signal, onClosed) {
  return new Promise((resolve, reject) => {
    let socket;
    try { socket = new WebSocket(url); }
    catch (error) { reject(failure('Inspector WebSocket could not be created.', error)); return; }
    const pending = new Map();
    const notifications = new Map();
    let nextId = 1;
    let ended;
    let opened = false;
    function finish(error) {
      if (ended) return;
      ended = error;
      if (!opened) reject(error);
      for (const item of pending.values()) { clearTimeout(item.timer); item.reject(error); }
      pending.clear();
      for (const listeners of notifications.values()) {
        for (const subscription of listeners) subscription.handler = undefined;
        listeners.clear();
      }
      notifications.clear();
      signal.removeEventListener('abort', aborted);
      socket.removeEventListener('open', open);
      socket.removeEventListener('message', message);
      socket.removeEventListener('error', networkError);
      socket.removeEventListener('close', closed);
      onClosed();
      try { socket.close(); } catch { /* Already closed; the original failure is retained. */ }
    }
    const client = {
      onNotification(method, handler) {
        if (ended) throw ended;
        if (typeof method !== 'string' || !method || typeof handler !== 'function')
          throw failure('A notification subscription requires a method and handler.');
        const subscription = {handler};
        let listeners = notifications.get(method);
        if (!listeners) { listeners = new Set(); notifications.set(method, listeners); }
        listeners.add(subscription);
        return () => {
          listeners.delete(subscription);
          subscription.handler = undefined;
          if (!listeners.size && notifications.get(method) === listeners) notifications.delete(method);
        };
      },
      send(method, params = {}) {
        if (ended) return Promise.reject(ended);
        if (!opened || socket.readyState !== WebSocket.OPEN) return Promise.reject(failure('Inspector WebSocket is not open.'));
        if (typeof method !== 'string' || !method || params === null || typeof params !== 'object' || Array.isArray(params))
          return Promise.reject(failure('A CDP command requires a method and object params.'));
        const id = nextId++;
        return new Promise((resolveCommand, rejectCommand) => {
          const timer = setTimeout(() => {
            pending.delete(id);
            rejectCommand(failure(`Inspector command ${method} timed out after ${timeoutMs} ms.`));
          }, timeoutMs);
          pending.set(id, {method, timer, resolve: resolveCommand, reject: rejectCommand});
          try { socket.send(JSON.stringify({id, method, params})); }
          catch (error) {
            clearTimeout(timer);
            pending.delete(id);
            rejectCommand(failure(`Inspector command ${method} could not be sent.`, error));
          }
        });
      },
      close() { finish(failure('Inspector client was closed.')); }
    };
    function open() {
      opened = true;
      resolve(client);
    }
    function message(event) {
      let value;
      try {
        if (typeof event.data !== 'string') throw new Error('Expected a text frame.');
        value = JSON.parse(event.data);
      } catch (error) { finish(failure('Inspector protocol returned malformed JSON or a non-text frame.', error)); return; }
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        finish(failure('Inspector protocol returned a non-object message.'));
        return;
      }
      if (!Object.hasOwn(value, 'id')) {
        if (typeof value.method !== 'string' || !value.method ||
            (Object.hasOwn(value, 'params') && (value.params === null || typeof value.params !== 'object' || Array.isArray(value.params)))) {
          finish(failure('Inspector protocol returned an invalid notification.'));
          return;
        }
        for (const subscription of [...(notifications.get(value.method) ?? [])]) {
          if (ended) break;
          if (!notifications.get(value.method)?.has(subscription)) continue;
          try {
            const result = subscription.handler(value.params ?? {}, value);
            // Rejected async handlers must be observable through the same client failure path.
            if (result && typeof result.then === 'function') Promise.resolve(result).catch(error =>
              finish(failure(`Inspector notification ${value.method} handler failed.`, error)));
          } catch (error) { finish(failure(`Inspector notification ${value.method} handler failed.`, error)); }
        }
        return;
      }
      const item = pending.get(value.id);
      if (!Number.isSafeInteger(value.id) || !item) { finish(failure('Inspector protocol returned an unexpected response id.')); return; }
      const hasError = Object.hasOwn(value, 'error');
      if (hasError === Object.hasOwn(value, 'result') ||
          (hasError ? !Number.isFinite(value.error?.code) || typeof value.error?.message !== 'string' :
            value.result === null || typeof value.result !== 'object' || Array.isArray(value.result))) {
        finish(failure(`Inspector protocol returned an invalid response for ${item.method}.`));
        return;
      }
      clearTimeout(item.timer);
      pending.delete(value.id);
      if (hasError) item.reject(failure(`Inspector command ${item.method} failed (${value.error.code}): ${value.error.message}`));
      else item.resolve(value.result);
    }
    function aborted() { finish(abortError(signal)); }
    function networkError(event) { finish(failure('Inspector WebSocket failed.', event.error)); }
    function closed() { finish(failure('Inspector WebSocket was closed by the native endpoint.')); }
    socket.addEventListener('open', open);
    socket.addEventListener('message', message);
    socket.addEventListener('error', networkError);
    socket.addEventListener('close', closed);
    signal.addEventListener('abort', aborted, {once: true});
    if (signal.aborted) aborted();
  });
}

export async function connectInspector({port, timeoutMs = 10000, signal} = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw failure('Inspector port must be an integer from 1 to 65535.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 0x7fffffff) throw failure('Inspector timeoutMs must be a positive timer duration.');
  if (signal !== undefined && !(signal instanceof AbortSignal)) throw failure('Inspector signal must be an AbortSignal.');
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal.reason);
  const detach = () => signal?.removeEventListener('abort', forwardAbort);
  signal?.addEventListener('abort', forwardAbort, {once: true});
  if (signal?.aborted) forwardAbort();
  const timer = setTimeout(() => controller.abort(failure(`Inspector connection timed out after ${timeoutMs} ms.`)), timeoutMs);
  let client;
  try {
    while (!controller.signal.aborted) {
      let response;
      try {
        response = await fetch(`http://127.0.0.1:${port}/json/list`, {signal: controller.signal, redirect: 'error'});
      } catch (error) {
        if (controller.signal.aborted) throw abortError(controller.signal);
        // A Player may not have opened its Inspector yet; retry only this readiness condition.
      }
      if (response?.ok) {
        let targets;
        try { targets = await response.json(); }
        catch (error) { throw controller.signal.aborted ? abortError(controller.signal) : failure('Inspector discovery returned malformed JSON.', error); }
        client = await openClient(discoveryURL(targets, port), timeoutMs, controller.signal, detach);
        return client;
      }
      if (response) await response.body?.cancel();
      await waitForRetry(controller.signal);
    }
    throw abortError(controller.signal);
  } finally {
    clearTimeout(timer);
    if (!client) detach();
  }
}

export async function sampleV8(client) {
  if (typeof client?.send !== 'function') throw failure('V8 sampling requires a connected Inspector client.');
  await client.send('HeapProfiler.collectGarbage');
  return readV8Heap(client);
}

// Deliberately separate: callers must explicitly collect the original VM before a post-GC sample.
export async function readV8Heap(client) {
  if (typeof client?.send !== 'function') throw failure('V8 heap reading requires a connected Inspector client.');
  const heap = await client.send('Runtime.getHeapUsage');
  if (heap === null || typeof heap !== 'object' || Array.isArray(heap)) throw failure('V8 heap response must be a native object.');
  const sample = {};
  for (const key of ['usedSize', 'totalSize', 'embedderHeapUsedSize', 'backingStorageSize']) {
    if (!Object.hasOwn(heap, key) && key !== 'usedSize' && key !== 'totalSize') continue;
    if (typeof heap[key] !== 'number' || !Number.isFinite(heap[key]) || heap[key] < 0)
      throw failure(`V8 heap field ${key} must be a finite, non-negative native number.`);
    sample[key] = heap[key];
  }
  return sample;
}

export async function sampleProcess(pid) {
  if (!Number.isInteger(pid) || pid <= 0 || pid > 0x7fffffff) throw failure('A process sample requires a positive integer PID.');
  if (process.platform !== 'win32') throw failure('External process memory sampling requires Windows PowerShell.');
  const script = `$ErrorActionPreference = 'Stop'\n` +
    `$lguiObservedProcess = Get-Process -Id ${pid} -ErrorAction Stop\n` +
    `[pscustomobject]@{pid=$lguiObservedProcess.Id;privateMemorySize64=$lguiObservedProcess.PrivateMemorySize64;workingSet64=$lguiObservedProcess.WorkingSet64} | ConvertTo-Json -Compress`;
  let sample;
  try {
    const {stdout} = await execute('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script],
      {windowsHide: true, timeout: 10000, maxBuffer: 65536, encoding: 'utf8'});
    sample = JSON.parse(stdout.trim());
  } catch (error) { throw failure(`External memory query failed for PID ${pid}.`, error); }
  if (sample?.pid !== pid || !Number.isSafeInteger(sample.privateMemorySize64) || sample.privateMemorySize64 < 0 ||
      !Number.isSafeInteger(sample.workingSet64) || sample.workingSet64 < 0)
    throw failure(`External memory query returned invalid data for PID ${pid}.`);
  return {pid, privateMemorySize64: sample.privateMemorySize64, workingSet64: sample.workingSet64};
}
