import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const args = process.argv.slice(2);
try {
  const index = args.indexOf('--connection');
  if (index < 0 || !args[index+1]) throw Error('Use --connection <absolute-local-connection.json> clients|call <clientId> <request.json> [new-export.zip]');
  const file = args[index+1]; args.splice(index,2);
  const [command='clients',clientId,requestFile,output] = args;
  if (!['clients','call'].includes(command)) throw Error('Expected clients or call.');
  const connection = JSON.parse(fs.readFileSync(file,'utf8'));
  const url = new URL(connection.baseUrl);
  if (url.protocol !== 'http:' || !['127.0.0.1','localhost','[::1]'].includes(url.hostname) || url.username || url.password) throw Error('Connection must be a localhost HTTP relay.');
  if (command === 'call' && (!clientId || !requestFile)) throw Error('call requires an explicitly selected clientId and request file.');
  const request = command === 'call' ? JSON.parse(fs.readFileSync(requestFile,'utf8')) : null;
  if (request?.method === 'export' && (!output || fs.existsSync(output))) throw Error('Export requires a new explicit output path.');
  const response = await fetch(new URL(command === 'clients' ? '/__fairy_agent/clients' : '/__fairy_agent/rpc',url),{
    method:command === 'clients' ? 'GET' : 'POST',headers:{Authorization:`Bearer ${connection.token}`,'Content-Type':'application/json'},
    ...(request ? {body:JSON.stringify({clientId,request})} : {}),redirect:'error',signal:AbortSignal.timeout(35000)});
  const result = await response.json();
  if (result.data?.base64) {
    if (!output) throw Error('Export requires an explicit output path.');
    const bytes = Buffer.from(result.data.base64,'base64');
    fs.writeFileSync(path.resolve(output),bytes,{flag:'wx'});
    delete result.data.base64; result.data.output=path.resolve(output);result.data.sha256=createHash('sha256').update(bytes).digest('hex');
  }
  console.log(JSON.stringify(result,null,2));
  if (!response.ok || !result.ok) process.exitCode=1;
} catch(error) {console.error(error.message);process.exitCode=1;}
