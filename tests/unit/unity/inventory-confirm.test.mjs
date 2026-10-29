import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInventoryContext} from '../../unity/acceptance/context.mjs';
import {runHeadless} from '../../conformance/runner.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const codePath = file => JSON.stringify(file.split(path.sep).join('/'));

test('inventory sell and buy confirmation interpolate once and produce no runtime errors', async () => {
  const context = await createInventoryContext();
  // Repository development instrumentation reads the real backend log. The
  // public game platform API remains limited to its network/storage contract.
  fs.writeFileSync(path.join(context.root, 'conformance/cases/confirm-log.ts'), `
import {BagView} from ${codePath(path.join(repository, 'examples/inventory/src/modules/bag/BagView.ts'))};
import {runtime} from ${codePath(path.join(context.root, '.lgui/framework/mvc/runtime.ts'))};
export default {screen:{width:1280,height:720},async run(t){
  await t.open(BagView);
  await t.click('Bag/BagPanel.sellButton');
  const sell={title:t.text('Common/Confirm.title'),message:t.text('Common/Confirm.message')};
  await t.key('Escape');
  await t.click('Bag/BagPanel.shopButton');await t.advance(16);
  await t.click('Shop/ShopPanel.list[2]');
  const buy={title:t.text('Common/Confirm.title'),message:t.text('Common/Confirm.message')};
  return {sell,buy,errors:runtime().backend.platform.log.recent().filter(entry=>entry.level==='error')};
}};
`);
  const output = await runHeadless(context, 'confirm-log');
  assert.deepEqual(output.data.sell, {title: '出售', message: '出售 霜纹长剑 ×1，得到 80 金币？'});
  assert.deepEqual(output.data.buy, {title: '购买', message: '花 190 金币购买 星露灵药？'});
  assert.deepEqual(output.data.errors, [], 'Translated messages must not be looked up as keys again');
});
