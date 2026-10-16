// Compatibility entry for existing scripts; the reusable client has one implementation.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
if(!process.argv.includes('--connection')) process.argv.splice(2,0,'--connection',path.join(here,'agent-connection.local.json'));
await import('../tools/agent.mjs');
