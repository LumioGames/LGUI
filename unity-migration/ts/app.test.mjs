import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';

const implementation = new URL('./inventory-app.ts', import.meta.url);
const factory = fs.existsSync(implementation)
  ? (await import(implementation.href)).createInventoryApp
  : undefined;
function app(count = 30) {
  assert.equal(typeof factory, 'function', 'The TypeScript bridge factory is not implemented yet');
  return factory(count);
}
const read = instance => JSON.parse(instance.snapshot());
const call = (instance, op, args = {}) => JSON.parse(instance.dispatch(op, JSON.stringify(args)));

test('initial JSON view uses the real three-state Inventory data', () => {
  const initial = read(app());
  assert.equal(initial.ok, true);
  assert.deepEqual(initial.view.items.slice(0, 3).map(item => item.state), ['locked', 'ready', 'claimed']);
  assert.equal(initial.view.items.length, 30);
  assert.equal(initial.session.listenerCount, 0);
  assert.equal(initial.session.open, false);
});

test('claim eligibility and duplicate rejection follow the shared Inventory model', () => {
  const instance = app();
  assert.equal(call(instance, 'claim', { id: 'item-0' }).ok, false);
  const reward = call(instance, 'claim', { id: 'item-1' });
  assert.equal(reward.ok, true);
  assert.equal(reward.view.coins, 10);
  assert.match(reward.result.message, /10 金币/);
  assert.equal(call(instance, 'claim', { id: 'item-1' }).ok, false);
  assert.equal(read(instance).view.coins, 10);
});

test('query and progress operate on Chinese names and preserve claimed items', () => {
  const instance = app();
  assert.equal(call(instance, 'query', { query: '药水' }).view.visible.length, 10);
  const state = call(instance, 'progress').view;
  assert.equal(state.items[0].state, 'ready');
  assert.equal(state.items[2].state, 'claimed');
  assert.equal(state.query, '药水');
});

test('250 repeated opens and closes keep one listener and no callbacks while closed', () => {
  const instance = app();
  for (let i = 0; i < 250; i++) {
    call(instance, 'open');
    assert.equal(call(instance, 'open').session.listenerCount, 1);
    const before = read(instance).session.notifications;
    assert.equal(call(instance, 'progress').session.notifications, before + 1);
    call(instance, 'close');
    const closed = call(instance, 'close');
    assert.equal(closed.session.listenerCount, 0);
    assert.equal(call(instance, 'query', { query: i % 2 ? '' : '药水' }).session.notifications, before + 1);
  }
  const final = read(instance).session;
  assert.equal(final.opens, 250);
  assert.equal(final.closes, 250);
  assert.equal(final.closedCallbacks, 0);
  assert.equal(call(instance, 'open').session.listenerCount, 1);
});

test('closing a UI session preserves rewards and query in the global business instance', () => {
  const instance = app();
  call(instance, 'open');
  call(instance, 'claim', { id: 'item-1' });
  call(instance, 'query', { query: '旅行' });
  call(instance, 'close');
  call(instance, 'progress');
  const reopened = call(instance, 'open');
  assert.equal(reopened.view.coins, 10);
  assert.equal(reopened.view.query, '旅行');
  assert.equal(reopened.view.items[1].state, 'claimed');
  assert.equal(reopened.session.listenerCount, 1);
});

test('malformed JSON and unsupported commands return errors without changing state', () => {
  const instance = app();
  const before = read(instance);
  for (const [op, raw] of [['query', '{'], ['query', '[]'], ['query', '{"query":4}'], ['claim', '{}'], ['reset', '{}']]) {
    assert.equal(JSON.parse(instance.dispatch(op, raw)).ok, false);
  }
  const after = read(instance);
  assert.deepEqual(after.view, before.view);
  assert.deepEqual(after.session, before.session);
});

test('300 and 3000 items use the same model and lifecycle contract', () => {
  for (const count of [300, 3000]) {
    const instance = app(count);
    assert.equal(read(instance).view.items.length, count);
    assert.equal(call(instance, 'query', { query: '药水' }).view.visible.length, count / 3);
    call(instance, 'open');
    assert.equal(call(instance, 'claim', { id: 'item-1' }).view.coins, 10);
    call(instance, 'close');
    assert.equal(read(instance).session.listenerCount, 0);
  }
});
