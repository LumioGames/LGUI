import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sendCommand, sleep } from './command.mjs';

const migrationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function assessHostErrors(errors, { mode = 'editor', allowStartupSearchError = false, baselineErrors = null } = {}) {
  if (allowStartupSearchError && mode !== 'editor') throw new Error('The startup Search exception opt-in is only available in Editor mode');
  if (!Array.isArray(errors) || errors.some(error => typeof error !== 'string')) {
    return { ok: false, requiresPartial: allowStartupSearchError, originalStartupErrors: [], unexpectedErrors: [errors], reason: 'Host errors must be an array of full error strings' };
  }
  if (!allowStartupSearchError) return { ok: errors.length === 0, requiresPartial: false, originalStartupErrors: [], unexpectedErrors: [...errors] };
  const isKnown = error => error.includes('ArgumentOutOfRangeException:')
    && /UnityEditor\.Search\.SearchDatabase\+<?EnumerateAll>?/.test(error)
    && error.includes('UnityEditor.Search.SearchDatabase.GetDefaultSearchDatabase')
    && error.includes('UnityEditor.Search.SearchInit.IndexationOnStartup');
  const originalStartupErrors = baselineErrors === null ? errors.filter(isKnown) : [...baselineErrors];
  const remaining = new Map();
  for (const error of originalStartupErrors) remaining.set(error, (remaining.get(error) ?? 0) + 1);
  const unexpectedErrors = originalStartupErrors.filter(error => !isKnown(error));
  for (const error of errors) {
    const available = remaining.get(error) ?? 0;
    if (available > 0 && isKnown(error)) remaining.set(error, available - 1);
    else unexpectedErrors.push(error);
  }
  return { ok: unexpectedErrors.length === 0, requiresPartial: true, originalStartupErrors, unexpectedErrors };
}

