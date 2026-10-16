import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const normalizedView=view=>({...view,revision:0});
export async function runContract(adapter,{cycles=200}={}){
 const report={mode:adapter.mode,startedAt:new Date().toISOString(),inputMethod:'instrumented shared operation contract; physical input tested separately',checks:[],steps:[],lifecycle:[],cycles};
 const check=(name,condition)=>{report.checks.push({name,passed:!!condition});assert.ok(condition,name);};
 const read=s=>JSON.parse(s.rawTsResponse);
 const call=async(op,args={})=>{
  const s=await adapter.call(op,args);assert.equal(s.ready,true,'host ready');assert.deepEqual(s.errors,[],'no host errors');
  const r=read(s);report.steps.push({op,args:op==='load'?{json:'stored save JSON'}:args,ok:r.ok,errorCode:r.errorCode,revision:r.view.revision,stateSha256:createHash('sha256').update(JSON.stringify(normalizedView(r.view))).digest('hex'),session:r.session});return {s,r};
 };
 try{
  let {s,r}=await call('snapshot');
  check('26 stacks / 24 generated icon kinds / 30 slots',r.view.usedSlots===26&&new Set(r.view.items.map(x=>x.iconIndex)).size===24&&r.view.capacity===30);
  check('initial wallet and selection',r.view.coins===12480&&r.view.selectedId==='sword-1');
  check('one shared business listener',r.session.listenerCount===1);
  check('real virtual grid',s.ui.virtualList===true&&s.ui.virtualItems===26&&s.ui.physicalRows>0);
  ({r}=await call('query',{query:'药水'}));check('Chinese query',r.view.visible.length===3);
  ({r}=await call('category',{category:'equipment'}));check('query and category compose',r.view.visible.length===0);
  ({r}=await call('query',{query:''}));check('equipment category',r.view.visible.length===12);
  ({r}=await call('sort',{sort:'price'}));check('sort price deterministic',r.view.visible[0].id==='staff-1');
  await call('category',{category:'all'});await call('select',{id:'sword-1'});
  ({r}=await call('equip',{id:'sword-1'}));check('equipping moves stable object to slot',r.view.equipment.weapon.id==='sword-1'&&r.view.usedSlots===25&&r.view.selected.equipped);
  ({r}=await call('equip',{id:'axe-1'}));check('slot replacement returns old sword',r.view.equipment.weapon.id==='axe-1'&&r.view.items.some(x=>x.id==='sword-1')&&r.view.usedSlots===25);
  ({r}=await call('unequip',{slot:'weapon'}));check('unequip retains identity',r.view.equipment.weapon===null&&r.view.selected.id==='axe-1'&&!r.view.selected.equipped&&r.view.usedSlots===26);
  await call('select',{id:'redPotion-1'});({r}=await call('use',{id:'redPotion-1'}));check('use consumes one from selected stack',r.view.selected.quantity===4);
  ({r}=await call('sell',{id:'ore-1',quantity:2}));check('quantity sale credits exact coins',r.view.coins===12496&&r.view.items.find(x=>x.id==='ore-1').quantity===10);
  let before=normalizedView(r.view);
  ({r}=await call('sell',{id:'ore-1',quantity:-1}));check('negative quantity fails atomically',!r.ok&&r.errorCode==='invalid_quantity'&&JSON.stringify(normalizedView(r.view))===JSON.stringify(before));
  ({r}=await call('sell',{id:'key-1',quantity:1}));check('quest sale rejected atomically',!r.ok&&r.errorCode==='quest_item'&&JSON.stringify(normalizedView(r.view))===JSON.stringify(before));
  await call('progress');({r}=await call('claim',{id:'item-0'}));check('original reward model reused',r.ok&&r.view.coins===12506);
  ({r}=await call('claim',{id:'item-0'}));check('duplicate reward rejected',!r.ok&&r.view.coins===12506);
  await call('equip',{id:'sword-2'});await call('sort',{sort:'rarity'});await call('query',{query:'晶'});
  ({r}=await call('save'));const saved=r.result.json,business=normalizedView(r.view);report.savedState=JSON.parse(saved);
  await call('query',{query:''});await call('use',{id:'redPotion-1'});({r}=await call('load',{json:saved}));
  check('full save restores quantity equipment wallet filters and rewards',r.ok&&JSON.stringify(normalizedView(r.view))===JSON.stringify(business));
  ({r}=await call('load',{json:'{'}));check('malformed save rejected atomically',!r.ok&&r.errorCode==='invalid_save'&&JSON.stringify(normalizedView(r.view))===JSON.stringify(business));
  await call('save-file');await call('query',{query:'does-not-exist'});({r}=await call('load-file'));check('platform storage restore',r.ok&&JSON.stringify(normalizedView(r.view))===JSON.stringify(business));
  for(let i=0;i<cycles;i++){
   ({s,r}=await call('close'));assert.equal(r.session.listenerCount,0);
   ({s,r}=await call('open'));assert.equal(r.session.listenerCount,1);assert.equal(r.session.closedCallbacks,0);
   if(i%20===0||i===cycles-1)report.lifecycle.push({cycle:i+1,ui:s.ui,metrics:s.metrics,session:r.session});
  }
  check('close/reopen preserves full state',JSON.stringify(normalizedView(r.view))===JSON.stringify(business));
  check('one subscription / no callbacks after close',r.session.listenerCount===1&&r.session.closedCallbacks===0&&r.session.listenerErrors===0);
  if(s.metrics.runtimeInstances!==undefined)check('one VM and one Tick per Update',s.metrics.runtimeInstances===1&&s.metrics.runtimeDisposals===0&&s.metrics.tickCalls===s.metrics.updateFrames);
  report.status='passed';report.finalView=normalizedView(r.view);report.finalMetrics=s.metrics;
 }catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};}
 report.completedAt=new Date().toISOString();return report;
}
