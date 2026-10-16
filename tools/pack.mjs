import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {create} from 'tar';
import {readJson,contained,sha256} from './paths.mjs';
import {pluginFiles} from './package-content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=readJson(path.join(root,'plugin.json'));
const output=path.resolve(process.argv[2]||path.join(root,'artifacts',`lgui-${manifest.version}`));
if(fs.existsSync(output)) throw Error('Choose a new package output directory; existing output is never overwritten.');
const check=spawnSync(process.execPath,[path.join(root,'tools/generate.mjs'),'--check'],{stdio:'inherit',windowsHide:true});
if(check.status!==0)process.exit(check.status||1);
const files=[...new Set([...pluginFiles(root),...readJson(path.join(root,'template-files.json')).files.map(f=>f.path)])].sort();
const inventory=[];
for(const file of files){
  const source=contained(root,file),destination=contained(output,file),bytes=fs.readFileSync(source);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes,{flag:'wx'});
  inventory.push({path:file,bytes:bytes.length,sha256:sha256(bytes)});
}
fs.writeFileSync(path.join(output,'package-integrity.json'),JSON.stringify({version:manifest.version,files:inventory},null,2)+'\n');
const archive=output+'.tar.gz';
if(fs.existsSync(archive))throw Error('Archive already exists.');
await create({gzip:true,file:archive,cwd:output,portable:true,noMtime:true},[...files,'package-integrity.json']);
fs.writeFileSync(archive+'.sha256',sha256(fs.readFileSync(archive))+'  '+path.basename(archive)+'\n');
console.log(JSON.stringify({directory:output,archive,files:files.length,bytes:fs.statSync(archive).size}));
