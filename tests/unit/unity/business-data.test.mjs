import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const businessSnapshot = (clock = '限时活动 剩余 09:50') => ({
  data: {checkpoints: [{step: 'sold', bag: {coins: 12560}}], rawTiming: [{now: 100}]},
  views: {'Main/Hud': {eventText: {visible: true, enabled: true, text: clock}, bg: {visible: true, enabled: true}},
    'Reward/RewardDialog': {eventText: {visible: true, enabled: true, text: 'stable reward'}}},
  snapshot: {language: 'zh-CN'}
});

test('business comparison retains raw clocks but requires every stable checkpoint to match', async () => {
  const api = await import('../../unity/acceptance/business-data.mjs').catch(() => ({}));
  assert.equal(typeof api.compareBusinessSnapshots, 'function');
  const unity = businessSnapshot();
  const h5 = {...unity, data: {...unity.data, rawTiming: [{now: 240}]}};
  const result = api.compareBusinessSnapshots(unity, h5);
  assert.equal(result.equal, true);
  assert.deepEqual(result.rawTiming, {unity: [{now: 100}], h5: [{now: 240}]});
  assert.throws(() => api.compareBusinessSnapshots(unity, {...h5, data: {...h5.data, checkpoints: [{step: 'sold', bag: {coins: 1}}]}}), /LGUI-RT-001/);
  assert.throws(() => api.compareBusinessSnapshots(unity, {...h5, views: {amount: 'wrong'}}), /LGUI-RT-001/);
});

test('business comparison separates only the exact final HUD clock text and retains its original values', async () => {
  const {compareBusinessSnapshots} = await import('../../unity/acceptance/business-data.mjs');
  const unity = businessSnapshot('限时活动 剩余 09:50');
  const h5 = businessSnapshot('限时活动 剩余 09:46');
  h5.data.rawTiming = [{now: 240}];
  const originals = structuredClone({unity, h5});
  const result = compareBusinessSnapshots(unity, h5);
  assert.equal(result.equal, true);
  assert.deepEqual(result.timedUI, {
    unity: {views: {'Main/Hud': {eventText: {text: '限时活动 剩余 09:50'}}}},
    h5: {views: {'Main/Hud': {eventText: {text: '限时活动 剩余 09:46'}}}}
  });
  assert.deepEqual(result.rawTiming, {unity: [{now: 100}], h5: [{now: 240}]});
  assert.deepEqual({unity, h5}, originals, '比较不能改写原始验收快照');
});

test('business comparison keeps HUD visibility/enabled and every other text/UI/business field strict', async () => {
  const {compareBusinessSnapshots} = await import('../../unity/acceptance/business-data.mjs');
  const unity = businessSnapshot(), h5 = businessSnapshot('限时活动 剩余 09:46');
  const changes = [
    snapshot => { snapshot.views['Main/Hud'].eventText.visible = false; },
    snapshot => { snapshot.views['Main/Hud'].eventText.enabled = false; },
    snapshot => { snapshot.views['Main/Hud'].bg.visible = false; },
    snapshot => { snapshot.views['Reward/RewardDialog'].eventText.text = 'different reward'; },
    snapshot => { snapshot.views['Main/Hud'].extraText = {text: 'unexpected text'}; },
    snapshot => { snapshot.data.checkpoints[0].bag.coins = 1; },
    snapshot => { snapshot.snapshot.language = 'en'; }
  ];
  for (const change of changes) {
    const changed = structuredClone(h5); change(changed);
    assert.throws(() => compareBusinessSnapshots(unity, changed), /LGUI-RT-001/);
  }
});

