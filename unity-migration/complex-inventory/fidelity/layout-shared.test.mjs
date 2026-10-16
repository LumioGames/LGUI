import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile(new URL('./layout-shared.js',import.meta.url),'utf8');
const reference=JSON.parse(await fs.readFile(new URL('./layout-reference.json',import.meta.url),'utf8'));
const skins=JSON.parse(await fs.readFile(new URL('./skin-manifest.json',import.meta.url),'utf8'));
const context=vm.createContext({});vm.runInContext(source,context);
for(const [width,height,mode,columns] of [[1586,992,'canonical',6],[1280,800,'canonical',6],[754,743,'adaptive',4],[794,727,'adaptive',4],[486,727,'adaptive',3],[390,844,'adaptive',2],[1100,1100,'adaptive',4]]){
 const layout=context.fidelityLayout(width,height,reference,skins),serialized=JSON.stringify(layout);
 assert.equal(layout.mode,mode);assert.equal(layout.columns,columns);assert.ok(serialized.length>100);
 assert.ok(layout.controls.length>15);assert.equal(layout.slots.length,24);
 if(mode==='adaptive'){assert.equal(layout.scale,1);const a=layout.controls.find(c=>c.name==='primary'),d=layout.controls.find(c=>c.name==='description');assert.ok(d.y+d.height<=a.y+.01);assert.ok(Math.abs(a.width/a.height-370/65)<.02);}
}
console.log('7 shared layouts passed in VM without DOM, C#, URL, or framework globals');
