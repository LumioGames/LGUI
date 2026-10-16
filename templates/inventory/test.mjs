import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=process.env.LGUI_WORKSPACE,fidelity='unity-migration/complex-inventory/fidelity';
const tests=['scripts/bootstrap.test.mjs','prototype/model.test.ts','unity-migration/complex-inventory/shared/complex-inventory.test.mjs',...fs.readdirSync(path.join(root,fidelity)).filter(f=>f.endsWith('.test.mjs')).map(f=>fidelity+'/'+f),'unity-migration/complex-inventory/scripts/layout.test.mjs'];
const result=spawnSync(process.execPath,['--test',...tests,...process.argv.slice(2)],{cwd:root,stdio:'inherit',windowsHide:true});process.exitCode=result.status??1;