export async function runAcceptance(argv = process.argv.slice(2)) {
const directoryArg = argv[0];
if (!directoryArg || directoryArg.startsWith('--')) throw new Error('Usage: node scripts/acceptance.mjs <verification-directory> --mode editor|player [--cycles 200] [--timeout 90000] [--allow-editor-startup-search-error]');
const flag = (name, fallback) => { const at = argv.indexOf(name); return at < 0 ? fallback : argv[at + 1]; };
const directory = path.resolve(directoryArg);
const mode = flag('--mode', 'editor');
const cycles = Number(flag('--cycles', '200'));
const timeoutMs = Number(flag('--timeout', '90000'));
const allowStartupSearchError = argv.includes('--allow-editor-startup-search-error');
assert(['editor', 'player'].includes(mode));
assert(Number.isInteger(cycles) && cycles >= 0 && cycles <= 1000);
assessHostErrors([], { mode, allowStartupSearchError });
const runId = `${mode}-${crypto.randomUUID().slice(0, 8)}`;
const report = {
  schemaVersion: 1, runId, startedAt: new Date().toISOString(), status: 'running', mode,
  inputMethod: 'instrumented file commands on the Unity main thread; not real OS input, mouse clicks, IME, wheel or drag',
  directory, cycles, checks: [], commands: [], screenshots: [], lifecycle: [],
  errorPolicy: { strict: !allowStartupSearchError, allowEditorStartupSearchError: allowStartupSearchError },
  originalStartupErrors: [], partialReasons: allowStartupSearchError ? ['Explicit Editor Search startup-error allowance was enabled; this run cannot establish an error-free startup.'] : [],
  limitations: [
    'UI commands call the platform adapter; this does not prove physical input dispatch.',
    'Command roundtrip includes file polling and at least two Unity frames; it is not pure UI latency.',
    'Runtime instance/listener counts do not establish absence of native or managed resource leaks.',
  ],
};
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
function check(name, value, evidence) {
  report.checks.push({ name, status: value ? 'passed' : 'failed', evidence });
  assert.ok(value, name);
}
function notTested(name, evidence) { report.checks.push({ name, status: 'not-tested', evidence }); }
const business = snapshot => JSON.parse(snapshot.rawTsResponse);
const summary = snapshot => ({
  ready: snapshot.ready, coins: business(snapshot).view.coins, query: business(snapshot).view.query,
  visible: business(snapshot).view.visible.length, session: business(snapshot).session,
  ui: { open: snapshot.ui.open, popup: snapshot.ui.popup, title: snapshot.ui.title, physicalRows: snapshot.ui.physicalRows,
    screenWidth: snapshot.ui.screenWidth, screenHeight: snapshot.ui.screenHeight, scrollY: snapshot.ui.scrollY },
  metrics: snapshot.metrics, errors: snapshot.errors,
});
let sequence = 0;
let startupBaseline = null;
function requireAllowedErrors(errors, captureBaseline = false) {
  const evaluation = assessHostErrors(errors, { mode, allowStartupSearchError, baselineErrors: startupBaseline });
  report.originalStartupErrors = [...evaluation.originalStartupErrors];
  if (captureBaseline && startupBaseline === null) startupBaseline = [...evaluation.originalStartupErrors];
  if (!evaluation.ok) report.unexpectedErrors = evaluation.unexpectedErrors;
  assert(evaluation.ok, `Host errors rejected by ${allowStartupSearchError ? 'explicit startup baseline' : 'strict'} policy: ${JSON.stringify(evaluation.unexpectedErrors)}`);
}
async function command(op, args = {}, label = op) {
  const id = `${runId}-${String(++sequence).padStart(4, '0')}-${op}`;
  const began = performance.now();
  const response = await sendCommand(directory, op, args, { id, timeoutMs: Math.min(timeoutMs, 30000) });
  report.commands.push({ id, label, op, instrumented: response.instrumented, ok: response.ok,
    responseFile: `response-${id}.json`, roundtripMs: performance.now() - began, startFrame: response.startFrame, endFrame: response.endFrame });
  assert.equal(response.instrumented, true, 'Pump response must identify instrumented input');
  assert.equal(response.ok, true, `Pump rejected ${op}: ${JSON.stringify(response.error)}`);
  assert(response.endFrame - response.startFrame >= 2, 'Pump must wait at least two frames');
  assert(response.snapshot?.ready, 'InventoryHost must remain ready');
  requireAllowedErrors(response.snapshot.errors, true);
  if (op === 'screenshot') {
    assert(response.screenshotPath && (await fs.stat(response.screenshotPath)).size > 0, 'Screenshot file must contain data');
    report.screenshots.push({ label, path: response.screenshotPath, screen: { width: response.snapshot.ui.screenWidth, height: response.snapshot.ui.screenHeight } });
  }
  return response.snapshot;
}
async function waitReady() {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = await readJson(path.join(directory, 'latest-snapshot.json'));
      requireAllowedErrors(value.errors ?? []);
      if (value.ready) return;
    } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
    await sleep(100);
  }
  throw new Error(`A ready host was not observed in ${directory}. Start Unity separately with -verificationDir; this script never starts it.`);
}
const inventoryRectFits = snapshot => {
  const rect = snapshot.ui.controls.find(control => control.name === 'inventory')?.rect;
  return rect && rect.x >= -1 && rect.y >= -1 && rect.x + rect.width <= snapshot.ui.screenWidth + 1 && rect.y + rect.height <= snapshot.ui.screenHeight + 1;
};
async function viewport(width, height, label) {
  let snapshot = await command('resize', { width, height }, `${label}-request`);
  const deadline = Date.now() + 4000;
  while ((snapshot.ui.screenWidth !== width || snapshot.ui.screenHeight !== height) && Date.now() < deadline) {
    await sleep(80);
    snapshot = await command('snapshot', {}, `${label}-settle`);
  }
  const actual = { width: snapshot.ui.screenWidth, height: snapshot.ui.screenHeight };
  if (actual.width === width && actual.height === height) {
    check(`${label}: actual screen resolution changed`, true, actual);
    check(`${label}: inventory bounds fit the actual viewport`, inventoryRectFits(snapshot), actual);
  } else if (mode === 'editor') {
    notTested(`${label}: actual viewport resize`, { requested: { width, height }, actual, reason: 'Screen.SetResolution does not resize this Editor Game View; external Game View control is required.' });
  } else check(`${label}: actual screen resolution changed`, false, { requested: { width, height }, actual });
  await command('screenshot', {}, `${label}-actual-screen`);
  return snapshot;
}

