import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {launchBrowser} from '../helpers/browser.mjs';
import {conformanceProject, runH5} from './runner.mjs';

test('h5 conformance rejects a real console error even when the case returns a successful snapshot', async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
    const context = await conformanceProject();
    fs.writeFileSync(path.join(context.root, 'conformance/cases/console-error.ts'), `
export default {screen:{width:1280,height:720},async run(){
  console.error('LGUI-RT-001 deliberate browser runtime error');
  return {caseReturned:true};
}};\n`);
    await assert.rejects(runH5(context, 'console-error', browser), /LGUI-RT-001 deliberate browser runtime error/);
    assert.ok(context.h5Trace.consoleErrors.some(error => error.includes('LGUI-RT-001 deliberate browser runtime error')));
  } finally { await browser.close(); }
});
