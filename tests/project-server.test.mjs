import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {once} from 'node:events';
import {serveProject} from '../tools/serve-project.mjs';
test('generic server serves the selected web root and refuses linked outside assets',async()=>{
 const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-server-')),outside=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-outside-'));
 fs.mkdirSync(path.join(workspace,'site'));fs.writeFileSync(path.join(workspace,'site/index.html'),'<title>Selected project</title>');fs.writeFileSync(path.join(outside,'private.txt'),'outside-file');
 fs.symlinkSync(outside,path.join(workspace,'site/alias'),process.platform==='win32'?'junction':'dir');
 const server=serveProject(workspace,{web:{root:'site'}},0);await once(server,'listening');
 try{const base=`http://127.0.0.1:${server.address().port}`;assert.match(await(await fetch(base)).text(),/Selected project/);assert.equal((await fetch(base+'/alias/private.txt')).status,404);assert.equal((await fetch(base+'/%2e%2e%5coutside')).status,404);}
 finally{server.close();server.closeAllConnections();}
});
