// lgui dev 的服务只认 Host 是 127.0.0.1:<端口> 的请求（挡住 DNS 重绑定）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {run} from './helpers.mjs';
import {startDev} from '../../../plugin/tools/lib/dev/index.mjs';
import {readProject} from '../../../plugin/tools/lib/project.mjs';

const status = (url, host) => new Promise((resolve, reject) => {
  const req = http.get(url, {headers: host ? {host} : {}}, res => { res.resume(); resolve(res.statusCode); });
  req.on('error', reject);
});

test('lgui dev：Host 头不对的请求 403，对的照常', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-dev-host-'));
  await run(['init', 'game'], parent);
  const root = path.join(parent, 'game');
  const server = await startDev(root, readProject(root), {port: 0});
  try {
    const port = new URL(server.url).port;
    assert.equal(await status(server.url), 200);
    assert.equal(await status(`${server.url}manifest.json`), 404);
    for (const host of ['evil.example', `evil.example:${port}`, `localhost:${port}`]) {
      assert.equal(await status(server.url, host), 403, host);
      assert.equal(await status(`${server.url}__lgui/events`, host), 403, host);
    }
  } finally {
    await server.close();
  }
});
