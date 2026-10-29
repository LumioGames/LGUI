import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

test('IIFE runs without platform globals and repeated evaluation preserves the one Inventory', () => {
  const output = new URL('./dist/inventory-app.js.txt', import.meta.url);
  assert.equal(fs.existsSync(output), true, 'The neutral IIFE bundle has not been built yet');
  const code = fs.readFileSync(output, 'utf8');
  const context = vm.createContext({ inventoryInitialCount: 3000 });
  vm.runInContext(code, context, { timeout: 5000 });
  const call = (op, args = {}) => JSON.parse(context.inventoryApp.dispatch(op, JSON.stringify(args)));
  assert.equal(JSON.parse(context.inventoryApp.snapshot()).view.items.length, 3000);
  assert.equal(call('open').session.listenerCount, 1);
  assert.equal(call('claim', { id: 'item-1' }).view.coins, 10);
  call('close');
  vm.runInContext(code, context, { timeout: 5000 });
  const afterReload = JSON.parse(context.inventoryApp.snapshot());
  assert.equal(afterReload.view.coins, 10);
  assert.equal(afterReload.session.listenerCount, 0);
  assert.equal(afterReload.session.count, 3000);
  assert.equal(call('open').session.listenerCount, 1);
  assert.equal(call('query', { query: '药水' }).view.visible.length, 1000);
  assert.equal(typeof context.document, 'undefined');
  assert.equal(typeof context.CS, 'undefined');
});
