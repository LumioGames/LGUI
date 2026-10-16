import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'roundtrip-final/web');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.xml': 'application/octet-stream' };
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  const target = path.resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try { const bytes = fs.readFileSync(target); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(bytes); }
  catch { res.writeHead(404).end(); }
}).listen(4181, '127.0.0.1', () => console.log(JSON.stringify({ pid: process.pid, url: 'http://127.0.0.1:4181', root })));
