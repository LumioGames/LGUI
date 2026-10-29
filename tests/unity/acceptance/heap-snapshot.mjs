// Repository-only one-shot snapshot interception for collectPausedHeap's resume.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

function failure(message, cause) {
  const error = new Error(`LGUI-RT-001 heap-snapshot.mjs: ${message} → Preserve the raw snapshot/report and verify Inspector cleanup.`, {cause});
  error.code = 'LGUI-RT-001';
  return error;
}
const describe = (error, phase) => ({phase, code: error?.code ?? null, message: error?.message ?? String(error)});
function bounded(promise, timeoutMs, label) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(failure(`${label} timed out after ${timeoutMs} ms.`)), timeoutMs);
  })]).finally(() => clearTimeout(timer));
}
function validatePath(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file) || file.includes('\0') || /^[a-z][a-z0-9+.-]*:\/\//i.test(file))
    throw failure('file must be a plain absolute filesystem path.');
  if (fs.existsSync(file) || fs.existsSync(file + '.report.json')) throw failure('Snapshot and report paths must be fresh: ' + file);
  if (!fs.statSync(path.dirname(file)).isDirectory()) throw failure('The snapshot parent must be an existing directory.');
}
function validateGraph(graph) {
  const meta = graph?.snapshot?.meta;
  const nodes = graph?.nodes, edges = graph?.edges, strings = graph?.strings;
  const nodeFields = meta?.node_fields, edgeFields = meta?.edge_fields;
  const fail = detail => { throw failure('Incomplete or invalid heap snapshot schema: ' + detail); };
  for (const [label, fields] of [['node_fields', nodeFields], ['edge_fields', edgeFields]]) {
    if (!Array.isArray(fields) || !fields.length || fields.some(field => typeof field !== 'string') || new Set(fields).size !== fields.length) fail(label);
  }
  if (!Array.isArray(nodes) || !Array.isArray(edges) || !Array.isArray(strings) || strings.some(value => typeof value !== 'string')) fail('nodes/edges/strings');
  const nodeCount = graph.snapshot.node_count, edgeCount = graph.snapshot.edge_count;
  if (!Number.isSafeInteger(nodeCount) || nodeCount <= 0 || !Number.isSafeInteger(edgeCount) || edgeCount < 0 ||
      nodes.length !== nodeCount * nodeFields.length || edges.length !== edgeCount * edgeFields.length) fail('flat table lengths/counts');
  for (const [fields, required] of [[nodeFields, ['type', 'name', 'id', 'self_size', 'edge_count']],
    [edgeFields, ['type', 'name_or_index', 'to_node']]]) if (required.some(field => !fields.includes(field))) fail('required metadata fields');
  // This V8 build emits six node_fields and seven node_types. Only annotations
  // referenced by serialized fields define the table; unused trailing entries
  // must not invalidate an otherwise complete native graph.
  if (!Array.isArray(meta.node_types) || meta.node_types.length < nodeFields.length ||
      !Array.isArray(meta.edge_types) || meta.edge_types.length < edgeFields.length) fail('type metadata for referenced fields');
  for (const [fields, types] of [[nodeFields, meta.node_types], [edgeFields, meta.edge_types]]) {
    for (let index = 0; index < fields.length; index++) {
      const annotation = types[index];
      if (!(typeof annotation === 'string' && ['string', 'number', 'string_or_number', 'node'].includes(annotation)) &&
          !(Array.isArray(annotation) && annotation.length && annotation.every(value => typeof value === 'string')))
        fail('invalid annotation for ' + fields[index]);
    }
  }
  for (const [fields, types, expected] of [[nodeFields, meta.node_types, {name: 'string', id: 'number', self_size: 'number', edge_count: 'number'}],
    [edgeFields, meta.edge_types, {name_or_index: 'string_or_number', to_node: 'node'}]]) {
    for (const [field, annotation] of Object.entries(expected)) if (types[fields.indexOf(field)] !== annotation) fail('annotation for ' + field);
  }
  const nodeTypes = meta.node_types[nodeFields.indexOf('type')], edgeTypes = meta.edge_types[edgeFields.indexOf('type')];
  if (![nodeTypes, edgeTypes].every(types => Array.isArray(types) && types.length && types.every(type => typeof type === 'string'))) fail('type enums');
  if (![nodes, edges].every(table => table.every(value => Number.isSafeInteger(value) && value >= 0))) fail('non-negative integer table values');
  let outgoing = 0;
  for (let offset = 0; offset < nodes.length; offset += nodeFields.length) {
    if (nodes[offset + nodeFields.indexOf('type')] >= nodeTypes.length || nodes[offset + nodeFields.indexOf('name')] >= strings.length) fail('node type/name index');
    outgoing += nodes[offset + nodeFields.indexOf('edge_count')];
  }
  if (outgoing !== edgeCount) fail('per-node edge_count total');
  for (let offset = 0; offset < edges.length; offset += edgeFields.length) {
    const type = edges[offset + edgeFields.indexOf('type')];
    const target = edges[offset + edgeFields.indexOf('to_node')];
    const name = edges[offset + edgeFields.indexOf('name_or_index')];
    if (type >= edgeTypes.length || target >= nodes.length || target % nodeFields.length !== 0) fail('edge type/target index');
    if (!['element', 'hidden'].includes(edgeTypes[type]) && name >= strings.length) fail('edge name index');
  }
  return {nodeCount, edgeCount, nodeFieldCount: nodeFields.length, edgeFieldCount: edgeFields.length, stringCount: strings.length};
}

