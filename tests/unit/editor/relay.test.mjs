// lgui editor 的中转：令牌、来源、只给指定标签页、连接文件权限；editor props 的属性换算和报错。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {startEditorServer} from '../../../plugin/tools/lib/editor/relay.mjs';
import {toEditorProps, connectionPath} from '../../../plugin/tools/lib/commands/editor.mjs';
import {run} from '../cli/helpers.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-relay-'));

// 发请求（可以设置浏览器才会带的头，比如 Sec-Fetch-Site）。
function request(baseUrl, route, {method = 'GET', headers = {}, body} = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${baseUrl}${route}`, {method, headers: {'content-type': 'application/json', ...headers}}, res => {
      let text = '';
      res.on('data', c => { text += c; });
      res.on('end', () => resolve({status: res.statusCode, body: text ? JSON.parse(text) : null}));
    });
    req.on('error', reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

// 假的编辑器页面：连上 events，收到请求就回一个结果。
function fakeBrowser(server, clientId, answer) {
  const page = {'sec-fetch-site': 'same-origin', origin: server.baseUrl};
  return new Promise(resolve => {
    const req = http.get(`${server.baseUrl}/__lgui_editor/events?clientId=${clientId}`, {headers: {'sec-fetch-site': 'same-origin'}}, res => {
      let buffer = '';
      res.on('data', async chunk => {
        buffer += chunk;
        for (let i; (i = buffer.indexOf('\n\n')) >= 0;) {
          const block = buffer.slice(0, i); buffer = buffer.slice(i + 2);
          const data = /^data: (.*)$/m.exec(block);
          if (!data) continue;
          const {id, request: rpc} = JSON.parse(data[1]);
          await request(server.baseUrl, '/__lgui_editor/response', {method: 'POST', headers: page, body: {clientId, id, result: answer(rpc)}});
        }
      });
      request(server.baseUrl, '/__lgui_editor/hello', {method: 'POST', headers: page, body: {clientId, url: `${server.baseUrl}/?agent=1`}}).then(() => resolve(req));
    });
  });
}

test('中转：连接文件 0600、只听 127.0.0.1；没令牌 401、别的来源 403、浏览器接口只认同源；请求只发给指定标签页', async () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html>editor');
  const connectionFile = path.join(dir, 'conn', 'editor-connection.json');
  const server = await startEditorServer({editorDir: dir, connectionFile, timeoutMs: 500});
  try {
    assert.match(server.baseUrl, /^http:\/\/127\.0\.0\.1:\d+$/);
    if (process.platform !== 'win32') assert.equal(fs.statSync(connectionFile).mode & 0o777, 0o600);
    const conn = JSON.parse(fs.readFileSync(connectionFile, 'utf8'));
    assert.equal(conn.token, server.token);
    assert.equal(conn.token.length, 64);
    const auth = {authorization: `Bearer ${server.token}`};

    // 静态文件；不能读到目录外面
    assert.equal((await fetch(server.baseUrl + '/')).status, 200);
    assert.equal((await fetch(server.baseUrl + '/..%2f..%2fetc%2fpasswd')).status, 404);

    // Agent 一侧
    assert.equal((await request(server.baseUrl, '/__lgui_editor/clients')).status, 401);
    assert.equal((await request(server.baseUrl, '/__lgui_editor/clients', {headers: {authorization: 'Bearer nope'}})).status, 401);
    assert.equal((await request(server.baseUrl, '/__lgui_editor/clients', {headers: {...auth, origin: 'https://evil.example'}})).status, 403);
    assert.deepEqual((await request(server.baseUrl, '/__lgui_editor/clients', {headers: auth})).body.data.clients, []);

    // 浏览器一侧：跨站请求、没有同源标记都拒绝
    assert.equal((await request(server.baseUrl, '/__lgui_editor/hello', {method: 'POST', headers: {'sec-fetch-site': 'cross-site', origin: 'https://evil.example'}, body: {clientId: 'x'}})).status, 403);
    assert.equal((await request(server.baseUrl, '/__lgui_editor/response', {method: 'POST', body: {clientId: 'x', id: 'y'}})).status, 403);
    assert.equal((await request(server.baseUrl, '/__lgui_editor/hello', {method: 'POST', headers: {'sec-fetch-site': 'same-origin', origin: 'https://evil.example'}, body: {clientId: 'x'}})).status, 403);

    // 指定的标签页收到请求并回复
    const a = await fakeBrowser(server, 'tab-a', rpc => ({ok: true, data: {echo: rpc.method, tab: 'a'}}));
    const b = await fakeBrowser(server, 'tab-b', rpc => ({ok: true, data: {echo: rpc.method, tab: 'b'}}));
    const clients = (await request(server.baseUrl, '/__lgui_editor/clients', {headers: auth})).body.data.clients.map(c => c.clientId).sort();
    assert.deepEqual(clients, ['tab-a', 'tab-b']);
    const reply = await request(server.baseUrl, '/__lgui_editor/rpc', {method: 'POST', headers: auth, body: {clientId: 'tab-b', request: {method: 'state'}}});
    assert.deepEqual(reply.body, {ok: true, data: {echo: 'state', tab: 'b'}});
    assert.equal((await request(server.baseUrl, '/__lgui_editor/rpc', {method: 'POST', headers: auth, body: {clientId: 'nobody', request: {method: 'state'}}})).status, 409);
    a.destroy(); b.destroy();
  } finally {
    await server.close();
  }
  assert.equal(fs.existsSync(connectionFile), false, '停止后删掉连接文件');
});

test('浏览器没按时回复：504 result_unknown', async () => {
  const dir = tmp();
  const server = await startEditorServer({editorDir: dir, connectionFile: path.join(dir, 'c.json'), timeoutMs: 200});
  try {
    // 连上事件流、打过招呼，但从不回复
    const mute = http.get(`${server.baseUrl}/__lgui_editor/events?clientId=mute`, {headers: {'sec-fetch-site': 'same-origin'}});
    await new Promise(r => mute.on('response', r));
    await request(server.baseUrl, '/__lgui_editor/hello', {method: 'POST', headers: {'sec-fetch-site': 'same-origin', origin: server.baseUrl}, body: {clientId: 'mute', url: `${server.baseUrl}/`}});
    const res = await request(server.baseUrl, '/__lgui_editor/rpc', {method: 'POST', headers: {authorization: `Bearer ${server.token}`}, body: {clientId: 'mute', request: {method: 'state'}}});
    assert.equal(res.status, 504);
    assert.equal(res.body.error.code, 'result_unknown');
    mute.destroy();
  } finally {
    await server.close();
  }
});

test('editor props 的属性换算：布尔、数字、位置尺寸合并、按钮标题合并进实例属性', () => {
  const node = {name: 'button', position: {x: 1, y: 2}, size: {width: 3, height: 4}, instanceProperties: {extensionType: 'Button', title: '旧', icon: ''}};
  assert.deepEqual(toEditorProps(['visible=false', 'alpha=0.5', 'x=10', 'height=40', 'title=出售'], node), {
    visible: false, alpha: 0.5, position: {x: 10, y: 2}, size: {width: 3, height: 40},
    componentInstanceProperties: {extensionType: 'Button', title: '出售', icon: ''}
  });
  assert.deepEqual(toEditorProps(['text=a=b', 'color=#ff0000'], {name: 't', position: {}, size: {}}), {text: 'a=b', color: '#ff0000'});
  for (const bad of [['nope=1'], ['visible=yes'], ['alpha=x'], ['title'], []]) assert.throws(() => toEditorProps(bad, node), e => e.code === 'LGUI-CLI-101', bad.join(' '));
  assert.throws(() => toEditorProps(['title=x'], {name: 't', position: {}, size: {}}), e => e.code === 'LGUI-CLI-101');
});

test('editor props 报错：控件不存在 LGUI-CLI-102；编辑器没开 LGUI-CLI-100', async () => {
  const parent = tmp();
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const json = async argv => JSON.parse((await run([...argv, '--json'], root)).stdout);
  assert.equal((await json(['editor', 'props', 'Main/Nope', 'title', 'text=x'])).errors[0].code, 'LGUI-CLI-102');
  assert.equal((await json(['editor', 'props', 'Main/MainView', 'nope', 'text=x'])).errors[0].code, 'LGUI-CLI-102');
  assert.equal((await json(['editor', 'props', 'Main/MainView', 'title', 'text=x'])).errors[0].code, 'LGUI-CLI-100');
  fs.mkdirSync(path.dirname(connectionPath(root)), {recursive: true});
  fs.writeFileSync(connectionPath(root), JSON.stringify({baseUrl: 'http://127.0.0.1:9', token: 'x'}));
  assert.equal((await json(['editor', 'props', 'Main/MainView', 'title', 'text=x'])).errors[0].code, 'LGUI-CLI-100');
});
