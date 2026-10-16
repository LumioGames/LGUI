import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { root, projectPath, ids } from './create-project.mjs';
const transport=new StdioClientTransport({command:process.execPath,args:['--input-type=module','--eval','const m=await import(process.argv[1]);await m.connectOpenFairyGuiMcpStdio();',import.meta.resolve('@openfairygui/mcp/stdio')],env:{OPENFAIRYGUI_ALLOWED_PROJECT_ROOTS:path.dirname(projectPath)},stderr:'inherit'});
const client=new Client({name:'verification',version:'1.0.0'});const records=[];let sessionId;
const call=async(method,input={})=>{const result=await client.callTool({name:`openfairygui_backend_${method}`,arguments:input});records.push({method,input,result});const r=result.structuredContent?.backendResult;assert(r?.ok&&!result.isError);return r.data;};
try{
 await client.connect(transport);const tools=await client.listTools();records.push({tools:tools.tools.map(t=>t.name)});
 const opened=await call('open_session',{projectPath});sessionId=opened.sessionId;
 const current=await call('query_entity',{sessionId,target:{kind:'displayNode',selector:{packageId:ids.package,componentResourceId:ids.Main,displayNodeId:'title'}}});
 await call('preflight_transaction',{sessionId,expectedRevision:current.revision,operations:[{kind:'setDisplayNodeProps',selector:{packageId:ids.package,componentResourceId:ids.Main,displayNodeId:'title'},props:{text:'MCP preview only'}}]});
 const session=await call('get_session',{sessionId});assert.equal(session.dirty,false);await call('close_session',{sessionId});sessionId=null;
}finally{if(sessionId)await call('close_session',{sessionId});await client.close();}
await writeFile(path.join(root,'../evidence/toolchain-mcp.json'),JSON.stringify({success:true,records},null,2));console.log('MCP stdio query/preflight/clean-close passed.');