// Also permits checking retained native evidence without opening an Inspector.
export {validateGraph as validateHeapSnapshotGraph};

/**
 * Wrap only the existing Inspector. collectPausedHeap subscribes to the exact GC pause
 * and performs its ordinary heap read before this wrapper intercepts Debugger.resume.
 * The snapshot and actual resume each have a bounded timeout (default 4s each); give
 * collectPausedHeap's resume cleanup a larger budget (its default is 10s).
 */
export function createSnapshotClient(client, {file, onReport, timeoutMs = 4000} = {}) {
  if (typeof client?.send !== 'function' || typeof client?.onNotification !== 'function') throw failure('A connected existing Inspector is required.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 0x7fffffff) throw failure('timeoutMs must be a positive timer duration.');
  if (onReport !== undefined && typeof onReport !== 'function') throw failure('onReport must be a report callback.');
  try { validatePath(file); }
  catch (error) { throw error.code === 'LGUI-RT-001' ? error : failure('Snapshot path validation failed.', error); }
  let phase = 'ready', pausedEvent = null, report = null;
  async function captureAndResume(params) {
    phase = 'capturing';
    report = {acquisitionCompleted: false, acceptancePassed: null, file, reportFile: file + '.report.json',
      method: 'HeapProfiler.takeHeapSnapshot while Debugger.paused', pausedEvent,
      chunks: 0, bytes: 0, sha256: null, schema: null, commandResponse: null,
      firstCause: null, cleanupErrors: [], cleanup: {resumeAttempted: false, resumeResponse: null},
      interpretation: 'A retained-object graph for offline inspection; no memory acceptance verdict. HeapProfiler remains enabled in this same session to preserve snapshot IDs until the caller closes it.'};
    let firstCause, fd, off, persisted = false, captureEnded = false;
    const hash = createHash('sha256');
    let rejectChunk;
    const chunkFailed = new Promise((_, reject) => { rejectChunk = reject; });
    chunkFailed.catch(() => {});
    try {
      if (pausedEvent?.params?.callFrames?.[0]?.functionName !== 'lguiPostGcSnapshot') throw failure('Snapshot requires the exact paused original-VM GC callback.');
      fd = fs.openSync(file, 'wx');
      off = client.onNotification('HeapProfiler.addHeapSnapshotChunk', params => {
        try {
          if (typeof params?.chunk !== 'string' || !params.chunk) throw failure('Snapshot notification contained no text chunk.');
          const bytes = Buffer.from(params.chunk, 'utf8');
          report.chunks++;
          let offset = 0;
          while (offset < bytes.length) {
            const written = fs.writeSync(fd, bytes, offset, bytes.length - offset);
            if (written <= 0) throw failure('Writing a snapshot chunk made no progress.');
            hash.update(bytes.subarray(offset, offset + written));
            report.bytes += written;
            offset += written;
          }
        } catch (error) { rejectChunk(error); }
      });
      const capture = (async () => {
        await client.send('HeapProfiler.enable');
        // A raced timeout cannot cancel a CDP command already in flight. It must
        // prevent a late enable reply from starting a snapshot after real resume.
        if (captureEnded) return;
        const response = await client.send('HeapProfiler.takeHeapSnapshot', {reportProgress: false});
        if (captureEnded) return;
        report.commandResponse = response;
        if (!response || typeof response !== 'object' || Array.isArray(response))
          throw failure('The snapshot command returned no successful protocol result.');
      })();
      await bounded(Promise.race([capture, chunkFailed]), timeoutMs, 'Snapshot capture');
      if (!report.chunks || !report.bytes) throw failure('Snapshot command completed without any chunks.');
    } catch (error) { firstCause = error; }
    finally {
      captureEnded = true;
      try { off?.(); } catch (error) { report.cleanupErrors.push(describe(error, 'chunk.off')); }
      if (fd !== undefined) {
        try { fs.closeSync(fd); } catch (error) { report.cleanupErrors.push(describe(error, 'close snapshot fd')); }
      }
      report.sha256 = hash.digest('hex');
      report.cleanup.resumeAttempted = true;
      try { report.cleanup.resumeResponse = await bounded(client.send('Debugger.resume', params), timeoutMs, 'Debugger.resume'); }
      catch (error) { report.cleanupErrors.push(describe(error, 'Debugger.resume')); }
    }
    // Parse/validate on the host after actual resume; do not extend the native pause.
    if (!firstCause) {
      try {
        if (fs.statSync(file).size !== report.bytes) throw failure('Snapshot byte count differs from the retained file.');
        report.schema = validateGraph(JSON.parse(fs.readFileSync(file, 'utf8')));
      } catch (error) { firstCause = error; }
    }
    if (!firstCause && report.cleanupErrors.length) firstCause = failure('Snapshot cleanup failed.');
    report.firstCause = firstCause ? describe(firstCause, 'snapshot') : null;
    report.acquisitionCompleted = !firstCause;
    try {
      fs.writeFileSync(report.reportFile, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
      persisted = true;
      if (onReport) await bounded(Promise.resolve().then(() => onReport(report)), timeoutMs, 'Snapshot report callback');
    } catch (error) {
      if (!firstCause) { firstCause = error; report.firstCause = describe(error, 'report persistence'); }
      else report.cleanupErrors.push(describe(error, 'report persistence'));
      report.acquisitionCompleted = false;
      if (persisted) {
        try { fs.writeFileSync(report.reportFile, JSON.stringify(report, null, 2) + '\n'); }
        catch (error) { report.cleanupErrors.push(describe(error, 'report update')); }
      }
    }
    phase = 'finished';
    if (firstCause) {
      const error = failure(`Snapshot capture failed: ${firstCause.message}${report.cleanupErrors.length ? ` (${report.cleanupErrors.length} cleanup/report error(s); inspect diagnostics).` : ''}`, firstCause);
      error.diagnostics = report;
      throw error;
    }
    return report.cleanup.resumeResponse;
  }
  const wrapped = {
    onNotification(method, handler) {
      return client.onNotification(method, (params, raw) => {
        if (method === 'Debugger.paused') pausedEvent = raw;
        return handler(params, raw);
      });
    },
    send(method, params = {}) {
      if (method !== 'Debugger.resume' || phase === 'finished') return client.send(method, params);
      if (phase === 'capturing') return Promise.reject(failure('The one snapshot is already being captured; do not resume concurrently.'));
      return captureAndResume(params);
    },
    close() { client.close(); }
  };
  return {client: wrapped, get report() { return report; }};
}
