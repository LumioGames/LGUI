import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const verificationRoot = path.resolve(here, '..');
const execFileAsync = promisify(execFile);
const defaultZip = path.join(verificationRoot, 'toolchain-test', 'Inventory.zip');
const executablePaths = {
  chrome: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  edge: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
};

export function assertLoopback(value) {
  const url = new URL(value);
  assert.ok(['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol), `Unexpected protocol: ${url.protocol}`);
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname), `Only loopback URLs allowed: ${value}`);
  return url;
}

export const sha256 = value => createHash('sha256').update(value).digest('hex');

export async function uiState(page) {
  return page.evaluate(() => ({
    url: location.href,
    attributes: Object.fromEntries([...document.documentElement.attributes, ...document.body.attributes]
      .filter(item => item.name.startsWith('data-fairy-editor'))
      .map(item => [item.name, item.value])),
    inputs: [...document.querySelectorAll('input,textarea')].map(item => ({
      tag: item.tagName, type: item.type, visible: !!item.getClientRects().length,
      value: item.type === 'file' ? undefined : item.value,
      picker: item.dataset.fairyEditorFilePicker,
    })),
    globals: Object.keys(window).filter(key => /fairy.*agent|agent.*fairy|fairy.*rpc/i.test(key)),
  }));
}

// Only inspect the visible FairyGUI tree. Mouse/keyboard perform the actual UI action.
export async function readUiTree(page) {
  return page.evaluate(() => {
    const root = window.fgui?.GRoot?.inst;
    if (!root) return [];
    const canvas = document.querySelector('canvas')?.getBoundingClientRect();
    const stage = window.Laya?.stage;
    const sx = canvas && stage?.width ? canvas.width / stage.width : 1;
    const sy = canvas && stage?.height ? canvas.height / stage.height : 1;
    const output = [];
    const seen = new WeakSet();
    const walk = (object, ancestors, parentVisible) => {
      if (!object || seen.has(object)) return;
      seen.add(object);
      const visible = parentVisible && object.visible !== false && object.internalVisible !== false && object.displayObject?.visible !== false;
      let position;
      try { position = object.localToGlobal(0, 0); } catch { position = { x: 0, y: 0 }; }
      const names = [...ancestors, String(object.name || '')];
      const rawData = object.treeNode?.data || object.data;
      const data = rawData && typeof rawData === 'object'
        ? Object.fromEntries(['kind', 'packageId', 'componentId', 'resourceId', 'nodeId'].filter(key => typeof rawData[key] === 'string').map(key => [key, rawData[key]]))
        : typeof rawData === 'string' ? rawData : undefined;
      output.push({
        names, name: String(object.name || ''), visible, type: object.constructor?.name,
        isButton: !!window.fgui?.GButton && object instanceof window.fgui.GButton,
        text: typeof object.text === 'string' ? object.text : undefined,
        title: typeof object.title === 'string' ? object.title : undefined,
        resource: object.resourceURL, package: object.packageItem?.owner?.name, data,
        bounds: { x: (canvas?.x || 0) + position.x * sx, y: (canvas?.y || 0) + position.y * sy,
          width: object.width * sx, height: object.height * sy },
      });
      const count = typeof object.numChildren === 'number' ? object.numChildren : 0;
      for (let i = 0; i < count; i++) walk(object.getChildAt(i), names, visible);
    };
    walk(root, [], true);
    return output;
  });
}

