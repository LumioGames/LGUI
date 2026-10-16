import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {contained,resolved,within,sha256} from './paths.mjs';
const args=process.argv.slice(2);
const get=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
try {
  const workspace=get('--workspace'), input=get('--input'), output=get('--output'), target=get('--target')||'unity';
  if(!workspace||!input||!output||![workspace,input,output].every(path.isAbsolute)) throw Error('Use --workspace <absolute> --input <saved.fairy|export.zip> --output <new-absolute-directory> [--target unity|layabox]');
  if(!['unity','layabox'].includes(target)) throw Error('Supported targets: unity, layabox.');
  const root=resolved(workspace),out=resolved(output);
  if(!within(root,out)||out===root||fs.existsSync(out)) throw Error('Output must be a new directory inside the workspace.');
  if(!within(root,resolved(input))) throw Error('Input must be a saved snapshot inside the workspace.');
  const require=createRequire(path.join(root,'toolchain-test/package.json'));
  const {NodeIO}=require('@openfairygui/core/node');
  const {publishNode,validateProjectNode}=require('@openfairygui/functions/node');
  let project=input;
  if(path.extname(input).toLowerCase()==='.zip') {
    const {unzipSync}=createRequire(path.join(root,'repos/editor-online/package.json'))('fflate');
    const entries=Object.entries(unzipSync(fs.readFileSync(input))),seen=new Set();
    const projectRoot=path.join(out,'source');
    const files=entries.filter(([name])=>!name.endsWith('/'));
    for(const [name] of entries) {
      const safe=name.endsWith('/')?name.slice(0,-1):name;contained(projectRoot,safe);
      if(seen.has(safe.toLowerCase())) throw Error(`Case-colliding archive path: ${name}`);seen.add(safe.toLowerCase());
    }
    const fairy=files.filter(([name])=>name.endsWith('.fairy'));
    if(fairy.length!==1) throw Error('ZIP must contain exactly one .fairy project.');
    for(const [name,bytes] of files) {const dest=contained(projectRoot,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes,{flag:'wx'});}
    project=contained(projectRoot,fairy[0][0]);
  }
  const validation=await validateProjectNode(project);
  if(validation.status!=='valid'||!validation.complete) throw Error(`Project invalid: ${JSON.stringify(validation)}`);
  const document=await new NodeIO().readProject(project);document.getRoot().setProjectType(target==='unity'?0:4);
  const result=await publishNode({document,output:path.join(out,'published'),assetsPath:path.join(path.dirname(project),'assets'),compressed:false,fileExtension:target==='unity'?'bytes':'fui',plugins:[],codeGeneration:false});
  if(!result.files?.length||result.files.some(file=>!fs.existsSync(file.path))) throw Error('Publisher returned missing files.');
  const report={status:'passed',target,input:path.relative(root,input),inputSha256:sha256(fs.readFileSync(input)),validation,files:result.files.map(file=>({path:path.relative(out,file.path),sha256:sha256(fs.readFileSync(file.path))}))};
  fs.writeFileSync(path.join(out,'publish-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