try {
  assert((await fs.stat(directory)).isDirectory(), 'Use an existing explicit verification directory');
  const published = await readJson(path.join(migrationRoot, 'assets-publish/publish-report.json'));
  check('source publish evidence is passed and has stable resource IDs', published.status === 'passed'
    && published.unityReferences.packageId === 'invtest1'
    && published.unityReferences.componentIds.Main === 'main0001'
    && published.unityReferences.componentIds.ItemRow === 'itemrow1'
    && published.unityReferences.componentIds.Reward === 'reward01');
  report.source = { archive: published.sourceArchive, sourceFairySha256: published.sourceFairySha256,
    title: published.sourceTitle.text, unityReferences: published.unityReferences };
  await waitReady();
  let snapshot = await command('snapshot');
  let state = business(snapshot);
  report.initial = summary(snapshot);
  check('fresh business state is required', state.view.coins === 0 && state.view.query === ''
    && state.view.items.slice(0, 3).map(item => item.state).join(',') === 'locked,ready,claimed');
  check('loaded title equals the saved browser source', snapshot.ui.title === published.sourceTitle.text, snapshot.ui.title);
  check('actual package and Main/row resource IDs match source', snapshot.ui.packageId === 'invtest1'
    && snapshot.ui.mainResourceId === 'main0001' && snapshot.ui.rowResourceId === 'itemrow1', snapshot.ui);
  check('native virtual list creates fewer rows than total data', snapshot.ui.virtualList && snapshot.ui.physicalRows > 0 && snapshot.ui.physicalRows < state.view.items.length,
    { total: state.view.items.length, physical: snapshot.ui.physicalRows });
  check('one TS listener and one global PuerTS runtime initially', state.session.listenerCount === 1
    && snapshot.metrics.runtimeInstances === 1 && snapshot.metrics.runtimeDisposals === 0);
  check('source transition is present in runtime', snapshot.ui.transitionPresent && snapshot.ui.transitionDuration > 0);
  await command('screenshot', {}, 'initial-source-ui');

  snapshot = await command('query', { query: '药水' });
  check('Chinese query uses the shared TS model', business(snapshot).view.visible.length === Math.ceil(state.view.items.length / 3)
    && business(snapshot).view.query === '药水' && snapshot.ui.inputText === '药水');
  await command('query', { query: '' });
  snapshot = await command('progress');
  check('progress promotes locked and preserves claimed state', business(snapshot).view.items[0].state === 'ready'
    && business(snapshot).view.items[2].state === 'claimed');
  snapshot = await command('claim', { id: 'item-1' });
  state = business(snapshot);
  check('claim awards once and displays native Reward', state.ok && state.view.coins === 10
    && snapshot.ui.popup && snapshot.ui.popupResourceId === 'reward01' && snapshot.ui.popupBody.includes(state.result.message));
  await command('screenshot', {}, 'claimed-reward');
  snapshot = await command('confirm');
  check('confirm closes the native Reward', !snapshot.ui.popup);
  snapshot = await command('claim', { id: 'item-1' });
  check('duplicate claim is rejected by the original TS model', !business(snapshot).ok
    && business(snapshot).error.code === 'claim_rejected' && business(snapshot).view.coins === 10);

  const beforeIds = snapshot.ui.rows.map(row => row.id);
  snapshot = await command('scroll', { y: 550 });
  check('instrumented native ScrollPane changes rows and position', snapshot.ui.scrollY > 0
    && snapshot.ui.rows.some(row => !beforeIds.includes(row.id)), { beforeIds, afterIds: snapshot.ui.rows.map(row => row.id), scrollY: snapshot.ui.scrollY });
  const candidate = snapshot.ui.rows.find(row => row.state === 'ready' && row.claimEnabled);
  assert(candidate, 'A recycled ready row is required');
  snapshot = await command('claim', { id: candidate.id });
  check('stable ID claim for a recycled row changes the matching model item', business(snapshot).view.items.find(item => item.id === candidate.id)?.state === 'claimed'
    && business(snapshot).view.coins === 20, { id: candidate.id, input: 'direct instrumented Host command, not onClick' });
  await command('confirm');
  await viewport(1280, 800, 'wide');
  await viewport(390, 844, 'narrow');
  snapshot = await command('popup');
  check('native explanation popup opens', snapshot.ui.popup && snapshot.ui.popupTitle === '奖励说明');
  await command('screenshot', {}, 'explanation-at-actual-screen');
  await command('confirm');

  snapshot = await command('snapshot');
  const baseline = { coins: business(snapshot).view.coins, instances: snapshot.metrics.runtimeInstances, disposals: snapshot.metrics.runtimeDisposals };
  report.lifecycle.push({ cycles: 0, ...summary(snapshot) });
  for (let index = 0; index < cycles; index++) {
    const closed = await command('close', {}, `cycle-${index + 1}-close`);
    assert.equal(business(closed).session.listenerCount, 0, `cycle ${index + 1} close listener count`);
    assert.equal(business(closed).session.closedCallbacks, 0);
    const opened = await command('open', {}, `cycle-${index + 1}-open`);
    assert.equal(business(opened).session.listenerCount, 1, `cycle ${index + 1} open listener count`);
    assert.equal(business(opened).view.coins, baseline.coins);
    assert.equal(opened.metrics.runtimeInstances, baseline.instances);
    assert.equal(opened.metrics.runtimeDisposals, baseline.disposals);
    if ((index + 1) % 20 === 0 || index === cycles - 1) report.lifecycle.push({ cycles: index + 1, ...summary(opened) });
  }
  snapshot = await command('close');
  const notifications = business(snapshot).session.notifications;
  snapshot = await command('progress', {}, 'closed-business-progress');
  check('closed UI receives no business subscription callback', business(snapshot).session.listenerCount === 0
    && business(snapshot).session.notifications === notifications && business(snapshot).session.closedCallbacks === 0);
  snapshot = await command('open');
  check(`${cycles} instrumented cycles preserve one global runtime and business state`, business(snapshot).session.listenerCount === 1
    && snapshot.metrics.runtimeInstances === 1 && snapshot.metrics.runtimeDisposals === 0 && business(snapshot).view.coins === baseline.coins);
  check('global runtime Tick calls match Host Update frames', snapshot.metrics.tickCalls === snapshot.metrics.updateFrames,
    { tickCalls: snapshot.metrics.tickCalls, updateFrames: snapshot.metrics.updateFrames });
  report.final = summary(snapshot);
  report.status = allowStartupSearchError || report.checks.some(item => item.status === 'not-tested') ? 'partial' : 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = { message: String(error), stack: error.stack };
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  const output = path.join(directory, `acceptance-${runId}.json`);
  await fs.writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, output, checks: report.checks, failure: report.failure }, null, 2));
  if (report.status === 'partial') process.exitCode = 2;
}
return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await runAcceptance();