export async function waitUntil(read, predicate, label, timeout = 25_000) {
  const deadline = Date.now() + timeout;
  let value;
  while (Date.now() < deadline) {
    value = await read();
    if (predicate(value)) return value;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(value).slice(0, 700)}`);
}

async function clickUiMatch(page, predicate, label, click = {}) {
  const matches = (await readUiTree(page)).filter(item => item.visible && item.isButton && predicate(item)
    && item.bounds.width > 0 && item.bounds.height > 0);
  assert.equal(matches.length, 1, `${label}: expected one visible button, found ${matches.length}`);
  const b = matches[0].bounds;
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2, click);
  return matches[0];
}

async function openMainAndSelectTitle(page) {
  await clickUiMatch(page, item => item.names.includes('projectLibraryView') && item.data?.packageId === 'invtest1' && item.data?.componentId === 'main0001', 'Main resource', { clickCount: 2 });
  await waitUntil(() => readUiTree(page), tree => tree.some(item => item.visible && item.data?.nodeId === 'title'), 'Main hierarchy');
  await clickUiMatch(page, item => item.data?.nodeId === 'title', 'title hierarchy row');
  await waitUntil(() => readUiTree(page), tree => tree.some(item => item.visible && item.name === 'commandTextPanel'), 'text Inspector');
}

async function inspectorTextViaUi(page, value) {
  await clickNamedUi(page, 'text', { ancestor: 'commandTextPanel' });
  await page.waitForFunction(() => ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName));
  // The editor intercepts Ctrl+A globally; fill the visible native input instead.
  const input = page.locator('textarea:focus,input:focus');
  assert.equal(await input.count(), 1, 'Exactly one native Inspector input must have focus');
  await input.fill(value);
  // Clicking a static Inspector label blurs without changing the selected node.
  await clickNamedUi(page, 'n17', { ancestor: 'commandTextPanel' });
}

async function createRelay(page, save) {
  const connectionPath = path.join(here, 'agent-connection.local.json');
  const connection = JSON.parse(await fs.readFile(connectionPath, 'utf8'));
  const baseUrl = connection.baseUrl || connection.url;
  assert.ok(typeof baseUrl === 'string', 'Connection file needs baseUrl');
  assertLoopback(baseUrl);
  assert.ok(typeof connection.token === 'string' && connection.token.length > 0, 'Connection file needs a relay token');
  const clientId = await page.evaluate(() => window.fairyEditorAgent?.clientId);
  assert.ok(clientId, 'Dev-only fairyEditorAgent must be mounted for ?agent=1');
  let sequence = 0;
  const fetchLocal = async (pathname, init = {}) => {
    const target = new URL(pathname, baseUrl); assertLoopback(target.href);
    const response = await fetch(target, { ...init, headers: { Authorization: `Bearer ${connection.token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30_000) });
    assert.ok(response.ok, `Relay HTTP ${response.status}`);
    return response.json();
  };
  const listing = await waitUntil(() => fetchLocal('/__fairy_agent/clients'), result => {
    const clients = Array.isArray(result) ? result : result.clients || result.data?.clients || [];
    return clients.some(client => (typeof client === 'string' ? client : client.clientId) === clientId);
  }, 'this browser relay client');
  await save('relay-client-selection.json', { clientId, listing });
  const call = async request => {
    const result = await fetchLocal('/__fairy_agent/rpc', { method: 'POST', body: JSON.stringify({ clientId, request }) });
    await save(`rpc-${String(++sequence).padStart(3, '0')}-${request.method}.json`, { request, result });
    return result;
  };
  call.securityProbes = async () => {
    const noToken = await fetch(new URL('/__fairy_agent/clients', baseUrl), { signal: AbortSignal.timeout(10_000) });
    const wrongClient = await fetch(new URL('/__fairy_agent/rpc', baseUrl), { method: 'POST', headers: { Authorization: `Bearer ${connection.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: `not-this-client-${randomUUID()}`, request: { method: 'state' } }), signal: AbortSignal.timeout(10_000) });
    const probes = { noTokenStatus: noToken.status, wrongClientStatus: wrongClient.status };
    await save('relay-auth-and-client-probes.json', probes);
    return probes;
  };
  return call;
}

const selector = { packageId: 'invtest1', componentResourceId: 'main0001', displayNodeId: 'title' };
const successData = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
const titleOf = project => project.packages.find(pkg => pkg.id === selector.packageId).resources.find(resource => resource.id === selector.componentResourceId).component.displayList.find(node => node.id === 'title');
function projectSemantics(project) {
  const output = structuredClone(project);
  for (const pkg of output.packages) for (const resource of pkg.resources) {
    delete resource.sourcePath; // storage addresses may change when the workspace reopens
    delete resource.sourceBytes; // ZIP bytes are separately inspected; do not confuse storage representation with UI semantics
    for (const node of resource.component?.displayList || []) if (node.resource) node.resource.packageId ||= pkg.id;
  }
  return output;
}

async function closedLoopAcceptance(harness) {
  const { page, report, save, check, evidence } = harness;
  await page.waitForFunction(() => window.fairyEditorAgent?.schemaVersion === 1, null, { timeout: 30_000 });
  const rpc = await createRelay(page, save);
  const query = async () => successData(await rpc({ method: 'query' }));
  const mutation = (method, identity, extra = {}) => ({ method, identity, requestId: randomUUID(), ...extra });
  await save('import-result.json', await importInventoryViaUi(page));
  const before = await query(); await save('before-uam.json', before);
  check('correct Inventory IDs', !!titleOf(before.entity) && before.entity.packages[0].id === 'invtest1');
  check('UI/backend revision aligned at baseline', before.identity.revision === before.editor.revision && before.identity.revision === before.backend.revision);
  const security = await rpc.securityProbes();
  check('relay rejects missing token and wrong client', security.noTokenStatus === 401 && security.wrongClientStatus === 409);
  const raceSelector = { ...selector, displayNodeId: 'summary' };
  const raceRequests = ['A', 'B'].map(suffix => mutation('transact', before.identity, { operations: [{ kind: 'setDisplayNodeProps', selector: raceSelector, props: { text: `并发验收${suffix}` } }] }));
  const race = await Promise.all(raceRequests.map(request => rpc(request)));
  const afterRace = await query();
  check('concurrent same-revision writes have one winner', race.filter(result => result.ok).length === 1 && race.filter(result => !result.ok && result.error?.code === 'stale_write').length === 1 && afterRace.identity.revision === before.identity.revision + 1);
  successData(await rpc(mutation('undo', afterRace.identity)));
  assert.deepEqual(projectSemantics((await query()).entity), projectSemantics(before.entity), 'race probe undo restores initial project');
  const sourceZipHash = sha256(await fs.readFile(defaultZip));
  await openMainAndSelectTitle(page);
  const uiText = '旅者背包 · Inspector已修复';
  await inspectorTextViaUi(page, uiText);
  const afterUi = await waitUntil(query, data => titleOf(data.entity).text === uiText, 'Inspector text transaction');
  const expectedUi = structuredClone(before.entity); titleOf(expectedUi).text = uiText;
  assert.deepEqual(projectSemantics(afterUi.entity), projectSemantics(expectedUi), 'Inspector text edit changes no unrelated project fields');
  check('Inspector preserves unrelated project content', true);
  check('Inspector commits through shared session', afterUi.identity.sessionId === before.identity.sessionId && afterUi.identity.revision > before.identity.revision && afterUi.editor.dirty === true);
  check('UI mutation reaches Agent query without save', afterUi.identity.revision === afterUi.editor.revision && afterUi.identity.revision === afterUi.backend.revision && afterUi.editor.savedStateId === before.editor.savedStateId && afterUi.editor.currentStateId !== afterUi.editor.savedStateId);
  await page.screenshot({ path: path.join(evidence, 'inspector-ui-unsaved.png') });
  const properties = { text: '旅者背包 · 同会话Agent', position: { x: titleOf(afterUi.entity).position.x + 12, y: titleOf(afterUi.entity).position.y + 5 }, color: '#8DF0C4' };
  const operations = [{ kind: 'setDisplayNodeProps', selector, props: properties }];
  const agentRequest = mutation('transact', afterUi.identity, { operations, summary: 'Acceptance: text, position and color from independent Node HTTP client' });
  successData(await rpc({ method: 'preflight', identity: afterUi.identity, operations }));
  assert.deepEqual((await query()).entity, afterUi.entity, 'preflight changes no UAM');
  const applied = successData(await rpc(agentRequest));
  const afterAgent = await query(); await save('after-agent-uam.json', afterAgent);
  const expectedAgent = structuredClone(afterUi.entity); Object.assign(titleOf(expectedAgent), properties, { color: properties.color.toLowerCase() });
  assert.deepEqual(projectSemantics(afterAgent.entity), projectSemantics(expectedAgent), 'Agent transaction changes only its declared properties');
  check('Agent preserves unrelated project content', true);
  const title = titleOf(afterAgent.entity);
  check('Agent applies three property classes', title.text === properties.text && title.position.x === properties.position.x && title.position.y === properties.position.y && title.color.toUpperCase() === properties.color);
  check('Agent remains on UI session and aligned revision', applied.identity.sessionId === afterUi.identity.sessionId && afterAgent.identity.revision === afterAgent.editor.revision && afterAgent.identity.revision === afterAgent.backend.revision);
  const retry = await rpc(agentRequest);
  check('exact retry is idempotent', retry.ok && retry.replayed && (await query()).identity.revision === afterAgent.identity.revision);
  const conflict = await rpc({ ...agentRequest, summary: 'Conflicting payload under the same requestId' });
  check('request ID cannot be reused for another payload', !conflict.ok && conflict.error?.code === 'request_id_conflict');
  await waitUntil(() => readUiTree(page), tree => tree.some(item => item.visible && item.names.includes('commandTextPanel') && (item.title === properties.text || item.text === properties.text)), 'Inspector reflects Agent text');
  await page.screenshot({ path: path.join(evidence, 'agent-three-properties.png') });
  const negativeBefore = await query();
  const stale = await rpc(mutation('transact', afterUi.identity, { operations }));
  check('stale write explicitly fails', !stale.ok && stale.error?.code === 'stale_write');
  const missing = await rpc(mutation('transact', negativeBefore.identity, { operations: [{ ...operations[0], selector: { ...selector, displayNodeId: 'missing-acceptance-node' } }] }));
  check('missing target explicitly fails', !missing.ok && missing.error?.code === 'selector_not_found');
  const missingSave = await rpc(mutation('save', negativeBefore.identity, { selector: { ...selector, displayNodeId: 'missing-acceptance-save-target' } }));
  check('missing save target explicitly fails', !missingSave.ok && missingSave.error?.code === 'selector_not_found');
  const negativeAfter = await query();
  assert.deepEqual(negativeAfter, negativeBefore, 'negative writes change no session, history, dirty flag or UAM');
  check('negative writes preserve complete state', true);
  successData(await rpc(mutation('undo', negativeAfter.identity)));
  const undone = await query();
  assert.deepEqual(projectSemantics(undone.entity), projectSemantics(afterUi.entity), 'Agent undo restores UI unsaved project');
  check('Agent undo shares preexisting UI history', undone.editor.canRedo === true);
  // Place focus on the real canvas before using the public UI Redo shortcut.
  await clickUiMatch(page, item => item.data?.nodeId === 'title', 'title hierarchy row for keyboard focus');
  await page.keyboard.press('Control+Shift+Z');
  const redone = await waitUntil(query, data => titleOf(data.entity).text === properties.text, 'UI Redo of Agent transaction');
  assert.deepEqual(projectSemantics(redone.entity), projectSemantics(afterAgent.entity));
  check('UI redo restores Agent transaction', true);
  await page.screenshot({ path: path.join(evidence, 'after-history.png') });
  const agentSaved = successData(await rpc(mutation('save', redone.identity, { selector })));
  const afterSave = await query();
  check('Agent saves shared browser workspace with verified readback', agentSaved.checkpointSaved && agentSaved.browserWorkspaceSaved && agentSaved.verification?.status === 'verified' && !afterSave.editor.dirty && afterSave.editor.currentStateId === afterSave.editor.savedStateId);
  const finalText = '旅者背包 · 网页保存闭环';
  await inspectorTextViaUi(page, finalText);
  const beforeUiSave = await waitUntil(query, data => titleOf(data.entity).text === finalText && data.editor.dirty, 'second UI edit');
  await clickUiMatch(page, item => item.data?.nodeId === 'title', 'title hierarchy row for save focus');
  await page.keyboard.press('Control+S');
  const final = await waitUntil(query, data => !data.editor.dirty && titleOf(data.entity).text === finalText, 'UI save');
  check('UI save persists Agent and Inspector edits', final.identity.sessionId === beforeUiSave.identity.sessionId && titleOf(final.entity).position.x === properties.position.x && titleOf(final.entity).color.toUpperCase() === properties.color);
  await save('before-reload-uam.json', final);
  await page.screenshot({ path: path.join(evidence, 'ui-saved.png') });
  check('ZIP import never silently writes source archive', sha256(await fs.readFile(defaultZip)) === sourceZipHash);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.fairyEditorAgent?.schemaVersion === 1, null, { timeout: 30_000 });
  const reopenedRpc = await createRelay(page, async (name, data) => save(`reopened-${name}`, data));
  const reopened = successData(await reopenedRpc({ method: 'query' }));
  await save('after-reload-uam.json', reopened);
  assert.deepEqual(projectSemantics(reopened.entity), projectSemantics(final.entity), 'refresh retains complete UI/resource/controller/transition semantics');
  check('refresh/reopen retains IDs, resources, controller, gears and transition', true);
  await openMainAndSelectTitle(page);
  await page.screenshot({ path: path.join(evidence, 'reopened.png') });
  const exported = successData(await reopenedRpc({ method: 'export', identity: reopened.identity }));
  const bytes = Buffer.from(exported.base64, 'base64');
  await fs.writeFile(path.join(evidence, 'Inventory-browser-export.zip'), bytes);
  const requireEditor = createRequire(path.join(verificationRoot, 'repos', 'editor-online', 'package.json'));
  const { unzipSync } = requireEditor('fflate');
  const files = unzipSync(bytes);
  const inventoryFiles = Object.keys(files);
  const mainPath = inventoryFiles.find(name => name.endsWith('/Main.xml'));
  const rowPath = inventoryFiles.find(name => name.endsWith('/ItemRow.xml'));
  assert.ok(mainPath && rowPath, 'export includes Main and ItemRow');
  const mainXml = Buffer.from(files[mainPath]).toString('utf8');
  const rowXml = Buffer.from(files[rowPath]).toString('utf8');
  check('export ZIP contains final text, transition, controller and image references', mainXml.includes(finalText) && mainXml.includes('name="enter"') && rowXml.includes('name="state"') && rowXml.includes('icon0001'));
  await save('export-manifest.json', { sha256: sha256(bytes), bytes: bytes.length, fileName: exported.fileName, files: inventoryFiles, finalText, finalTitle: titleOf(reopened.entity), note: 'This is browser workspace export. DOM republish and game interaction require a separate next step.' });
  check('no external upload attempted', report.blockedExternal.length === 0);
  check('no unexpected page/console errors', report.errors.length === 0);
  report.status = 'browser_closed_loop_passed';
  report.domRoundtrip = { status: 'pending', sourceZip: path.join(evidence, 'Inventory-browser-export.zip') };
  report.limitations = ['Editor authoring uses its own Laya canvas; standalone DOM game republish is separate.', 'Physical IME, Safari, Firefox and Unity are not tested by this script.'];
}

async function persistentAcceptance() {
  const browserName = process.env.BROWSER || 'chrome';
  assert.ok(executablePaths[browserName], 'BROWSER must be chrome or edge');
  const url = process.env.EDITOR_URL || 'http://127.0.0.1:5199/?agent=1';
  assertLoopback(url);
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${browserName}-persistent`;
  const evidence = path.join(here, 'evidence', runId);
  // Chromium's IndexedDB backing-store paths can exceed Windows limits under
  // a deeply nested workspace. Keep this isolated profile in a short temp path.
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'lgui-profile-'));
  await fs.mkdir(evidence, { recursive: true });
  const save = async (name, data) => fs.writeFile(path.join(evidence, name), JSON.stringify(data, null, 2));
  const report = { runId, browser: browserName, url, profile, status: 'running', checks: [], errors: [], requests: [], blockedExternal: [], phases: [], limitation: 'Dedicated test profile, separate from all user browser profiles. Tests process restart persistence, not Unity or mobile.' };
  const check = (name, value) => { report.checks.push({ name, pass: !!value }); assert.ok(value, name); };
  let context;
  let currentPage;
  const open = async phase => {
    context = await chromium.launchPersistentContext(profile, { executablePath: executablePaths[browserName], headless: process.env.HEADLESS !== '0', viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
    report.phases.push({ phase, browserVersion: context.browser()?.version(), openedAt: new Date().toISOString() });
    await context.route('**/*', async route => {
      const target = route.request().url();
      if (/^(?:data:|blob:|about:)/.test(target)) return route.continue();
      try { assertLoopback(target); } catch { report.blockedExternal.push({ phase, url: target }); return route.abort('blockedbyclient'); }
      return route.continue();
    });
    currentPage = context.pages()[0] || await context.newPage();
    currentPage.on('pageerror', error => report.errors.push({ phase, type: 'pageerror', message: String(error) }));
    currentPage.on('console', message => { if (message.type() === 'error') report.errors.push({ phase, type: 'console', message: message.text() }); });
    currentPage.on('response', response => report.requests.push({ phase, url: response.url(), status: response.status() }));
    await currentPage.goto(url, { waitUntil: 'networkidle' });
    await currentPage.waitForFunction(() => window.fairyEditorAgent?.schemaVersion === 1, null, { timeout: 30_000 });
    return { page: currentPage, rpc: await createRelay(currentPage, (name, data) => save(`${phase}-${name}`, data)) };
  };
  const close = async phase => {
    await save(`${phase}-ui-state.json`, await uiState(currentPage));
    await currentPage.screenshot({ path: path.join(evidence, `${phase}.png`) });
    const browser = context.browser();
    await context.close(); context = null;
    check(`${phase} browser process disconnected`, !browser || !browser.isConnected());
  };
  try {
    const first = await open('before-process-close');
    await importInventoryViaUi(first.page);
    const initial = successData(await first.rpc({ method: 'query' }));
    const finalText = '旅者背包 · 浏览器进程重启保留';
    const write = successData(await first.rpc({ method: 'transact', identity: initial.identity, requestId: randomUUID(), operations: [{ kind: 'setDisplayNodeProps', selector, props: { text: finalText } }], summary: 'Persistent browser restart acceptance' }));
    const saved = successData(await first.rpc({ method: 'save', identity: write.identity, requestId: randomUUID(), selector }));
    check('save before shutdown is verified', saved.checkpointSaved && saved.browserWorkspaceSaved && saved.verification?.status === 'verified' && saved.editor.dirty === false);
    const expected = successData(await first.rpc({ method: 'query' }));
    await save('before-process-close-uam.json', expected);
    await close('before-process-close');
    const second = await open('after-process-restart');
    const restored = successData(await second.rpc({ method: 'query' }));
    await save('after-process-restart-uam.json', restored);
    const clientId = await second.page.evaluate(() => window.fairyEditorAgent.clientId);
    const cli = path.join(here, 'agent-cli.mjs');
    const clientsOutput = await execFileAsync(process.execPath, [cli, 'clients'], { cwd: here, timeout: 30_000, maxBuffer: 5 * 1024 * 1024 });
    const clients = JSON.parse(clientsOutput.stdout);
    await save('independent-cli-clients.json', clients);
    check('independent CLI sees this browser client', clients.ok && clients.data.clients.some(client => client.clientId === clientId));
    const requestPath = path.join(evidence, 'state-request.json');
    await fs.writeFile(requestPath, JSON.stringify({ method: 'state' }, null, 2));
    const stateOutput = await execFileAsync(process.execPath, [cli, 'call', clientId, requestPath], { cwd: here, timeout: 30_000, maxBuffer: 5 * 1024 * 1024 });
    const cliState = JSON.parse(stateOutput.stdout);
    await save('independent-cli-state.json', cliState);
    check('independent CLI reads the same session identity', cliState.ok && cliState.data.identity.sessionId === restored.identity.sessionId && cliState.data.identity.revision === restored.identity.revision);
    check('restart creates another live session', restored.identity.sessionId !== expected.identity.sessionId);
    check('restart restores saved title and clean state', titleOf(restored.entity).text === finalText && restored.editor.dirty === false);
    assert.deepEqual(projectSemantics(restored.entity), projectSemantics(expected.entity), 'process restart preserves full component, controller, transition and reference semantics');
    check('restart retains IDs, controller, transition and resources', true);
    const staleIdentity = await second.rpc({ method: 'transact', identity: expected.identity, requestId: randomUUID(), operations: [{ kind: 'setDisplayNodeProps', selector, props: { text: 'must not apply' } }] });
    check('old process identity is rejected', !staleIdentity.ok && staleIdentity.error?.code === 'session_mismatch');
    assert.deepEqual(successData(await second.rpc({ method: 'query' })), restored, 'old process request changes no new session state');
    check('old identity rejection preserves complete state', true);
    await openMainAndSelectTitle(second.page);
    check('no external requests attempted', report.blockedExternal.length === 0);
    check('no unexpected browser errors', report.errors.length === 0);
    await close('after-process-restart');
    report.status = 'persistent_restart_passed';
  } catch (error) {
    report.status = 'failed'; report.failure = { message: String(error), stack: error.stack };
    if (currentPage) await currentPage.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {});
  } finally {
    if (context) await context.close();
    report.endedAt = new Date().toISOString(); await save('report.json', report);
  }
  console.log(JSON.stringify({ evidence, status: report.status, failure: report.failure }, null, 2));
  if (report.failure) process.exitCode = 1;
}

export async function clickNamedUi(page, name, options = {}) {
  const matches = (await readUiTree(page)).filter(item => item.name === name && item.visible
    && (!options.ancestor || item.names.includes(options.ancestor))
    && item.bounds.width > 0 && item.bounds.height > 0);
  assert.equal(matches.length, 1, `Expected one visible FairyGUI node named ${name}; found ${matches.length}`);
  const { bounds } = matches[0];
  assert.ok(bounds.x >= 0 && bounds.y >= 0, `Node ${name} is outside visible viewport`);
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, options.click || {});
  return matches[0];
}

export async function importInventoryViaUi(page, zipPath = defaultZip) {
  assert.equal(path.resolve(zipPath), defaultZip, 'Only the existing non-sensitive Inventory fixture may be imported');
  await fs.access(zipPath);
  const tree = await readUiTree(page);
  // Resolve File from its existing name/title, avoiding the old viewport coordinates.
  const file = tree.filter(item => item.isButton && item.names.includes('menuBar') && item.visible && item.bounds.width > 0 && item.bounds.height > 0
    && /^(?:file|文件)$/i.test(item.title || item.text || ''));
  assert.equal(file.length, 1, `Expected one visible File menu; got ${file.length}`);
  const b = file[0].bounds;
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const chooserPromise = page.waitForEvent('filechooser');
  await clickNamedUi(page, 'workspaceMenuImportZip');
  const chooser = await chooserPromise;
  await chooser.setFiles(zipPath);
  await page.waitForFunction(() => [...document.documentElement.attributes, ...document.body.attributes]
    .some(item => item.name === 'data-fairy-editor-workspace-pending-import' && item.value === 'true'), null, { timeout: 30_000 });
  await clickNamedUi(page, 'projectImportConfirm');
  await page.waitForFunction(() => [...document.documentElement.attributes, ...document.body.attributes]
    .some(item => item.name === 'data-fairy-editor-workspace-import-fairy' && item.value === 'Inventory.fairy'), null, { timeout: 30_000 });
  return { fixtureSha256: sha256(await fs.readFile(zipPath)), state: await uiState(page) };
}

export async function launchHarness({ browserName = 'chrome', url = 'http://127.0.0.1:5199/' } = {}) {
  assertLoopback(url);
  assert.ok(executablePaths[browserName], 'BROWSER must be chrome or edge');
  await fs.access(executablePaths[browserName]);
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${browserName}`;
  const evidence = path.join(here, 'evidence', runId);
  await fs.mkdir(evidence, { recursive: true });
  const report = { runId, browser: browserName, url, mode: 'installed desktop Chromium; isolated nonpersistent profile',
    version: '', startedAt: new Date().toISOString(), status: 'preparing', checks: [], errors: [], requests: [], blockedExternal: [] };
  const browser = await chromium.launch({ executablePath: executablePaths[browserName], headless: process.env.HEADLESS !== '0' });
  report.version = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true,
    recordHar: { path: path.join(evidence, 'network.har'), content: 'omit' }, serviceWorkers: 'block' });
  await context.route('**/*', async route => {
    const requestUrl = route.request().url();
    if (/^(?:data:|blob:|about:)/.test(requestUrl)) return route.continue();
    try { assertLoopback(requestUrl); } catch {
      report.blockedExternal.push(requestUrl); return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push({ type: 'pageerror', message: String(error) }));
  page.on('console', message => {
    if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() });
  });
  page.on('response', response => report.requests.push({ url: response.url(), status: response.status() }));
  const save = async (name, data) => fs.writeFile(path.join(evidence, name), JSON.stringify(data, null, 2));
  const check = (name, value, details) => {
    report.checks.push({ name, pass: !!value, details }); assert.ok(value, name);
  };
  const finish = async error => {
    if (error) {
      report.status = 'failed'; report.failure = { message: String(error), stack: error.stack };
      await page.screenshot({ path: path.join(evidence, 'failure.png'), fullPage: true }).catch(() => {});
    }
    report.endedAt = new Date().toISOString();
    await save('final-ui-state.json', await uiState(page).catch(() => null));
    await save('final-ui-tree.json', await readUiTree(page).catch(() => []));
    await context.close(); await browser.close(); await save('report.json', report);
    return { evidence, report };
  };
  return { browser, context, page, report, evidence, save, check, finish };
}

async function main() {
  if (process.argv.includes('--persistent')) return persistentAcceptance();
  const mode = process.argv.includes('--import') ? 'import' : process.argv.includes('--probe') ? 'probe' : 'accept';
  const harness = await launchHarness({ browserName: process.env.BROWSER || 'chrome', url: process.env.EDITOR_URL || 'http://127.0.0.1:5199/?agent=1' });
  const { page, report, save, evidence } = harness;
  let failure;
  try {
    await page.goto(report.url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.fgui?.GRoot?.inst?.numChildren, null, { timeout: 30_000 });
    await save('initial-ui-state.json', await uiState(page));
    await save('initial-ui-tree.json', await readUiTree(page));
    await page.screenshot({ path: path.join(evidence, 'initial.png') });
    if (mode === 'import') {
      await save('import-result.json', await importInventoryViaUi(page));
      await page.screenshot({ path: path.join(evidence, 'after-import.png') });
    }
    if (mode === 'accept') await closedLoopAcceptance(harness);
    else {
      report.status = 'preparation_only';
      report.limitation = 'Only browser loading/UI import checked; session revision, Inspector, history, save/reopen/export and DOM roundtrip have not run.';
    }
  } catch (error) { failure = error; }
  const result = await harness.finish(failure);
  console.log(JSON.stringify({ evidence: result.evidence, status: result.report.status, failure: result.report.failure }, null, 2));
  if (failure) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
