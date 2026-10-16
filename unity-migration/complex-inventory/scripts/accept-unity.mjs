import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sendCommand,sleep} from '../../scripts/command.mjs';
import {runContract} from './contract.mjs';
const directory=path.resolve(process.argv[2]);const mode=process.argv[3]||'player';
const start=Date.now();let s;
while(Date.now()-start<90000){try{s=JSON.parse(await fs.readFile(path.join(directory,'latest-snapshot.json'),'utf8'));if(s.ready)break;}catch{}await sleep(100);}
if(!s?.ready)throw Error('Complex Unity host not ready');
const adapter={mode,call:async(op,args)=>{const r=await sendCommand(directory,op,args);if(!r.ok)throw Error(JSON.stringify(r.error));return r.snapshot;}};
const report=await runContract(adapter,{cycles:200});
if(report.status==='passed'){
 report.screenshots=[];
 for(const [name,width,height]of [['wide',1280,800],['narrow',390,844]]){
  await adapter.call('query',{query:''});await adapter.call('sort',{sort:'default'});await adapter.call('select',{id:'sword-2'});
  await adapter.call('resize',{width,height});await sleep(500);const r=await sendCommand(directory,'screenshot');report.screenshots.push({name,path:r.screenshotPath,width:r.snapshot.ui.screenWidth,height:r.snapshot.ui.screenHeight});
  if(mode==='player'&&(r.snapshot.ui.screenWidth!==width||r.snapshot.ui.screenHeight!==height)){report.status='failed';report.failure={message:'Player resize failed '+name};}
 }
}
const out=path.join(directory,'complex-acceptance-'+mode+'-'+Date.now()+'.json');await fs.writeFile(out,JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,checks:report.checks,failure:report.failure,out,screenshots:report.screenshots},null,2));
if(report.status!=='passed')process.exitCode=1;
