import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { NodeIO } from '@openfairygui/core/node';
import { publishNode } from '@openfairygui/functions/node';
import { root, projectPath } from './create-project.mjs';
const results=[];
for(const [name,projectType,codeType] of [['unity-csharp',0,''],['unity-typescript',0,'TypeScript'],['layabox-typescript',4,'TypeScript']]){
 const document=await new NodeIO().readProject(projectPath);
 const messages=[];document.setLogger({debug(){},info(m){messages.push(m);},warn(m){messages.push(m);},error(m){messages.push(m);}});
 document.getRoot().setProjectType(projectType).setSettings({publish:{binaryFormat:true,compressDesc:false,codeGeneration:{allowGenCode:true,codeType,codePath:path.join(root,'codegen-probe',name,'bindings')}},common:{},adaptation:{}});
 document.getRoot().listPackages()[0].setGenCode(true);
 const result=await publishNode({document,output:path.join(root,'codegen-probe',name,'runtime'),plugins:[],compressed:false,codeGeneration:true});
 results.push({name,projectType,codeType,result,messages});
}
await writeFile(path.join(root,'../evidence/toolchain-codegen.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
