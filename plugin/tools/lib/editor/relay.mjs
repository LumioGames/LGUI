// lgui editor 的本地服务：提供编辑器的静态文件，加上实时会话中转（照搬旧补丁 agent-relay.mjs 的安全做法）。
// - 只监听 127.0.0.1，端口随机；每次启动随机生成 32 字节令牌，写进连接文件（权限 0600）。
// - Agent 一侧（/__lgui_editor/clients、/__lgui_editor/rpc）：必须带 Authorization: Bearer <令牌>；带了来源但不是编辑器自己的页面 → 403。
// - 浏览器一侧（events、hello、response、bye）：只接受编辑器页面自己发的同源请求（Sec-Fetch-Site: same-origin，POST 还要核对 Origin）。
// - 请求只发给指定的一个浏览器标签页，不广播；浏览器 15 秒没回结果按「结果未知」回 504。
// - 编辑器页面每次打开时从 /__lgui_editor/project 读工程的 ui/（只读），保证显示的是 ui/ 里的最新内容。
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const PREFIX = '/__lgui_editor/';
const MAX_BODY = 256 * 1024;        // Agent 发来的请求
const MAX_RESULT = 8 * 1024 * 1024; // 浏览器回的结果（查询整个工程时会比较大）
const ALIVE_MS = 10000;
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.map': 'application/json', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.fui': 'application/octet-stream', '.wasm': 'application/wasm'};

const json = (res, status, value) => { res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}); res.end(JSON.stringify(value)); };
const reject = (res, status, code, message) => json(res, status, {ok: false, error: {code, message}});

async function readBody(req, limit = MAX_BODY) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw) > limit) throw Object.assign(new Error(`请求太大（上限 ${limit / 1024} KiB）。`), {status: 413, code: 'request_too_large'});
  }
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error('请求不是合法的 JSON。'), {status: 400, code: 'invalid_request'}); }
}

// 工程 ui/ 下的全部文件（不含隐藏文件），路径用 /，内容 base64。
function readProjectFiles(dir) {
  const files = [];
  const walk = rel => {
    for (const e of fs.readdirSync(path.join(dir, rel), {withFileTypes: true})) {
      if (e.name.startsWith('.')) continue;
      const child = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(child);
      else if (e.isFile()) files.push({path: child, data: fs.readFileSync(path.join(dir, child)).toString('base64')});
    }
  };
  walk('');
  return files;
}

