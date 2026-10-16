import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {sendCommand,sleep} from '../../scripts/command.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalized=view=>({...view,revision:0});
const parse=text=>JSON.parse(text.replace(/^\uFEFF/,''));
const inside=(r,w,h)=>r&&r.width>0&&r.height>0&&r.x>=-.1&&r.y>=-.1&&r.x+r.width<=w+.1&&r.y+r.height<=h+.1;

export async function acceptUnity(argv=process.argv.slice(2)){
 const directory=path.resolve(argv[0]||''),mode=argv[1]||'player';assert(['editor','player'].includes(mode));assert((await fs.stat(directory)).isDirectory());
 const cyclesIndex=argv.indexOf('--cycles'),cycles=cyclesIndex<0?20:Number(argv[cyclesIndex+1]);assert(Number.isInteger(cycles)&&cycles>=1&&cycles<=200);
 const keepOpen=argv.includes('--keep-open');
 const report={schemaVersion:1,startedAt:new Date().toISOString(),mode,directory,cycles,keepOpen,status:'running',checks:[],textFitChecks:[],steps:[],captures:[],resolutions:[],lifecycle:[],limitations:['File commands run on the Unity main thread. click-control/select-slot invoke real FairyGUI event handlers; no OS input, hit-test acceptance or Computer Use.','Editor Screen.SetResolution requests are not assumed to change GameView. Actual Screen and PNG dimensions are recorded.','No whole-reference 1:1 visual pass is assigned.']};
 report.sourceFiles=[];
 for(const relative of ['accept-unity-fidelity.mjs','app.js','layout-shared.js','reference-fixture.json','../../InventoryUnity/Assets/Migration/FidelityInventoryHost.cs','../../InventoryUnity/Assets/Migration/FidelityVerificationPump.cs','../../InventoryUnity/Assets/Editor/FidelityMigrationBuild.cs','../../InventoryUnity/Assets/Editor/FidelityEditorVerification.cs','../../InventoryUnity/Assets/Resources/FidelityResourceMap.json']){
  const bytes=await fs.readFile(path.resolve(here,relative));report.sourceFiles.push({file:relative,bytes:bytes.length,sha256:hash(bytes)});
 }
 const check=(name,condition,facts)=>{report.checks.push({name,passed:!!condition,facts});assert(condition,name);};
 const readFile=async()=>parse(await fs.readFile(path.join(directory,'latest-snapshot.json'),'utf8'));
 const business=snapshot=>parse(snapshot.rawTsResponse);
 const call=async(op,args={})=>{const response=await sendCommand(directory,op,args,{timeoutMs:45000});report.steps.push({op,args:op==='load'?{json:'reference fixture'}:args,ok:response.ok,inputMethod:response.inputMethod,startFrame:response.startFrame,endFrame:response.endFrame});assert(response.ok,JSON.stringify(response.error));assert(response.snapshot,`Snapshot for ${op}`);assert.deepEqual(response.snapshot.errors,[],'No host errors');return response.snapshot;};
 const click=name=>call('click-control',{name}),select=id=>call('select-slot',{id});
 const visibleControls=(snapshot,names,label)=>{
  const controls=names.map(name=>snapshot.ui.controls.find(control=>control.name===name));
  check(label,controls.every(control=>control?.visible&&inside(control.rect,snapshot.ui.screenWidth,snapshot.ui.screenHeight)),{screen:{width:snapshot.ui.screenWidth,height:snapshot.ui.screenHeight},controls});
 };
 let initial,savePath,originalSave,originalExisted=false,quitRequested=false;
 const fixtureBytes=await fs.readFile(path.join(here,'reference-fixture.json')),fixtureJson=fixtureBytes.toString('utf8');
 async function restoreSave(){
  if(!savePath)return;
  if(originalExisted){await fs.writeFile(savePath,originalSave);report.saveRestoration={status:'restored-preexisting-bytes',sha256:hash(originalSave)};return;}
  let exists=false;try{exists=(await fs.stat(savePath)).isFile();}catch(error){if(error.code!=='ENOENT')throw error;}
  if(exists){const s=await call('load',{json:fixtureJson});assert(business(s).ok);await call('save-file');const restored=await fs.readFile(savePath);check('new test save is reset to the initial shared fixture',JSON.stringify(parse(restored.toString('utf8')))===JSON.stringify(parse(fixtureJson)));report.saveRestoration={status:'new-file-reset-through-shared-load-and-save',sha256:hash(restored)};}
 }
 async function capture(name){
  const response=await sendCommand(directory,'screenshot',{}, {timeoutMs:45000});assert(response.ok,JSON.stringify(response.error));assert(response.screenshotPath);
  let bytes;for(let i=0;i<40;i++){try{bytes=await fs.readFile(response.screenshotPath);if(bytes.length>24&&bytes.subarray(bytes.length-8,bytes.length-4).toString('ascii')==='IEND')break;}catch{}await sleep(50);}
  assert(bytes&&bytes.length>24&&bytes.subarray(1,4).toString('ascii')==='PNG');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),snapshot=response.snapshot;
  check(`${name}: screenshot matches actual Screen dimensions`,width===snapshot.ui.screenWidth&&height===snapshot.ui.screenHeight,{width,height,screen:{width:snapshot.ui.screenWidth,height:snapshot.ui.screenHeight}});
  const friendly=path.join(directory,`${name}.png`);await fs.copyFile(response.screenshotPath,friendly);
  for(const field of ['description','itemNote']){
   const control=snapshot.ui.controls.find(control=>control.name===field);if(!control?.visible||!control.text?.trim())continue;
   const actualTextHeight=control.textHeight*snapshot.ui.fidelity.scale*(snapshot.ui.screenHeight/snapshot.ui.rootHeight);
   report.textFitChecks.push({capture:name,field,passed:actualTextHeight<=control.rect.height+.1,text:control.text,localTextHeight:control.textHeight,actualTextHeight,actualRect:control.rect});
  }
  report.captures.push({name,path:friendly,originalPath:response.screenshotPath,width,height,sha256:hash(bytes),ui:snapshot.ui});return snapshot;
 }
 try{
  const deadline=Date.now()+120000;while(Date.now()<deadline){try{initial=await readFile();if(initial.ready)break;if(initial.errors?.length)throw Error(initial.errors.join('\n'));}catch(error){if(error.code!=='ENOENT'&&error.name!=='SyntaxError')throw error;}await sleep(100);}
  assert(initial?.ready,'Fidelity host ready within 120 seconds');assert.deepEqual(initial.errors,[]);
  report.initial=initial;savePath=initial.ui.savePath;assert(savePath&&path.basename(savePath)==='FidelityInventory-v1.json','Dedicated Fidelity save path');
  try{originalSave=await fs.readFile(savePath);originalExisted=true;await fs.writeFile(path.join(directory,'preexisting-fidelity-save.bak'),originalSave);}catch(error){if(error.code!=='ENOENT')throw error;}
  report.saveBefore={path:savePath,existed:originalExisted,sha256:originalExisted?hash(originalSave):null};
  let s=await call('snapshot'),r=business(s);
  check('native host starts with the real 24-stack fixture',r.view.usedSlots===24&&r.view.capacity===30&&r.view.coins===12480&&r.view.selectedId==='sword-1'&&r.view.visible.length===24);
  check('one shared listener and one live V8 runtime',r.session.listenerCount===1&&s.metrics.runtimeInstances===1&&s.metrics.runtimeDisposals===0);
  check('24 native fixed components are truthfully reported',s.ui.virtualList===false&&s.ui.physicalRows===24&&s.ui.virtualItems===24);
  const expectedBusiness=hash(await fs.readFile(path.join(here,'app.js')));check('Unity runs the exact browser business bundle',s.businessSha256===expectedBusiness,{actual:s.businessSha256,expected:expectedBusiness});
  const expectedLayout=hash(await fs.readFile(path.join(here,'layout-shared.js')));check('Unity runs the exact shared layout TextAsset',s.layoutSha256===expectedLayout,{actual:s.layoutSha256,expected:expectedLayout});
  const text=name=>s.ui.controls.find(control=>control.name===name)?.text;
  check('native FairyGUI text shows grouped wallet and all three real sword stats',text('coins')==='12,480'&&text('stat_attack')==='+48'&&text('stat_crit')==='+6%'&&text('stat_durability')==='100',{coins:text('coins'),attack:text('stat_attack'),crit:text('stat_crit'),durability:text('stat_durability')});
  await capture('initial-actual-'+mode);
  s=await click('primary');r=business(s);check('actual FairyGUI primary event equips stable sword',r.ok&&r.view.equipment.weapon?.id==='sword-1'&&r.view.usedSlots===23);
  s=await click('primary');r=business(s);check('actual FairyGUI primary event unequips stable sword',r.ok&&r.view.equipment.weapon===null&&r.view.usedSlots===24&&r.view.selectedId==='sword-1');
  await select('redPotion-1');s=await click('primary');r=business(s);check('actual slot and use events consume one',r.ok&&r.view.selected.quantity===7);
  const beforeSale=normalized(r.view);s=await click('sell');check('sale confirmation does not commit before consent',s.ui.popup&&JSON.stringify(normalized(business(s).view))===JSON.stringify(beforeSale));visibleControls(s,['confirm','cancel'],'real confirmation controls fit actual viewport');
  s=await click('cancel');check('real cancellation leaves state unchanged',!s.ui.popup&&JSON.stringify(normalized(business(s).view))===JSON.stringify(beforeSale));
  await click('sell');s=await click('confirm');r=business(s);check('real confirmation sells one for exact price',r.ok&&r.view.selected.quantity===6&&r.view.coins===12492);
  s=await click('menu');visibleControls(s,['menu_save','menu_load','menu_reward'],'real filesystem menu controls fit actual viewport');s=await click('menu_save');const savedView=normalized(business(s).view),savedBytes=await fs.readFile(savePath);report.savedTestState={path:savePath,sha256:hash(savedBytes),bytes:savedBytes.length};
  check('real menu save writes the dedicated filesystem save',s.metrics.fileSaves>=1&&parse(savedBytes.toString('utf8')).items.find(item=>item.id==='redPotion-1').quantity===6);
  await click('primary');await click('menu');s=await click('menu_load');check('actual menu load restores full shared business',JSON.stringify(normalized(business(s).view))===JSON.stringify(savedView)&&s.metrics.fileLoads>=1);
  s=await call('query',{query:'药水'});check('shared Chinese query returns three kinds',business(s).view.visible.length===3);await call('query',{query:''});
  s=await click('sort');visibleControls(s,['sort_default','sort_name','sort_rarity','sort_price','sort_quantity'],'real sort choices fit actual viewport');s=await click('sort_name');check('actual sort menu changes shared sort',business(s).view.sort==='name');
  await click('menu');s=await click('menu_reward');visibleControls(s,['reward-progress','reward-claim','confirm','cancel'],'real reward controls fit actual viewport');await click('reward-progress');s=await click('reward-claim');r=business(s);check('real reward events reuse original rules and add ten coins',r.ok&&r.view.coins===12502);await click('cancel');
  const beforeCycles=normalized(r.view);
  for(let i=0;i<cycles;i++){s=await call('close');assert.equal(business(s).session.listenerCount,0);assert.equal(s.metrics.runtimeDisposals,0);s=await call('open');assert.equal(business(s).session.listenerCount,1);if(i===0||i===cycles-1)report.lifecycle.push({cycle:i+1,session:business(s).session,metrics:s.metrics});}
  check('limited close/reopen keeps one VM and preserves full state',JSON.stringify(normalized(business(s).view))===JSON.stringify(beforeCycles)&&s.metrics.runtimeInstances===1&&s.metrics.runtimeDisposals===0&&business(s).session.closedCallbacks===0&&business(s).session.listenerErrors===0);
  check('one V8 Tick runs per Unity Update',s.metrics.tickCalls===s.metrics.updateFrames,{ticks:s.metrics.tickCalls,updates:s.metrics.updateFrames});
  await call('load',{json:fixtureJson});
  const targets=mode==='player'?[{width:1280,height:800},{width:794,height:727},{width:486,height:727},{width:390,height:844}]:[{width:794,height:727}];
  for(const target of targets){
   await call('resize',target);await sleep(400);s=await call('snapshot');
   if(mode==='player'){const until=Date.now()+5000;while((s.ui.screenWidth!==target.width||s.ui.screenHeight!==target.height)&&Date.now()<until){await sleep(150);s=await call('snapshot');}}
   const matched=s.ui.screenWidth===target.width&&s.ui.screenHeight===target.height;report.resolutions.push({requested:target,actual:{width:s.ui.screenWidth,height:s.ui.screenHeight},matched,status:matched?'matched':'partial-editor-gameview-size',fidelity:s.ui.fidelity});
   if(mode==='player')check(`Player actually adopts ${target.width}x${target.height}`,matched,report.resolutions.at(-1));
   await select('sword-1');s=await capture(`${mode}-${target.width}x${target.height}-sword`);
   const rows=s.ui.rows||[];check(`${mode}: all 24 physical item bounds fit actual Screen ${s.ui.screenWidth}x${s.ui.screenHeight}`,rows.length===24&&rows.every(row=>inside(row.rect,s.ui.screenWidth,s.ui.screenHeight)),{screen:{width:s.ui.screenWidth,height:s.ui.screenHeight},rows});
   if(mode==='player'&&target.width<1000){check(`${target.width}: actual adaptive scale is one`,s.ui.fidelity.scale===1,s.ui.fidelity);await select('ring-1');await capture(`${mode}-${target.width}x${target.height}-ring`);await select('key-1');await capture(`${mode}-${target.width}x${target.height}-quest`);}
   if(mode==='player'&&target.width===390){
    await select('redPotion-1');s=await click('sell');visibleControls(s,['confirm','cancel'],'390: native sale modal buttons fit actual Screen');await capture('player-390x844-sale-modal');await click('cancel');
    s=await click('menu');visibleControls(s,['menu_save','menu_load','menu_reward'],'390: native filesystem menu fits actual Screen');s=await click('menu_reward');visibleControls(s,['reward-progress','reward-claim','confirm','cancel'],'390: native reward modal buttons fit actual Screen');await capture('player-390x844-rewards-modal');await click('cancel');
    s=await click('sort');visibleControls(s,['sort_default','sort_name','sort_rarity','sort_price','sort_quantity'],'390: native sort choices fit actual Screen');await click('sort_default');
   }
  }
  await call('load',{json:fixtureJson});await restoreSave();
  report.finalBeforeQuit=await call('snapshot');
  if(!keepOpen){await call(mode==='editor'?'quit-editor':'quit');quitRequested=true;const until=Date.now()+20000;let shutdown;while(Date.now()<until){shutdown=await readFile();if(shutdown.metrics?.runtimeDisposals===1)break;await sleep(100);}report.shutdown=shutdown;check('normal shutdown releases listener and disposes runtime exactly once',shutdown.metrics.runtimeDisposals===1&&business(shutdown).session.listenerCount===0&&shutdown.errors.length===0,shutdown.metrics);}
  report.businessStatus='passed';const textClipped=report.textFitChecks.some(check=>!check.passed);report.visualStatus=textClipped?'failed-native-text-bounds':'pending-human-review';report.status=textClipped?'failed':mode==='editor'&&report.resolutions.some(r=>!r.matched)?'partial':'passed';if(textClipped)report.failure={message:'Native paragraph text exceeds its actual field bounds; business checks completed, screenshots retained.'};
 }catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};try{report.failureSnapshot=await readFile();}catch{}if(!quitRequested)try{await capture('failure-current');}catch(captureError){report.captureError=String(captureError);}try{await restoreSave();}catch(restoreError){report.saveRestorationError=String(restoreError);}}
 finally{report.completedAt=new Date().toISOString();const file=path.join(directory,`fidelity-acceptance-${mode}-${Date.now()}.json`);await fs.writeFile(file,JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,businessStatus:report.businessStatus,checks:report.checks.map(({name,passed})=>({name,passed})),textFitChecks:report.textFitChecks,resolutions:report.resolutions.map(({requested,actual,matched,status,fidelity})=>({requested,actual,matched,status,mode:fidelity.mode,variant:fidelity.variant,columns:fidelity.columns,scale:fidelity.scale})),failure:report.failure,output:file},null,2));}
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const result=await acceptUnity();process.exitCode=result.status==='failed'?1:result.status==='partial'?2:0;}
