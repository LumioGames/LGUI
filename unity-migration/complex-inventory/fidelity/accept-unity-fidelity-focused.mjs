import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sendCommand,sleep} from '../../scripts/command.mjs';

// A narrow Editor check for the exact final Host. Deliberately does not read or write saves.
const here=path.dirname(fileURLToPath(import.meta.url));
const directory=path.resolve(process.argv[2]||'');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schemaVersion:1,kind:'focused-final-editor',startedAt:new Date().toISOString(),directory,status:'running',checks:[],steps:[],captures:[],limitations:['Official Editor/file instrumentation only; no OS input, hit test acceptance or Computer Use.','Actual GameView/Screen dimensions are recorded; no requested size is treated as a real resize.','No save-file/load-file operation is issued.']};
const check=(name,condition,facts)=>{report.checks.push({name,passed:!!condition,facts});assert(condition,name);};
const read=async()=>JSON.parse(await fs.readFile(path.join(directory,'latest-snapshot.json'),'utf8'));
const business=s=>JSON.parse(s.rawTsResponse);
const call=async(op,args={})=>{const r=await sendCommand(directory,op,args,{timeoutMs:45000});report.steps.push({op,args,ok:r.ok,inputMethod:r.inputMethod});assert(r.ok,JSON.stringify(r.error));assert.deepEqual(r.snapshot.errors,[]);return r.snapshot;};
let latest;
try{
 const deadline=Date.now()+180000;
 while(Date.now()<deadline){try{latest=await read();if(latest.ready)break;if(latest.errors?.length)throw Error(latest.errors.join('\n'));}catch(error){if(error.code!=='ENOENT'&&error.name!=='SyntaxError')throw error;}await sleep(150);}
 check('final native Editor is ready',latest?.ready,latest?.errors);
 latest=await call('snapshot');report.initial=latest;
 check('final Editor business and layout TextAssets match the web',latest.businessSha256===hash(await fs.readFile(path.join(here,'app.js')))&&latest.layoutSha256===hash(await fs.readFile(path.join(here,'layout-shared.js'))),{business:latest.businessSha256,layout:latest.layoutSha256});
 const native=name=>latest.ui.controls.find(c=>c.name===name);
 check('final native wallet and three sword stats are correct',native('coins')?.text==='12,480'&&native('stat_attack')?.text==='+48'&&native('stat_crit')?.text==='+6%'&&native('stat_durability')?.text==='100');
 check('final native description fits its actual text field',native('description')?.textFits&&native('description').textHeight<=native('description').localHeight,{description:native('description'),actualScreen:{width:latest.ui.screenWidth,height:latest.ui.screenHeight}});
 const shot=await sendCommand(directory,'screenshot');assert(shot.ok&&shot.screenshotPath);
 let bytes;for(let i=0;i<40;i++){bytes=await fs.readFile(shot.screenshotPath);if(bytes.subarray(bytes.length-8,bytes.length-4).toString('ascii')==='IEND')break;await sleep(50);}
 check('final Editor PNG matches actual GameView Screen',bytes.readUInt32BE(16)===shot.snapshot.ui.screenWidth&&bytes.readUInt32BE(20)===shot.snapshot.ui.screenHeight,{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)});
 const capture=path.join(directory,'final-editor-actual-sword.png');await fs.copyFile(shot.screenshotPath,capture);report.captures.push({path:capture,sha256:hash(bytes),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)});
 latest=await call('click-control',{name:'primary'});check('final Editor real equip event works',business(latest).view.equipment.weapon?.id==='sword-1');
 latest=await call('click-control',{name:'primary'});check('final Editor real unequip event works',business(latest).view.equipment.weapon===null&&business(latest).view.usedSlots===24);
 latest=await call('close');check('final Editor close releases the business listener without disposing V8',business(latest).session.listenerCount===0&&latest.metrics.runtimeDisposals===0);
 latest=await call('open');check('final Editor reopen preserves one V8 and one listener',business(latest).session.listenerCount===1&&latest.metrics.runtimeInstances===1&&business(latest).view.selectedId==='sword-1');
 check('final Editor ticks V8 exactly once per Update',latest.metrics.tickCalls===latest.metrics.updateFrames);
 report.finalBeforeQuit=latest;await call('quit-editor');
 const stop=Date.now()+20000;while(Date.now()<stop){latest=await read();if(latest.metrics.runtimeDisposals===1)break;await sleep(100);}
 report.shutdown=latest;check('final Editor shutdown disposes once and releases its listener',latest.metrics.runtimeDisposals===1&&business(latest).session.listenerCount===0&&latest.errors.length===0);
 report.status='passed';
}catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};try{report.failureSnapshot=await read();}catch{}}
report.completedAt=new Date().toISOString();
report.sourceFiles=[];
for(const file of ['accept-unity-fidelity-focused.mjs','app.js','layout-shared.js','../../InventoryUnity/Assets/Migration/FidelityInventoryHost.cs']){const bytes=await fs.readFile(path.resolve(here,file));report.sourceFiles.push({file,bytes:bytes.length,sha256:hash(bytes)});}
const output=path.join(directory,`focused-editor-${Date.now()}.json`);await fs.writeFile(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,checks:report.checks.map(({name,passed})=>({name,passed})),captures:report.captures,failure:report.failure,output},null,2));
process.exitCode=report.status==='passed'?0:1;
