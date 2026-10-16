import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['--test','tests/app.test.mjs',...process.argv.slice(2)],{cwd:process.env.LGUI_WORKSPACE,stdio:'inherit',windowsHide:true});process.exitCode=result.status??1;
