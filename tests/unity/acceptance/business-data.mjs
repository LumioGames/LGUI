import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const failure = message => new Error('LGUI-RT-001 Inventory acceptance: ' + message);
const here = path.dirname(fileURLToPath(import.meta.url));

/** Separate raw timing and this exact HUD clock text; all remaining business/UI fields stay strict. */
export function compareBusinessSnapshots(unity, h5) {
  const separate = snapshot => {
    if (!snapshot?.data || !Array.isArray(snapshot.data.rawTiming) || !Array.isArray(snapshot.data.checkpoints)) throw failure('Missing the explicit business/checkpoint/rawTiming schema.');
    const {rawTiming, ...data} = snapshot.data;
    const hud = snapshot.views?.['Main/Hud'], clock = hud?.eventText;
    if (!clock || !Object.hasOwn(clock, 'text') || typeof clock.text !== 'string') throw failure('Missing the exact views["Main/Hud"].eventText.text clock schema.');
    const {text, ...stableClock} = clock;
    const timedUI = {views: {'Main/Hud': {eventText: {text}}}};
    return {rawTiming, timedUI, compared: {...snapshot, data,
      views: {...snapshot.views, 'Main/Hud': {...hud, eventText: stableClock}}}};
  };
  const native = separate(unity), browser = separate(h5);
  try { assert.deepEqual(native.compared, browser.compared); }
  catch (cause) { throw new Error('LGUI-RT-001 Inventory stable data/UI snapshots differ: ' + cause.message, {cause}); }
  return {equal: true, comparison: 'Complete persisted business/checkpoints and stable UI; raw timing and exact Main/Hud.eventText.text reported separately',
    rawTiming: {unity: native.rawTiming, h5: browser.rawTiming}, timedUI: {unity: native.timedUI, h5: browser.timedUI}};
}

/** A real HTTP image stays pending until /release. No timing guess hides its placeholder. */
export async function startGatedImageFixture({outDir, host = '127.0.0.1'} = {}) {
  if (!['127.0.0.1', '::1', 'localhost'].includes(host)) throw failure('The image fixture must bind an explicit loopback address or localhost.');
  const image = fs.readFileSync(path.resolve(here, '../../../examples/inventory/ui/assets/Common/coin.png'));
  const requests = [], pending = new Set(), requestWaiters = [];
  let released = false;
  if (outDir) {
    fs.mkdirSync(outDir, {recursive: true});
    if (['requests.json', 'fixture.json'].some(file => fs.existsSync(path.join(outDir, file)))) throw failure('Choose fresh gated-image fixture evidence.');
  }
  const record = () => { if (outDir) fs.writeFileSync(path.join(outDir, 'requests.json'), JSON.stringify(requests, null, 2) + '\n'); };
  const pixels = response => {
    if (response.destroyed) return;
    response.writeHead(200, {'content-type': 'image/png', 'cache-control': 'no-store'}).end(image);
  };
  const server = http.createServer((request, response) => {
    // The actual H5 app runs on a separate loopback port. This test server
    // explicitly permits its requests; the game's network policy is unchanged.
    response.setHeader('access-control-allow-origin', '*');
    const url = new URL(request.url, 'http://127.0.0.1').pathname;
    requests.push({url, rawURL: request.url, time: Date.now()}); record();
    if (url === '/gated.png') {
      for (const resolve of requestWaiters.splice(0)) resolve();
      if (released) pixels(response);
      else { pending.add(response); response.on('close', () => pending.delete(response)); }
    } else if (url === '/release') {
      released = true;
      for (const waiting of pending) pixels(waiting);
      pending.clear();
      response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({ok: true, released}));
    } else response.writeHead(404).end('not found');
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, host, resolve); });
  const boundAddress = server.address();
  const baseURL = 'http://' + (host === '::1' ? '[::1]' : host) + ':' + boundAddress.port;
  try {
    if (outDir) fs.writeFileSync(path.join(outDir, 'fixture.json'), JSON.stringify({nodePid: process.pid, host, baseURL, boundAddress}, null, 2) + '\n', {flag: 'wx'});
  } catch (error) {
    await new Promise(resolve => server.close(resolve));
    throw error;
  }
  return {baseURL, boundAddress, requests,
    whenRequested: () => requests.some(request => request.url === '/gated.png') ? Promise.resolve() : new Promise(resolve => requestWaiters.push(resolve)),
    close: () => new Promise((resolve, reject) => { server.closeAllConnections(); server.close(error => error ? reject(error) : resolve()); })};
}
