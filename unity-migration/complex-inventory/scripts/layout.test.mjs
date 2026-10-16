import assert from 'node:assert/strict';
import {test} from 'node:test';
import './layout.js';
for(const [w,h,columns] of [[1280,800,6],[1920,1080,6],[390,844,4],[320,740,4]])test(`controls reachable at ${w}x${h}`,()=>{
 const x=globalThis.complexLayout(w,h);assert.equal(x.columns,columns);
 const by=Object.fromEntries(x.controls.map(c=>[c.name,c]));
 for(const name of ['search','tab_all','list','primary','sell','sort','save','load','reward','notice']){
  const c=by[name];assert.ok(c,`${name} missing`);assert.ok(c.x>=0&&c.y>=0,`${name} origin`);assert.ok(c.x+c.width<=w+1&&c.y+c.height<=h+1,`${name} clipped`);
 }
 assert.ok(x.cellSize>=60);assert.ok(by.list.width>=x.columns*x.cellSize+(x.columns-1)*8-1);
 assert.ok(by.primary.y>=by.list.y+by.list.height||by.primary.x>=by.list.x+by.list.width,'primary overlaps grid');
});
