import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJson,sha256} from './paths.mjs';
import {templateFiles,projectTemplates} from './package-content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=readJson(path.join(root,'plugin.json'));
const { $schema,extensions,...portable}=manifest;
export function generatedFiles() {
  const npm=readJson(path.join(root,'package.json')),npmLock=readJson(path.join(root,'package-lock.json'));
  npm.version=manifest.version;npmLock.version=manifest.version;npmLock.packages[''].version=manifest.version;
  const deps=readJson(path.join(root,'dependencies.lock.json')),spec=deps.npm.find(item=>item.directory==='.');
  spec.packageJsonSha256=sha256(JSON.stringify(npm,null,2)+'\n');
  spec.packageLockSha256=sha256(JSON.stringify(npmLock,null,2)+'\n');
  spec.required.ajv=npm.devDependencies.ajv;spec.required.yaml=npm.devDependencies.yaml;
  spec.required.tar=npm.devDependencies.tar;
  const derived={'package.json':npm,'package-lock.json':npmLock,'dependencies.lock.json':deps};
  return {
    ...derived,
    '.claude-plugin/plugin.json':portable,
    '.codex-plugin/plugin.json':{...portable,skills:'./skills/',...extensions['com.openai']},
    '.agents/plugins/marketplace.json':{name:'lumio-lgui',interface:{displayName:'LumioGames LGUI'},plugins:[{name:manifest.name,source:{source:'local',path:'./'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Developer Tools'}]},
    '.claude-plugin/marketplace.json':{name:'lumio-lgui',owner:manifest.author,plugins:[{name:manifest.name,source:'./',version:manifest.version,description:manifest.description}]},
    'template-files.json':{schemaVersion:2,version:manifest.version,files:templateFiles(root).map(file=>({path:file,sha256:sha256(derived[file]?JSON.stringify(derived[file],null,2)+'\n':fs.readFileSync(path.join(root,file)))})),
      templates:Object.fromEntries(Object.entries(projectTemplates(root)).map(([name,entries])=>[name,entries.map(entry=>({...entry,sha256:sha256(derived[entry.source]?JSON.stringify(derived[entry.source],null,2)+'\n':fs.readFileSync(path.join(root,entry.source)))}))]))}
  };
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  for(const [file,data] of Object.entries(generatedFiles())) {
    const destination=path.join(root,file),text=JSON.stringify(data,null,2)+'\n';
    if(process.argv.includes('--check')) {
      if(!fs.existsSync(destination)||fs.readFileSync(destination,'utf8')!==text) throw Error(`Generated file stale: ${file}. Run node tools/generate.mjs.`);
    } else {fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,text);}
  }
  console.log(process.argv.includes('--check')?'Generated metadata consistent.':'Generated host overlays, marketplaces and template digests.');
}
