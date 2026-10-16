import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { root, projectPath, ids } from './create-project.mjs';
const oldPath=path.join(root,'../repos/editor-online/node_modules/@openfairygui');
const core=await import(pathToFileURL(path.join(oldPath,'core/dist/index.js')).href);
const {NodeIO}=await import(pathToFileURL(path.join(oldPath,'core/dist/node.js')).href);
const document=await new NodeIO().readProject(projectPath,{includeBinaryData:true,hydrateResourceBytes:true});
const project=core.liftDocumentToUamProject(document);
const selector={packageId:ids.package,componentResourceId:ids.Main,displayNodeId:'title'};
const ts=await import(pathToFileURL(path.join(root,'../repos/editor-online/node_modules/typescript/lib/typescript.js')).href);
const readerSource=await readFile(path.join(root,'../repos/editor-online/src/editor/commands/DisplayListReaders.ts'),'utf8');
const textFn=readerSource.slice(readerSource.indexOf('export function readTextProperties('),readerSource.indexOf('export function readImageProperties('));
const readerModule=ts.default.transpileModule(textFn,{compilerOptions:{module:ts.default.ModuleKind.ESNext,target:ts.default.ScriptTarget.ES2022}}).outputText;
const {readTextProperties}=await import(`data:text/javascript;base64,${Buffer.from(readerModule).toString('base64')}`);
const current=project.packages[0].resources.find(r=>r.id===ids.Main).component.displayList.find(n=>n.id==='title');
const fullText={...readTextProperties(current),text:'网页未保存标题'};
const tests=[];
const browserBundle=await import(pathToFileURL(path.join(root,'../repos/editor-online/assets/resources/editor/runtime/openfairygui-backend-browser.js')).href);
for(const [name,operations] of [['text-only',[{opId:'probe',kind:'setDisplayNodeProps',selector,props:{text:'网页未保存标题'}}]],['editor-full-text-properties',[{opId:'probe',kind:'setDisplayNodeProps',selector,props:{textProperties:fullText}}]],['editor-generated-mixed',[{opId:'probe',kind:'setDisplayNodeProps',selector,props:{text:'网页未保存标题',textProperties:fullText}}]],['position-only',[{opId:'probe',kind:'setDisplayNodeProps',selector,props:{position:{x:40,y:24}}}]]]){
for(const [host,sdk] of [['node-npm',core],['checked-in-browser-bundle-in-node',browserBundle]]){
try{const result=sdk.applyUamTransaction(structuredClone(project),operations);tests.push({host,name,passed:true,title:result.packages[0].resources.find(r=>r.id===ids.Main).component.displayList.find(n=>n.id==='title')});}
catch(error){tests.push({host,name,passed:false,error:{name:error.name,message:error.message,code:error.code,issues:error.issues,opKind:error.opKind}});}
}
}
await writeFile(path.join(root,'../evidence/toolchain-old-editor-sdk.json'),JSON.stringify({packageVersion:'0.2.4',tests},null,2));console.log(JSON.stringify(tests,null,2));
