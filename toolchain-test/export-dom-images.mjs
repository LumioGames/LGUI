import path from 'node:path';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createNodeBackendRuntime } from '@openfairygui/backend/node';
import { root, projectPath } from './create-project.mjs';

// Adapter for the tested legacy FairyGUI-dom version. No claim of a general DOM exporter.
// Binary is a genuine uncompressed Laya profile output; images are detached through formal session APIs.
const out=path.join(root,'published/dom');await mkdir(out,{recursive:true});
const runtime=createNodeBackendRuntime({allowedProjectRoots:[path.dirname(projectPath)]});
const opened=await runtime.openSession({projectPath});if(!opened.ok)throw new Error(JSON.stringify(opened));
const {sessionId}=opened.data;
try{
 const state=runtime.readSessionState({sessionId});if(!state.ok)throw new Error(JSON.stringify(state));
 const manifest={schemaVersion:1,adapter:'legacy-fairygui-dom-loose-images',source:'OpenFairyGUI 0.7.0 uncompressed Laya package',revision:state.data.revision,packages:{}};
 for(const pkg of state.data.project.packages){
  const images={};
  for(const resource of pkg.resources.filter(r=>r.kind==='image')){
   const bytes=runtime.readResourceBytes({sessionId,expectedRevision:state.data.revision,selector:{packageId:pkg.id,resourceId:resource.id}});if(!bytes.ok)throw new Error(JSON.stringify(bytes));
   const fileName=`${resource.id}.png`;await writeFile(path.join(out,fileName),bytes.data.sourceBytes);images[resource.id]=fileName;
  }
  manifest.packages[pkg.id]={name:pkg.name,images};
  await copyFile(path.join(root,'published/layabox',`${pkg.name}.fui`),path.join(out,'package.xml'));
 }
 await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({output:out,manifest},null,2));
}finally{await runtime.closeSession({sessionId});}