test('business comparison rejects a missing or malformed exact HUD clock schema on either backend', async () => {
  const {compareBusinessSnapshots} = await import('../../unity/acceptance/business-data.mjs');
  for (const malformed of [
    snapshot => { delete snapshot.views; },
    snapshot => { delete snapshot.views['Main/Hud']; },
    snapshot => { delete snapshot.views['Main/Hud'].eventText; },
    snapshot => { delete snapshot.views['Main/Hud'].eventText.text; },
    snapshot => { snapshot.views['Main/Hud'].eventText.text = 590; },
    snapshot => { snapshot.views['Main/Hud'].eventText = null; }
  ]) {
    const broken = businessSnapshot(); malformed(broken);
    assert.throws(() => compareBusinessSnapshots(broken, structuredClone(broken)), /LGUI-RT-001.*Main\/Hud.*eventText.*text/);
    assert.throws(() => compareBusinessSnapshots(businessSnapshot(), broken), /LGUI-RT-001/);
    assert.throws(() => compareBusinessSnapshots(broken, businessSnapshot()), /LGUI-RT-001/);
  }
});

test('image fixture does not send pixels before an explicit release and permits actual subsequent loads', async () => {
  const api = await import('../../unity/acceptance/business-data.mjs').catch(() => ({}));
  assert.equal(typeof api.startGatedImageFixture, 'function');
  const fixture = await api.startGatedImageFixture();
  try {
    let received = false;
    const image = fetch(fixture.baseURL + '/gated.png').then(response => { received = true; return response.arrayBuffer(); });
    await fixture.whenRequested();
    assert.equal(received, false, 'The caller must be able to observe the real placeholder before image bytes exist');
    const release = await fetch(fixture.baseURL + '/release');
    assert.equal(release.ok, true);
    assert.equal(release.headers.get('access-control-allow-origin'), '*', 'The separately served actual H5 app must be allowed to release the gate');
    const bytes = Buffer.from(await image);
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
    assert.equal((await fetch(fixture.baseURL + '/gated.png')).ok, true);
    assert.equal(fixture.requests.filter(request => request.url === '/gated.png').length, 2);
  } finally { await fixture.close(); }
});

test('image fixture explicitly supports IPv6 loopback without changing system proxy settings', async () => {
  const {startGatedImageFixture} = await import('../../unity/acceptance/business-data.mjs');
  await assert.rejects(startGatedImageFixture({host: '0.0.0.0'}), /LGUI-RT-001/);
  const fixture = await startGatedImageFixture({host: '::1'});
  try {
    assert.match(fixture.baseURL, /^http:\/\/\[::1\]:\d+$/);
    const release = await fetch(fixture.baseURL + '/release');
    assert.equal(release.ok, true);
    const image = await fetch(fixture.baseURL + '/gated.png');
    assert.equal(image.ok, true);
    assert.equal(image.headers.get('access-control-allow-origin'), '*');
    assert.equal(fixture.requests.length, 2);
  } finally { await fixture.close(); }
});

test('image fixture explicitly binds localhost and records the actual owned endpoint before releasing pixels', async () => {
  const {startGatedImageFixture} = await import('../../unity/acceptance/business-data.mjs');
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-image-localhost-'));
  let fixture;
  try {
    fixture = await startGatedImageFixture({host: 'localhost', outDir});
    assert.match(fixture.baseURL, /^http:\/\/localhost:\d+$/);
    assert.ok(['127.0.0.1', '::1'].includes(fixture.boundAddress.address));
    assert.equal(fixture.boundAddress.port, Number(new URL(fixture.baseURL).port));
    const evidence = JSON.parse(fs.readFileSync(path.join(outDir, 'fixture.json'), 'utf8'));
    assert.deepEqual(evidence, {nodePid: process.pid, host: 'localhost', baseURL: fixture.baseURL, boundAddress: fixture.boundAddress});
    let received = false;
    const image = fetch(fixture.baseURL + '/gated.png').then(response => { received = true; assert.equal(response.status, 200); return response.arrayBuffer(); });
    await fixture.whenRequested();
    assert.equal(received, false);
    assert.equal((await fetch(fixture.baseURL + '/release')).status, 200);
    assert.deepEqual(Buffer.from(await image).subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
    assert.deepEqual(fixture.requests.map(request => request.url), ['/gated.png', '/release']);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(outDir, 'requests.json'), 'utf8')), fixture.requests);
  } finally {
    await fixture?.close();
    fs.rmSync(outDir, {recursive: true, force: true});
  }
});
