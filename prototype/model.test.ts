import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from './shared/model.ts';

test('claim enforces eligibility and rejects duplicate reward', () => {
  const store = new Inventory(30);
  assert.equal(store.claim('item-0').ok, false);
  assert.equal(store.claim('item-1').ok, true);
  assert.equal(store.claim('item-1').ok, false);
  assert.equal(store.snapshot().coins, 10);
});
test('query filters Chinese names and progress promotes only locked items', () => {
  const store = new Inventory(30);
  store.setQuery('药水');
  assert.equal(store.snapshot().visible.length, 10);
  store.progress();
  assert.equal(store.snapshot().items[0].state, 'ready');
  assert.equal(store.snapshot().items[2].state, 'claimed');
});
test('view subscriptions release without destroying global state', () => {
  const store = new Inventory(30);
  let callbacks = 0;
  const release = store.subscribe(() => callbacks++);
  store.claim('item-1');
  assert.equal(callbacks, 1);
  release(); release();
  store.progress();
  assert.equal(callbacks, 1);
  assert.equal(store.listenerCount, 0);
  assert.equal(store.snapshot().coins, 10);
});
