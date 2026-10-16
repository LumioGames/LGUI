import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {contained,within} from '../tools/paths.mjs';
test('resource paths reject escaping, drive paths, symlinks and prefix-confusable roots',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-path-'));
 assert.equal(contained(root,'skills/setup/SKILL.md'),path.join(root,'skills/setup/SKILL.md'));
 for(const file of ['../secret','a/../../secret','/absolute','C:/secret','a\\b','a//b'])assert.throws(()=>contained(root,file));
 const outside=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-outside-'));
 fs.symlinkSync(outside,path.join(root,'link'),process.platform==='win32'?'junction':'dir');
 assert.throws(()=>contained(root,'link/secret'));
 assert.equal(within(root,root+'-other'),false);
});
