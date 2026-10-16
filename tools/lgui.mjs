import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {contained, resolved, within, readJson, sha256} from './paths.mjs';
const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = args.shift();
const commands = ['init','doctor','bootstrap','build-web','serve','editor','agent','publish','test','verify-browser','verify-editor','unity-setup','unity'];
const usage = 'node <installed-plugin>/tools/lgui.mjs <' + commands.join('|') + '> --workspace <absolute-directory> [-- extra arguments]';
function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index+1];
  if (!value || value.startsWith('--')) throw Error(`Missing value for ${name}`);
  args.splice(index,2); return value;
}
function run(executable, argv, cwd, env = process.env) {
  return new Promise((resolve,reject) => {
    const child = spawn(executable, argv, {cwd,env,stdio:'inherit',windowsHide:true});
    child.on('error',reject);
    child.on('exit',code => code === 0 ? resolve() : reject(Error(`Command failed (${code}): ${path.basename(executable)} ${argv[0]}`)));
  });
}
async function main() {
  if (!command || command === '--help') { console.log(usage); return; }
  if (!commands.includes(command)) throw Error(`Unknown command: ${command}\n${usage}`);
  const input = option('--workspace');
  if (!input || !path.isAbsolute(input)) throw Error('Provide --workspace with an explicit absolute directory.');
  const workspace = resolved(input), plugin = resolved(pluginRoot);
  if (within(plugin,workspace) || within(workspace,plugin)) throw Error('Workspace and plugin/cache must not overlap. Choose a separate directory.');
  if (args[0] === '--') args.shift();
  const local = relative => contained(workspace,relative);
  const node = (file,argv=[]) => run(process.execPath,[local(file),...argv],workspace);
  const marker = local('.lgui/workspace.json');
  if (command === 'init') {
    if (args.length) throw Error(`Unexpected init arguments: ${args.join(' ')}`);
    const inventory = readJson(path.join(pluginRoot,'template-files.json'));
    if (fs.existsSync(marker) && readJson(marker).version !== inventory.version) throw Error('Workspace version differs; initialize a new directory and migrate explicitly.');
    const writes = [];
    for (const entry of inventory.files) {
      const source = contained(pluginRoot,entry.path), destination = local(entry.path);
      const bytes = fs.readFileSync(source);
      if (sha256(bytes) !== entry.sha256) throw Error(`Package digest mismatch: ${entry.path}`);
      if (fs.existsSync(destination)) {
        if (!fs.readFileSync(destination).equals(bytes)) throw Error(`Existing differing/modified file: ${entry.path}. No files overwritten.`);
      } else writes.push([destination,bytes]);
    }
    for (const [destination,bytes] of writes) {
      fs.mkdirSync(path.dirname(destination),{recursive:true}); fs.writeFileSync(destination,bytes,{flag:'wx'});
    }
    fs.mkdirSync(path.dirname(marker),{recursive:true});
    if (!fs.existsSync(marker)) fs.writeFileSync(marker,JSON.stringify({schemaVersion:1,template:'inventory',version:inventory.version,webPort:4182,editorPort:5199},null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({workspace,version:inventory.version,copied:writes.length,next:'doctor, bootstrap --dry-run, bootstrap --install, build-web, serve'})); return;
  }
  if (!fs.existsSync(marker)) throw Error('Not an initialized LGUI workspace. Run init first.');
  const settings=readJson(marker);
  const webPort=Number(process.env.LGUI_WEB_PORT||settings.webPort||4182),editorPort=Number(process.env.LGUI_EDITOR_PORT||settings.editorPort||5199);
  if(![webPort,editorPort].every(port=>Number.isInteger(port)&&port>=1024&&port<=65535))throw Error('Workspace ports must be integers from 1024 to 65535.');
  process.env.LGUI_WEB_PORT=String(webPort);
  process.env.EDITOR_URL=`http://127.0.0.1:${editorPort}/?agent=1`;
  if (command === 'doctor') {
    console.log(JSON.stringify({workspace,pluginVersion:readJson(path.join(pluginRoot,'plugin.json')).version,workspaceVersion:readJson(marker).version,node:process.version,
      dependencies:readJson(local('dependencies.lock.json')).npm.map(spec=>{
        const packages=Object.entries(spec.required).map(([name,expected])=>{
          const file=local((spec.directory==='.'?'':spec.directory+'/')+'node_modules/'+name+'/package.json');
          const actual=fs.existsSync(file)?readJson(file).version:null;
          return {name,expected,actual,matches:actual===expected};
        });return {directory:spec.directory,packages,installed:packages.every(item=>item.matches)};
      }),
      unityEditorOverride:process.env.UNITY_EDITOR || null,editorUrl:process.env.EDITOR_URL,webUrl:`http://127.0.0.1:${webPort}/fidelity/`},null,2)); return;
  }
  if (command === 'bootstrap') return node('scripts/bootstrap.mjs',args);
  if (command === 'build-web') {
    await node('unity-migration/complex-inventory/scripts/build-app.mjs');
    return node('unity-migration/complex-inventory/fidelity/build-fidelity.mjs');
  }
  if (command === 'serve') return node('unity-migration/complex-inventory/scripts/serve.mjs',args);
  if (command === 'editor') return run(process.execPath,[local('repos/editor-online/node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(editorPort),'--strictPort',...args],local('repos/editor-online'),{...process.env,FAIRY_AGENT_CONNECTION:local('闭环验证/agent-connection.local.json')});
  if (command === 'agent') {
    const output=args[0]==='call'?args[3]:undefined;
    if(output&&(!path.isAbsolute(output)||!within(workspace,resolved(output)))) throw Error('Export must be an absolute path inside the selected workspace.');
    return run(process.execPath,[path.join(pluginRoot,'tools/agent.mjs'),'--connection',local('闭环验证/agent-connection.local.json'),...args],workspace);
  }
  if (command === 'publish') return run(process.execPath,[path.join(pluginRoot,'tools/publish.mjs'),'--workspace',workspace,...args],workspace);
  if (command === 'test') return run(process.execPath,['--test',local('scripts/bootstrap.test.mjs'),local('prototype/model.test.ts'),local('unity-migration/complex-inventory/shared/complex-inventory.test.mjs'),...fs.readdirSync(local('unity-migration/complex-inventory/fidelity')).filter(f=>f.endsWith('.test.mjs')).map(f=>local('unity-migration/complex-inventory/fidelity/'+f)),local('unity-migration/complex-inventory/scripts/layout.test.mjs')],workspace);
  if (command === 'verify-browser') {
    await node('unity-migration/complex-inventory/fidelity/accept-adaptive-controls.mjs',args);
    return node('unity-migration/complex-inventory/fidelity/accept-narrow-layout.mjs',args);
  }
  if (command === 'verify-editor') return node('闭环验证/browser-acceptance.mjs',args);
  if (command === 'unity-setup') {
    await node('unity-migration/complex-inventory/scripts/publish-fidelity-project.mjs');
    return node('unity-migration/complex-inventory/scripts/setup-fidelity-unity.mjs');
  }
  if (command === 'unity') return run('powershell.exe',['-NoProfile','-File',local('unity-migration/complex-inventory/scripts/run-fidelity.ps1'),...args],workspace);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
