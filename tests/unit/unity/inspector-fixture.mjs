import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {once} from 'node:events';

function frame(text, opcode = 1) {
  const body = Buffer.from(text);
  const header = body.length < 126 ? Buffer.from([0x80 | opcode, body.length]) :
    Buffer.from([0x80 | opcode, 126, body.length >> 8, body.length & 255]);
  return Buffer.concat([header, body]);
}
// A real loopback HTTP discovery endpoint and RFC6455 connection, without a WS dependency.
export async function fixture(onRequest, discovery) {
  const sockets = new Set();
  const requests = [];
  let discoveryCount = 0;
  const server = http.createServer((request, response) => {
    assert.equal(request.url, '/json/list');
    discoveryCount++;
    const value = discovery?.({port: server.address().port, count: discoveryCount});
    response.writeHead(value?.status ?? 200, {'content-type': 'application/json'});
    response.end(JSON.stringify(value?.body ?? [{webSocketDebuggerUrl: `ws://127.0.0.1:${server.address().port}`} ]));
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  server.on('upgrade', (request, socket, head) => {
    const accept = createHash('sha1').update(request.headers['sec-websocket-key'] +
      '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
    let pending = head;
    const consume = data => {
      pending = Buffer.concat([pending, data]);
      while (pending.length >= 2) {
        const opcode = pending[0] & 15;
        const masked = (pending[1] & 128) !== 0;
        let length = pending[1] & 127;
        let offset = 2;
        if (length === 126) {
          if (pending.length < 4) return;
          length = pending.readUInt16BE(2);
          offset = 4;
        }
        assert.notEqual(length, 127, 'Fixture payloads stay below 64 KiB');
        const maskLength = masked ? 4 : 0;
        if (pending.length < offset + maskLength + length) return;
        const mask = pending.subarray(offset, offset + maskLength);
        offset += maskLength;
        const body = Buffer.from(pending.subarray(offset, offset + length));
        if (masked) for (let index = 0; index < body.length; index++) body[index] ^= mask[index % 4];
        pending = pending.subarray(offset + length);
        if (opcode === 8) { socket.end(frame('', 8)); return; }
        if (opcode === 9) { socket.write(frame(body, 10)); continue; }
        assert.equal(opcode, 1);
        const message = JSON.parse(body.toString());
        requests.push(message);
        onRequest(message, {
          reply: result => socket.write(frame(JSON.stringify({id: message.id, result}))),
          raw: text => socket.write(frame(text)),
          error: error => socket.write(frame(JSON.stringify({id: message.id, error}))),
          close: () => socket.end(frame('', 8))
        });
      }
    };
    socket.on('data', consume);
    consume(Buffer.alloc(0));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    port: server.address().port, requests,
    get discoveryCount() { return discoveryCount; },
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    }
  };
}
