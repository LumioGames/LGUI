import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {build}=await import(pathToFileURL(path.join(root,'repos/editor-online/node_modules/vite/dist/node/index.js')));
const result=await build({configFile:false,root,publicDir:false,logLevel:'silent',build:{write:false,minify:false,target:'es2020',lib:{entry:path.join(root,'shared/entry.ts'),formats:['iife'],name:'UIProject'}}});
const chunk=(Array.isArray(result)?result:[result]).flatMap(r=>r.output).find(c=>c.type==='chunk');if(!chunk)throw Error('No shared application bundle.');
await fs.mkdir(path.join(root,'web/vendor'),{recursive:true});await fs.writeFile(path.join(root,'web/app.js'),chunk.code);
await fs.copyFile(path.join(root,'repos/fairygui-dom/dist/fairygui.module.js'),path.join(root,'web/vendor/fairygui.module.js'));
await fs.copyFile(path.join(root,'repos/fairygui-dom/LICENSE'),path.join(root,'web/vendor/LICENSE.txt'));
console.log('Built shared TypeScript and FairyGUI web adapter.');
