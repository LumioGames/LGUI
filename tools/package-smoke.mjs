import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {extract} from 'tar';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const archive=process.argv[2];if(!archive)throw Error('Supply the built .tar.gz archive.');
const parent=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-package-')),packageRoot=path.join(parent,'plugin'),workspace=path.join(parent,'workspace');
fs.mkdirSync(packageRoot);
await extract({file:path.resolve(archive),cwd:packageRoot,strict:true});
function run(file,args){const r=spawnSync(process.execPath,[file,...args],{cwd:os.tmpdir(),encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.stdout);console.log(r.stdout.trim());}
run(path.join(root,'tools/validate.mjs'),[packageRoot]);
run(path.join(packageRoot,'tools/lgui.mjs'),['init','--workspace',workspace]);
run(path.join(packageRoot,'tools/lgui.mjs'),['init','--workspace',workspace]);
run(path.join(packageRoot,'tools/lgui.mjs'),['doctor','--workspace',workspace]);
console.log(JSON.stringify({status:'passed',packageRoot,workspace,archive:path.basename(archive),scope:'Extracted archive, unrelated cwd, no dependencies in package or ancestor, no dependency restoration.'}));
