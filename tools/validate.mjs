import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import {parse} from 'yaml';
import {contained,readJson,sha256,filesUnder} from './paths.mjs';
const root=path.resolve(process.argv[2]||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const plugin=readJson(path.join(root,'plugin.json'));
const schema=readJson(new URL('./schemas/agent-plugin-1.0.0.schema.json',import.meta.url));
const validate=new Ajv2020({allErrors:true}).compile(schema);
assert(validate(plugin),JSON.stringify(validate.errors));
assert.match(plugin.version,/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/);
const {$schema,extensions,...portable}=plugin;
assert.deepEqual(readJson(path.join(root,'.claude-plugin/plugin.json')),portable,'Claude overlay drift');
assert.deepEqual(readJson(path.join(root,'.codex-plugin/plugin.json')),{...portable,skills:'./skills/',...extensions['com.openai']},'Codex fallback drift');
assert.equal(readJson(path.join(root,'package.json')).version,plugin.version);
assert.equal(readJson(path.join(root,'.claude-plugin/marketplace.json')).plugins[0].version,plugin.version);
assert.equal(readJson(path.join(root,'.agents/plugins/marketplace.json')).plugins[0].source.path,'./');
assert.equal(readJson(path.join(root,'.claude-plugin/marketplace.json')).plugins[0].source,'./');
assert(!fs.existsSync(path.join(root,'mcp.json'))&&!fs.existsSync(path.join(root,'hooks')),'No unused MCP/hooks');
for(const value of Object.values(extensions['com.openai'])) if(typeof value==='string'&&value.startsWith('./')) assert(fs.existsSync(contained(root,value.slice(2))));
const skills=fs.readdirSync(path.join(root,'skills'));
for(const name of skills){
  const file=contained(root,`skills/${name}/SKILL.md`),text=fs.readFileSync(file,'utf8');
  const match=text.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/);assert(match,`${name}: frontmatter`);
  const data=parse(match[1],{uniqueKeys:true});
  assert.equal(data.name,name);assert.match(name,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert(name.length<=64);
  assert(typeof data.description==='string'&&data.description.length>0&&data.description.length<=1024);
  for(const key of Object.keys(data))assert(['name','description','license','compatibility','metadata','allowed-tools'].includes(key),`${name}: unsupported ${key}`);
  if(data.compatibility)assert(typeof data.compatibility==='string'&&data.compatibility.length<=500);
  if(data.metadata)assert(Object.values(data.metadata).every(value=>typeof value==='string'));
}
const inventory=readJson(path.join(root,'template-files.json'));assert.equal(inventory.version,plugin.version);
for(const file of inventory.files)assert.equal(sha256(fs.readFileSync(contained(root,file.path))),file.sha256,`Template digest: ${file.path}`);
assert.equal(inventory.schemaVersion,2);
for(const name of ['blank','inventory']){
  assert(inventory.templates?.[name]?.length,`Missing ${name} template`);
  const destinations=new Set();
  for(const entry of inventory.templates[name]){
    contained(root,entry.path);assert(!destinations.has(entry.path),`Duplicate template destination ${entry.path}`);destinations.add(entry.path);
    assert.equal(sha256(fs.readFileSync(contained(root,entry.source))),entry.sha256,`Template source digest: ${entry.source}`);
  }
}
if(fs.existsSync(path.join(root,'package-integrity.json'))){
  const integrity=readJson(path.join(root,'package-integrity.json'));assert.equal(integrity.version,plugin.version);
  const names=new Set(integrity.files.map(file=>file.path));
  const actual=fs.readdirSync(root).flatMap(name=>filesUnder(root,name));
  assert.deepEqual(actual.filter(file=>file!=='package-integrity.json').sort(),[...names].sort(),'Unexpected package file');
  for(const file of integrity.files){
    assert(!/(^|\/)(node_modules|\.git|repos|browser-profile[^/]*|Library|Temp)(\/|$)|connection.*\.json$|\.token$|\.env(?:\.|$)/i.test(file.path),`Forbidden package file: ${file.path}`);
    assert.equal(sha256(fs.readFileSync(contained(root,file.path))),file.sha256,`Package digest: ${file.path}`);
  }
}
const docs=['README.md','README.en.md','CONTRIBUTING.md','PUBLICATION.md','AGENTS.md','CLAUDE.md',...filesUnder(root,'docs'),...filesUnder(root,'skills')].filter(file=>file.endsWith('.md'));
let links=0;
for(const relative of docs){
  const file=contained(root,relative),text=fs.readFileSync(file,'utf8');
  assert(!/[A-Z]:[\\/]Users[\\/]|\/Users\//.test(text),`Personal path: ${relative}`);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const href=match[1].split('#')[0];if(!href||/^(https?:|mailto:)/.test(href))continue;
    const target=path.resolve(path.dirname(file),decodeURIComponent(href));
    const rel=path.relative(root,target).split(path.sep).join('/');
    assert(fs.existsSync(contained(root,rel)),`Broken link ${relative}: ${href}`);links++;
  }
}
console.log(JSON.stringify({status:'passed',schema:plugin.$schema,version:plugin.version,skills:skills.length,templateFiles:inventory.files.length,links,packageIntegrity:fs.existsSync(path.join(root,'package-integrity.json'))}));
