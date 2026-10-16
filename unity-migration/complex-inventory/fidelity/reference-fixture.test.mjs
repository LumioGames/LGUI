import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createComplexInventoryApp} from '../shared/index.ts';

const kinds=['sword','axe','bow','staff','shield','helmet','armor','boots','ring','amulet','redPotion','bluePotion','staminaPotion','antidote','elixir','herb','mushroom','ore','crystal','leather','key','scroll','coinPouch','gem'];
const quantities=[1,1,1,1,1,1,1,1,1,1,8,5,3,2,1,12,7,9,4,6,1,3,18,2];
const call=(app,op,args={})=>JSON.parse(app.dispatch(op,JSON.stringify(args)));
const read=app=>JSON.parse(app.snapshot());
const fixture=()=>{
  const url=new URL('./reference-fixture.json',import.meta.url);
  assert.ok(fs.existsSync(url),'The reference schema-1 save fixture must exist');
  return JSON.parse(fs.readFileSync(url,'utf8'));
};
const loadFixture=app=>{
  const result=call(app,'load',{json:JSON.stringify(fixture())});
  assert.equal(result.ok,true,result.error);
  return result;
};
const normalized=view=>({...view,revision:0});

test('reference fixture loads through the real shared schema with 24 ordered stacks and exact quantities',()=>{
  const app=createComplexInventoryApp();
  assert.equal(read(app).view.usedSlots,26,'Original constructor default stays at 26');
  const r=loadFixture(app),v=r.view;
  assert.equal(v.schemaVersion,1);assert.equal(v.capacity,30);assert.equal(v.usedSlots,24);assert.equal(v.coins,12480);
  assert.equal(v.selectedId,'sword-1');assert.equal(v.category,'all');assert.equal(v.query,'');assert.equal(v.sort,'default');
  assert.deepEqual(v.items.map(x=>x.kind),kinds);
  assert.deepEqual(v.items.map(x=>x.id),kinds.map(x=>x+'-1'));
  assert.deepEqual(v.visible.map(x=>x.iconIndex),Array.from({length:24},(_,i)=>i));
  assert.deepEqual(v.items.map(x=>x.quantity),quantities);
  assert(Object.values(v.equipment).every(x=>x===null));
  assert.equal(v.rewards.coins,0);assert.equal(v.rewards.items.length,30);
  assert.deepEqual(v.rewards.items.slice(0,3).map(x=>x.state),['locked','ready','claimed']);
  assert.deepEqual(JSON.parse(call(app,'save').result.json),fixture(),'Fixture is a genuine schema-1 save, not a presentation-only shape');
});

test('reference sword stats and Chinese display derive from the same shared catalog values',()=>{
  const sword=read(createComplexInventoryApp()).view.selected;
  assert.deepEqual(sword.stats,{attack:48,crit:6,durability:100});
  assert.equal(sword.displayStats,'攻击 +48 · 暴击 +6% · 耐久 100');
  assert.equal(sword.price,80,'Reference styling does not change sale rules or price');
});

test('reference equip/use/save/load preserve real quantities, equipment stats and the original reward state',()=>{
  const app=createComplexInventoryApp();loadFixture(app);
  const equipped=call(app,'equip',{id:'sword-1'});
  assert(equipped.ok);assert.equal(equipped.view.usedSlots,23);
  assert.deepEqual(equipped.view.equipmentStats,{attack:48,crit:6,durability:100});
  assert.equal(equipped.view.selected.equipped,true);
  const used=call(app,'use',{id:'redPotion-1'});
  assert(used.ok);assert.equal(used.view.items.find(x=>x.id==='redPotion-1').quantity,7);
  assert.equal(used.view.coins,12480);
  const saved=call(app,'save').result.json;
  const restored=createComplexInventoryApp();
  assert(call(restored,'load',{json:saved}).ok);
  assert.deepEqual(normalized(read(restored).view),normalized(read(app).view));
  assert.equal(call(restored,'save').result.json,saved);
  assert.equal(call(restored,'claim',{id:'item-0'}).ok,false,'Initial reward eligibility remains unchanged');
  assert.equal(call(restored,'unequip',{slot:'weapon'}).view.usedSlots,24);
});

test('visual startup load precedes open and retains one shared subscription across reopen',()=>{
  const app=createComplexInventoryApp();const loaded=loadFixture(app);
  assert.equal(loaded.session.open,false);assert.equal(loaded.session.listenerCount,0);
  assert.equal(call(app,'open').session.listenerCount,1);
  call(app,'close');assert.equal(read(app).session.listenerCount,0);
  const opened=call(app,'open');assert.equal(opened.session.listenerCount,1);
  assert.equal(opened.session.closedCallbacks,0);assert.equal(opened.view.usedSlots,24);
});
