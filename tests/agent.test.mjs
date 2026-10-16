import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../tools/agent.mjs',import.meta.url));
const run=args=>new Promise(resolve=>{const child=spawn(process.execPath,[cli,...args],{windowsHide:true});let stdout='',stderr='';child.stdout.on('data',v=>stdout+=v);child.stderr.on('data',v=>stderr+=v);child.on('close',code=>resolve({code,stdout,stderr}));});
test('client rejects a remote connection before sending the token',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-agent-')),file=path.join(dir,'connection.json');
 fs.writeFileSync(file,JSON.stringify({baseUrl:'https://example.com',token:'test-only'}));
 const result=await run(['--connection',file,'clients']);assert.equal(result.code,1);assert.match(result.stderr,/localhost/);assert(!result.stderr.includes('test-only'));
});
test('client preserves exact request payload and refuses to overwrite exports',async()=>{
 const received=[];
 const server=http.createServer((req,res)=>{let body='';req.on('data',v=>body+=v);req.on('end',()=>{received.push(body?JSON.parse(body):null);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,data:{base64:Buffer.from('export').toString('base64')}}));});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-agent-')),file=path.join(dir,'connection.json'),request=path.join(dir,'request.json'),output=path.join(dir,'out.zip');
  fs.writeFileSync(file,JSON.stringify({baseUrl:`http://127.0.0.1:${server.address().port}`,token:'test-only'}));
  const payload={method:'export',identity:{sessionId:'s',generation:1,revision:7}};fs.writeFileSync(request,JSON.stringify(payload));
  assert.equal((await run(['--connection',file,'call','client-1',request,output])).code,0);
  assert.deepEqual(received,[{clientId:'client-1',request:payload}]);assert.equal(fs.readFileSync(output,'utf8'),'export');
  assert.equal((await run(['--connection',file,'call','client-1',request,output])).code,1);assert.equal(received.length,1);
 }finally{server.close();}
});
