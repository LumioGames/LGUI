// Native verification fixture: one successful preload must be the only HTTP request.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
};
const png = ([r, g, b]) => {
  const header = Buffer.alloc(13); header.writeUInt32BE(32, 0); header.writeUInt32BE(32, 4); header[8] = 8; header[9] = 6;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({length: 32}, () => [r, g, b, 255]).flat())]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(Array.from({length: 32}, () => row)))), chunk('IEND', Buffer.alloc(0))]);
};
/** A fresh loopback-only server owns one verification run's one-shot state and counters. */
export async function startImageFixture({outDir}) {
  if (typeof outDir !== 'string' || !outDir) throw new Error('LGUI-RT-001 Provide an evidence directory for the image fixture.');
  const root = path.resolve(outDir); fs.mkdirSync(root, {recursive: true});
  const image = png([255, 0, 0]);
  fs.writeFileSync(path.join(root, 'placeholder.png'), png([0, 0, 255])); fs.writeFileSync(path.join(root, 'success.png'), image);
  const counts = {}; const requests = [];
  const write = () => fs.writeFileSync(path.join(root, 'requests.json'), JSON.stringify({counts, requests}, null, 2));
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/stats') { res.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({counts, requests})); return; }
    const name = url.pathname;
    counts[name] = (counts[name] ?? 0) + 1;
    const attempt = counts[name];
    const record = {name, rawURL: req.url, attempt, method: req.method, started: Date.now()};
    requests.push(record); write();
    res.on('close', () => { record.closed = Date.now(); record.closedBeforeWrite = !record.writeStarted; write(); });
    res.on('finish', () => { record.finished = Date.now(); write(); });
    if (name === '/drop') { req.socket.destroy(); return; }
    if (name === '/echo') {
      const body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => res.writeHead(200, {'content-type': 'application/json', 'cache-control': 'no-store'}).end(JSON.stringify({method: req.method, body: Buffer.concat(body).toString('utf8'), probeHeader: req.headers['x-lgui-probe'] ?? '', contentType: req.headers['content-type'] ?? ''})));
      return;
    }
    if (name === '/missing-native') { res.writeHead(404, {'content-type': 'application/json'}).end(JSON.stringify({error: 'fixture missing'})); return; }
    const missing = name === '/missing.png' || name === '/reentrant-fail.png' || (name === '/one-shot.png' && attempt > 1) || !['/slow.png', '/one-shot.png', '/reentrant-ready.png', '/reentrant-slow.png'].includes(name);
    const delay = name === '/reentrant-slow.png' ? 700 : missing ? 50 : 350;
    record.scheduledWrite = record.started + delay; write();
    setTimeout(() => {
      if (res.destroyed) { record.writeSkipped = Date.now(); write(); return; }
      record.writeStarted = Date.now(); write();
      res.writeHead(missing ? 404 : 200, {'content-type': missing ? 'text/plain' : 'image/png', 'cache-control': 'no-store'});
      res.end(missing ? 'fixture intentionally returned 404' : image);
    }, delay);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const info = {pid: process.pid, port: server.address().port, base: `http://127.0.0.1:${server.address().port}`};
  fs.writeFileSync(path.join(root, 'server.json'), JSON.stringify(info, null, 2));
  write();
  return {...info, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--out');
  if (index < 0 || !process.argv[index + 1]) throw new Error('LGUI-RT-001 Usage: node server.mjs --out <evidence-directory>.');
  const fixture = await startImageFixture({outDir: process.argv[index + 1]});
  process.stdout.write(JSON.stringify({pid: fixture.pid, port: fixture.port, base: fixture.base}) + '\n');
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => fixture.close().then(() => process.exit(0)));
}
