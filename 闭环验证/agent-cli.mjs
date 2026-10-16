import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
const root = path.dirname(fileURLToPath(import.meta.url));
const connection = JSON.parse(fs.readFileSync(path.join(root, 'agent-connection.local.json'), 'utf8'));
const headers = { Authorization: `Bearer ${connection.token}`, 'Content-Type': 'application/json' };
const [command = 'clients', clientId, requestPath, outputPath] = process.argv.slice(2);
const response = command === 'clients'
  ? await fetch(connection.baseUrl + '/__fairy_agent/clients', { headers })
  : await fetch(connection.baseUrl + '/__fairy_agent/rpc', { method: 'POST', headers, body: JSON.stringify({ clientId, request: JSON.parse(fs.readFileSync(requestPath, 'utf8')) }) });
const result = await response.json();
if (result.data?.base64) {
  if (!outputPath) throw new Error('ZIP export requires an explicit output path as the fourth argument.');
  const bytes = Buffer.from(result.data.base64, 'base64');
  fs.writeFileSync(path.resolve(outputPath), bytes);
  delete result.data.base64;
  result.data.output = path.resolve(outputPath);
  result.data.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
}
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