/** 启动服务。返回 { baseUrl, token, close }。 */
export async function startEditorServer({editorDir, projectDir, connectionFile, timeoutMs = 15000}) {
  const token = crypto.randomBytes(32).toString('hex');
  const clients = new Map();   // clientId → { res（SSE）, url, lastSeen }
  const pending = new Map();   // 请求 id → { res, timer, clientId }
  let baseUrl = '';

  const finish = (id, status, value) => {
    const item = pending.get(id);
    if (!item) return;
    clearTimeout(item.timer);
    pending.delete(id);
    if (!item.res.writableEnded) json(item.res, status, value);
  };

  const serveStatic = (route, res) => {
    const rel = route === '/' ? 'index.html' : route.slice(1);
    const file = path.resolve(editorDir, rel);
    if (!file.startsWith(path.resolve(editorDir) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store'});
    fs.createReadStream(file).pipe(res);
  };

  // 浏览器一侧：只认编辑器页面自己发的同源请求。
  const fromEditorPage = req => req.headers['sec-fetch-site'] === 'same-origin' && (req.method === 'GET' || req.headers.origin === baseUrl);

  const browserRoute = async (name, req, res, url) => {
    if (!fromEditorPage(req)) return reject(res, 403, 'origin_rejected', '只接受编辑器页面自己的请求。');
    if (name === 'project' && req.method === 'GET') {
      if (!projectDir) return reject(res, 404, 'no_project', '没有工程目录。');
      return json(res, 200, {name: path.basename(projectDir), files: readProjectFiles(projectDir)});
    }
    if (name === 'events' && req.method === 'GET') {
      const clientId = url.searchParams.get('clientId') ?? '';
      if (!clientId || clientId.length > 128) return reject(res, 400, 'invalid_request', '缺少 clientId。');
      res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive'});
      res.write(': connected\n\n');
      const previous = clients.get(clientId);
      clients.set(clientId, {res, url: previous?.url ?? '', lastSeen: previous?.lastSeen ?? 0});
      req.on('close', () => { if (clients.get(clientId)?.res === res) clients.delete(clientId); });
      return;
    }
    if (req.method !== 'POST') return reject(res, 404, 'unknown_route', '没有这个地址。');
    const body = await readBody(req, name === 'response' ? MAX_RESULT : MAX_BODY);
    const client = clients.get(body?.clientId);
    if (name === 'hello') {
      const pageUrl = String(body?.url ?? '');
      if (!client || !pageUrl.startsWith(baseUrl + '/')) return reject(res, 409, 'client_unknown', '先连上 events。');
      client.url = pageUrl;
      client.lastSeen = Date.now();
      return json(res, 200, {ok: true});
    }
    if (name === 'response') {
      const item = pending.get(body?.id);
      if (item && item.clientId === body.clientId) finish(body.id, 200, body.result);
      return json(res, 200, {ok: true});
    }
    if (name === 'bye') {
      if (client) { client.res.end(); clients.delete(body.clientId); }
      return json(res, 200, {ok: true});
    }
    return reject(res, 404, 'unknown_route', '没有这个地址。');
  };

  const active = () => [...clients.entries()].filter(([, c]) => c.url && Date.now() - c.lastSeen < ALIVE_MS).map(([clientId, c]) => ({clientId, url: c.url, lastSeen: c.lastSeen}));

  // Agent 一侧：要令牌。
  const agentRoute = async (name, req, res) => {
    if (req.headers.authorization !== `Bearer ${token}`) return reject(res, 401, 'unauthorized', '要带连接文件里的令牌。');
    if (req.headers.origin && req.headers.origin !== baseUrl) return reject(res, 403, 'origin_rejected', '不接受别的网页发来的请求。');
    if (name === 'clients' && req.method === 'GET') return json(res, 200, {ok: true, data: {clients: active()}});
    if (name !== 'rpc' || req.method !== 'POST') return reject(res, 404, 'unknown_route', '用 POST rpc 或 GET clients。');
    const body = await readBody(req);
    const target = clients.get(body?.clientId);
    if (!target || !active().some(c => c.clientId === body.clientId)) return reject(res, 409, 'client_unavailable', '指定一个正在连接的编辑器标签页（clientId）；写操作不会广播。');
    if (!body.request || typeof body.request !== 'object') return reject(res, 400, 'invalid_request', '缺少 request。');
    const id = crypto.randomUUID();
    const timer = setTimeout(() => finish(id, 504, {ok: false, error: {code: 'result_unknown', message: '编辑器没有按时回复，写操作可能已经执行：用同一个 requestId 和同样的内容重试，不要换新的 ID。'}}), timeoutMs);
    pending.set(id, {res, timer, clientId: body.clientId});
    target.res.write(`event: request\ndata: ${JSON.stringify({id, request: body.request})}\n\n`);
  };

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const route = decodeURIComponent(url.pathname);
      if (!route.startsWith(PREFIX)) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return reject(res, 405, 'method_not_allowed', '只能读文件。');
        return serveStatic(route, res);
      }
      const name = route.slice(PREFIX.length);
      if (['clients', 'rpc'].includes(name)) return await agentRoute(name, req, res);
      return await browserRoute(name, req, res, url);
    } catch (error) {
      if (!res.writableEnded) reject(res, error.status ?? 400, error.code ?? 'invalid_request', String(error.message ?? error));
    }
  });
  await new Promise((resolve, reject_) => { server.once('error', reject_); server.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  fs.mkdirSync(path.dirname(connectionFile), {recursive: true});
  fs.rmSync(connectionFile, {force: true});
  fs.writeFileSync(connectionFile, JSON.stringify({schemaVersion: 1, baseUrl, token, pid: process.pid, startedAt: new Date().toISOString()}, null, 2) + '\n', {mode: 0o600});

  const close = async () => {
    for (const id of [...pending.keys()]) finish(id, 503, {ok: false, error: {code: 'result_unknown', message: '中转在确认送达前停止了。'}});
    for (const c of clients.values()) c.res.end();
    clients.clear();
    fs.rmSync(connectionFile, {force: true});
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  };
  return {baseUrl, token, close};
}
