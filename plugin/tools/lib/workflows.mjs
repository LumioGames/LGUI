import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {contained,readJson} from './paths.mjs';

export function run(executable,args,cwd,env=process.env){
 return new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{cwd,env,stdio:'inherit',windowsHide:true});
  child.on('error',reject);
  child.on('exit',code=>code===0?resolve():reject(Error(`Command failed (${code}): ${path.basename(executable)} ${args[0]||''}`)));
 });
}
export function loadProject(workspace){
 const file=contained(workspace,'.lgui/project.json');
 if(!fs.existsSync(file))throw Error('Missing .lgui/project.json. Migrate explicitly: declare this project\'s commands; no example fallback is selected. See docs/projects.md.');
 const config=readJson(file);
 if(config.schemaVersion!==1||!config.commands||typeof config.commands!=='object'||Array.isArray(config.commands))throw Error('Invalid .lgui/project.json: schemaVersion=1 and commands object required.');
 return config;
}
export function workflowPlan(workspace,config,command,extra=[]){
 const configured=config.commands[command];
 if(!configured)throw Error(`Workflow "${command}" is not configured in .lgui/project.json. Declare a project-owned script; no example fallback is selected.`);
 const steps=Array.isArray(configured)?configured:[configured];
 if(!steps.length)throw Error(`Workflow "${command}" must contain at least one step.`);
 return steps.map(step=>{
  if(!step||typeof step!=='object'||!['node','powershell'].includes(step.runner||'node'))throw Error('Workflow runner must be node or powershell.');
  const script=contained(workspace,step.script);
  if(!fs.statSync(script).isFile())throw Error('Workflow script is not a file: '+step.script);
  const cwd=!step.cwd||step.cwd==='.'?workspace:contained(workspace,step.cwd);
  if(!fs.statSync(cwd).isDirectory())throw Error('Workflow cwd is not a directory.');
  const args=step.args||[];
  if(!Array.isArray(args)||!args.every(value=>typeof value==='string'))throw Error('Workflow args must be a string array.');
  return {executable:step.runner==='powershell'?(process.platform==='win32'?'powershell.exe':'pwsh'):process.execPath,
   args:[...(step.runner==='powershell'?['-NoProfile','-File']:[]),script,...args,...extra],cwd};
 });
}
export async function executeWorkflow(workspace,config,command,extra=[]){
 // Validate every step before any script runs, including later steps and links.
 const plan=workflowPlan(workspace,config,command,extra);
 for(const step of plan)await run(step.executable,step.args,step.cwd);
}
export async function runUnity(workspace,config,args){
 const unity=config.unity;
 if(!unity)throw Error('Unity is not configured in .lgui/project.json. Set unity.project and unity.methods; no example fallback is selected.');
 const project=contained(workspace,unity.project);
 if(!fs.statSync(project).isDirectory())throw Error('Unity project directory missing.');
 const take=name=>{const index=args.indexOf(name);if(index<0)return undefined;const value=args[index+1];if(!value||value.startsWith('--'))throw Error('Missing '+name);args.splice(index,2);return value;};
 const action=take('--action');
 if(!['prepare','generate','build'].includes(action))throw Error('Use unity -- --action prepare|generate|build [--editor <absolute-executable>] [--cli <absolute-Unity-CLI>]. Runtime verification belongs to verify-unity.');
 const method=unity.methods?.[action];
 if(typeof method!=='string'||!/^[A-Za-z_][\w.]*$/.test(method))throw Error(`Unity method for ${action} is not configured or invalid.`);
 const editor=take('--editor')||process.env.UNITY_EDITOR,cli=take('--cli')||process.env.UNITY_CLI;
 if(args.length)throw Error('Unexpected Unity arguments: '+args.join(' '));
 if(!editor||!path.isAbsolute(editor)||!fs.statSync(editor).isFile())throw Error('Supply UNITY_EDITOR or --editor with the absolute installed Unity Editor executable.');
 const logRoot=contained(workspace,unity.logs||'evidence/unity');fs.mkdirSync(logRoot,{recursive:true});
 const log=path.join(logRoot,action+'-'+new Date().toISOString().replaceAll(/[:.]/g,'-')+'.log');
 const env={...process.env,UNITY_NO_UPDATE_CHECK:'1',UNITY_NO_CONSENT_PROMPT:'1',UNITY_NO_CRASH_REPORT:'1'};
 if(cli&&action==='build'){
  if(!path.isAbsolute(cli)||!fs.statSync(cli).isFile())throw Error('Unity CLI must be an absolute executable path.');
  await run(cli,['build',project,'--target',unity.target||'StandaloneWindows64','--execute-method',method,'--editor-path',editor,'--log-file',log,'--no-tail','--non-interactive','--format','json'],workspace,env);
 }else await run(editor,['-projectPath',project,'-batchmode','-quit','-executeMethod',method,'-logFile',log],workspace,env);
 console.log(JSON.stringify({status:'passed',action,project:unity.project,method,log:path.relative(workspace,log)}));
}
