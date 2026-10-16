import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(root,'evidence');
async function latest(dir,prefix){
 const candidates=(await fs.readdir(dir)).filter(n=>n.startsWith(prefix)&&n.endsWith('.json')).sort();
 if(!candidates.length)throw Error('Missing report '+dir+'/'+prefix);
 const file=path.join(dir,candidates.at(-1));return {file,data:JSON.parse(await fs.readFile(file,'utf8'))};
}
const a=await latest(evidence,'chrome-acceptance-'),b=await latest(path.join(evidence,'player-first'),'complex-acceptance-player-');
const report={status:'running',createdAt:new Date().toISOString(),inputs:[a.file,b.file],comparedSteps:0};
try{
 assert.equal(a.data.status,'passed');assert.equal(b.data.status,'passed');
 assert(a.data.checks.some(c=>c.name==='slot labels keep readable ivory text'&&c.passed),'Final visual color regression required');
 const x=a.data.contract,y=b.data;
 assert.equal(x.status,'passed');assert.equal(x.steps.length,y.steps.length);
 for(let i=0;i<x.steps.length;i++){
  assert.deepEqual(x.steps[i],y.steps[i],`Business response diverged at step ${i+1} (${x.steps[i].op})`);report.comparedSteps++;
 }
 assert.deepEqual(x.savedState,y.savedState);assert.deepEqual(x.finalView,y.finalView);
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
 const bundle=await fs.readFile(path.join(root,'dist/ComplexInventoryApp.txt'));
 const web=await fs.readFile(path.join(root,'web/app.js'));
 const unity=await fs.readFile(path.join(root,'../InventoryUnity/Assets/Resources/ComplexInventoryApp.txt'));
 assert.deepEqual(bundle,web);assert.deepEqual(bundle,unity);report.bundleSha256=sha(bundle);
 const layout=await fs.readFile(path.join(root,'scripts/layout.js'));
 assert.deepEqual(layout,await fs.readFile(path.join(root,'../InventoryUnity/Assets/Resources/ComplexInventoryLayout.txt')));report.layoutSha256=sha(layout);
 report.sameBundle=true;report.sameLayout=true;report.status='passed';
 report.scope='Every instrumented business step: op, input args, success/error, revision, full normalized view SHA256, session. UI rendering and physical input are separate evidence.';
}catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};}
await fs.writeFile(path.join(evidence,'cross-runtime-comparison.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.status!=='passed')process.exitCode=1;
