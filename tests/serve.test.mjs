import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('example server can use an explicit isolated port',async()=>{
 const child=spawn(process.execPath,[fileURLToPath(new URL('../unity-migration/complex-inventory/scripts/serve.mjs',import.meta.url)),'--port','4282'],{windowsHide:true});
 let output='';child.stdout.on('data',v=>output+=v);child.stderr.on('data',()=>{});
 try{
  for(let i=0;i<40&&!output;i++)await new Promise(r=>setTimeout(r,50));
  assert.match(output,/4282/);
  const response=await fetch('http://127.0.0.1:4282/fidelity/');assert.equal(response.status,200);assert.match(await response.text(),/fidelity/i);
 }finally{child.kill();}
});
