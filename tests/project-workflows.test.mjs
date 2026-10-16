import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),cli=path.join(root,'tools/lgui.mjs');
const run=(...args)=>spawnSync(process.execPath,[cli,...args],{cwd:os.tmpdir(),encoding:'utf8',windowsHide:true});
const fresh=()=>path.join(fs.mkdtempSync(path.join(os.tmpdir(),'lgui-project-')),'workspace');
function project(workspace,config){fs.mkdirSync(path.join(workspace,'.lgui'),{recursive:true});fs.writeFileSync(path.join(workspace,'.lgui/workspace.json'),JSON.stringify({version:'0.1.0',webPort:4273,editorPort:5307}));fs.writeFileSync(path.join(workspace,'.lgui/project.json'),JSON.stringify(config));}
test('default empty initialization contains a working UI skeleton and no inventory source/art',()=>{
 const workspace=fresh();const result=run('init','--workspace',workspace);assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(fs.readFileSync(path.join(workspace,'.lgui/workspace.json'))).template,'blank');
 for(const file of ['shared/app.ts','web/index.html','project/UI.fairy','.lgui/project.json','scripts/bootstrap.mjs'])assert(fs.existsSync(path.join(workspace,file)),file);
 for(const file of ['prototype','unity-migration/InventoryUnity','unity-migration/complex-inventory','toolchain-test/Inventory.zip'])assert(!fs.existsSync(path.join(workspace,file)),file);
 assert.equal(run('init','--workspace',workspace).status,0);
 fs.appendFileSync(path.join(workspace,'shared/app.ts'),'\n// user change\n');
 assert.match(run('init','--workspace',workspace).stderr,/differing|modified/i);
 assert.match(run('init','--workspace',workspace,'--template','inventory').stderr,/template/i);
});
test('configured workflows run from workspace, retain argument boundaries, and never select inventory',()=>{
 const workspace=fresh();project(workspace,{schemaVersion:1,commands:{'build-web':[{script:'build.mjs',args:['fixed argument']}],'verify-browser':{script:'build.mjs'},'verify-unity':{script:'build.mjs'}},web:{root:'site',path:'/preview/'}});
 fs.writeFileSync(path.join(workspace,'build.mjs'),`import fs from 'node:fs';fs.writeFileSync('result.json',JSON.stringify({cwd:process.cwd(),args:process.argv.slice(2)}));`);
 const result=run('build-web','--workspace',workspace,'--','caller argument','$(not-a-shell)');assert.equal(result.status,0,result.stderr);
 const observed=JSON.parse(fs.readFileSync(path.join(workspace,'result.json')));assert.equal(observed.cwd,workspace);assert.deepEqual(observed.args,['fixed argument','caller argument','$(not-a-shell)']);
 assert.equal(run('verify-unity','--workspace',workspace).status,0);
 assert.match(run('unity-setup','--workspace',workspace).stderr,/not configured/i);
});
test('all pipeline steps are preflighted before the first script mutates files',()=>{
 const workspace=fresh();project(workspace,{schemaVersion:1,commands:{test:[{script:'first.mjs'},{script:'../escape.mjs'}]}});
 fs.writeFileSync(path.join(workspace,'first.mjs'),`import fs from 'node:fs';fs.writeFileSync('should-not-exist','bad');`);
 assert.match(run('test','--workspace',workspace).stderr,/Unsafe package path/);assert(!fs.existsSync(path.join(workspace,'should-not-exist')));
});
test('configured script and web root links cannot escape workspace',()=>{
 const workspace=fresh(),outside=fresh();fs.mkdirSync(outside,{recursive:true});project(workspace,{schemaVersion:1,commands:{test:{script:'alias/escape.mjs'}}});
 fs.writeFileSync(path.join(outside,'escape.mjs'),'throw Error("must not execute")');fs.symlinkSync(outside,path.join(workspace,'alias'),process.platform==='win32'?'junction':'dir');
 assert.match(run('test','--workspace',workspace).stderr,/link|escape/i);
});
test('legacy workspaces require explicit migration rather than an inventory fallback',()=>{
 const workspace=fresh();project(workspace,{schemaVersion:1,commands:{}});fs.unlinkSync(path.join(workspace,'.lgui/project.json'));
 assert.match(run('build-web','--workspace',workspace).stderr,/Missing \.lgui\/project.json/);
 assert.match(run('unity','--workspace',workspace,'--','--action','build').stderr,/Missing \.lgui\/project.json/);
});
test('a failed pipeline step stops subsequent scripts and returns failure',()=>{
 const workspace=fresh();project(workspace,{schemaVersion:1,commands:{'build-web':[{script:'fail.mjs'},{script:'later.mjs'}]}});
 fs.writeFileSync(path.join(workspace,'fail.mjs'),'process.exit(7);');fs.writeFileSync(path.join(workspace,'later.mjs'),`import fs from 'node:fs';fs.writeFileSync('must-not-run','bad');`);
 const result=run('build-web','--workspace',workspace);assert.notEqual(result.status,0);assert.match(result.stderr,/Command failed \(7\)/);assert(!fs.existsSync(path.join(workspace,'must-not-run')));
});
test('Unity entry validates the selected project before launching external tools',()=>{
 const workspace=fresh();project(workspace,{schemaVersion:1,commands:{},unity:{project:'../other',methods:{build:'MyBuild.Build'}}});
 assert.match(run('unity','--workspace',workspace,'--','--action','build').stderr,/Unsafe|escape/i);
});
