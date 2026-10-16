import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const migration=path.dirname(root),project=path.join(migration,'InventoryUnity');
const resources=path.join(project,'Assets/Resources');
const output=path.join(resources,'FidelityInventoryUI');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const reportPath=path.join(root,'published/fidelity/publish-report.json');
const publish=JSON.parse(await fs.readFile(reportPath,'utf8'));
assert.equal(publish.status,'passed','Formal fidelity publish must pass before copying resources');
const map=JSON.parse(await fs.readFile(path.join(root,'published/fidelity-resource-map.json'),'utf8'));
assert.equal(map.package.id,'invtest1');
assert.equal(map.components.ComplexMain.id,'cxmain01');
assert.equal(map.components.ItemSlot.id,'cxslot01');
assert.equal(map.skinEntries.length,69);
assert.equal(map.details.length,24);
const bundle=await fs.readFile(path.join(root,'dist/ComplexInventoryApp.txt'));
const built=JSON.parse(await fs.readFile(path.join(root,'dist/build.json'),'utf8'));
assert.equal(hash(bundle),built.bundleSha256);
assert.equal(hash(bundle),publish.sharedBundleSha256);
assert.equal(hash(bundle),'eb28802c0f99b659c5f53988667c8a43a2a809178e9b1b485bc846fdd672081e');
assert.equal(built.modelUnchanged,true);
const layout=await fs.readFile(path.join(root,'fidelity/layout-shared.js'));
assert(layout.includes(Buffer.from('fidelityLayout')),'Shared layout entry missing');
const isolated={};vm.runInNewContext(layout.toString('utf8'),isolated,{timeout:3000});
assert.equal(typeof isolated.fidelityLayout,'function');
const reference=JSON.parse(await fs.readFile(path.join(root,'fidelity/layout-reference.json'),'utf8'));
const skinManifest=JSON.parse(await fs.readFile(path.join(root,'fidelity/skin-manifest.json'),'utf8'));
for(const [width,height] of [[1586,992],[794,727],[486,727],[390,844]])assert(isolated.fidelityLayout(width,height,reference,skinManifest),'Shared geometry must execute without platform globals');
const copies=[];
await fs.mkdir(output,{recursive:true});
async function copy(source,destination){
 assert(destination.startsWith(resources+path.sep),'Only isolated Resources outputs may be written');
 const bytes=await fs.readFile(source);await fs.writeFile(destination,bytes);
 assert.equal(hash(await fs.readFile(destination)),hash(bytes),'Copied bytes changed');
 copies.push({source:path.relative(root,source).replaceAll('\\','/'),destination:path.relative(migration,destination).replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes)});
}
const published=path.join(root,'published/fidelity/unity');
const files=(await fs.readdir(published)).filter(name=>name==='Inventory_fui.bytes'||/^Inventory_atlas\d+\.png$/.test(name)).sort();
assert(files.includes('Inventory_fui.bytes'));
assert(files.filter(name=>name.endsWith('.png')).length>0,'No Unity atlas pages');
for(const name of files)await copy(path.join(published,name),path.join(output,name));
for(const [from,to] of [
 ['dist/ComplexInventoryApp.txt','FidelityInventoryApp.txt'],
 ['fidelity/layout-shared.js','FidelityInventoryLayout.txt'],
 ['fidelity/reference-fixture.json','FidelityReferenceFixture.json'],
 ['published/fidelity-resource-map.json','FidelityResourceMap.json'],
 ['published/fidelity-structure.json','FidelityStructure.json'],
 ['fidelity/skin-manifest.json','FidelitySkinManifest.json'],
 ['fidelity/layout-reference.json','FidelityLayoutReference.json'],
])await copy(path.join(root,from),path.join(resources,to));
const result={schemaVersion:1,status:'passed',completedAt:new Date().toISOString(),sourceReport:'published/fidelity/publish-report.json',sourceReportSha256:hash(await fs.readFile(reportPath)),packageId:map.package.id,sharedBundleSha256:hash(bundle),sharedLayoutSha256:hash(layout),atlasPages:files.filter(name=>name.endsWith('.png')).length,copies,scope:'Current formal Inventory fidelity publish copied byte-for-byte into isolated Fidelity Resources. Older Complex/Baseline resources and sources retained.'};
const evidence=path.join(root,'fidelity/evidence');await fs.mkdir(evidence,{recursive:true});
await fs.writeFile(path.join(evidence,'setup-unity.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({status:result.status,atlasPages:result.atlasPages,copies:copies.length,sharedBundleSha256:result.sharedBundleSha256,sharedLayoutSha256:result.sharedLayoutSha256}));
