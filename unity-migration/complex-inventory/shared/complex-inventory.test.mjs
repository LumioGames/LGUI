import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import crypto from 'node:crypto';

const entry = new URL('./index.ts', import.meta.url);
const exports = fs.existsSync(entry) ? await import(entry.href) : {};
function app() {
  assert.equal(typeof exports.createComplexInventoryApp, 'function', 'Complex shared business facade is not implemented');
  return exports.createComplexInventoryApp();
}
const call = (instance, op, args = {}) => JSON.parse(instance.dispatch(op, JSON.stringify(args)));
const read = instance => JSON.parse(instance.snapshot());
const save = instance => JSON.parse(call(instance, 'save').result.json);
const load = (instance, data) => call(instance, 'load', { json: JSON.stringify(data) });
const kinds = ['sword','axe','bow','staff','shield','helmet','armor','boots','ring','amulet','redPotion','bluePotion','staminaPotion','antidote','elixir','herb','mushroom','ore','crystal','leather','key','scroll','coinPouch','gem'];

test('default bag has 24 atlas kinds, 26 stable stacks and a 30-slot capacity', () => {
  const view = read(app()).view;
  assert.equal(view.capacity, 30);
  assert.equal(view.usedSlots, 26);
  assert.equal(view.coins, 12480);
  assert.equal(view.selectedId, 'sword-1');
  assert.equal(view.selected.id, 'sword-1');
  assert.deepEqual([...new Set(view.items.map(item => item.kind))], kinds);
  for (const [index, kind] of kinds.entries()) {
    const item = view.items.find(item => item.kind === kind);
    assert.equal(item.iconIndex, index);
    assert.equal(item.id, `${kind}-1`);
    assert(item.name && item.description && item.price > 0 && item.stats);
  }
  assert(view.items.some(item => item.quantity > 1));
  assert.equal(new Set(view.items.map(item => item.id)).size, 26);
});
test('search/category/sort compose deterministically and selection uses stable identity', () => {
  const instance = app();
  assert(call(instance, 'query', { query: '药水' }).view.visible.length >= 3);
  assert(call(instance, 'category', { category: 'equipment' }).view.visible.every(item => item.type === 'equipment'));
  call(instance, 'query', { query: '' });
  const sorted = call(instance, 'sort', { sort: 'price' }).view.visible;
  assert(sorted.every((item, index) => !index || sorted[index - 1].price >= item.price));
  const selected = call(instance, 'select', { id: 'sword-2' }).view;
  assert.equal(selected.selectedId, 'sword-2');
  assert.equal(selected.selected.id, 'sword-2');
  assert.equal(call(instance, 'category', { category: 'all' }).view.items.length, 26);
});
test('using a consumable removes one unit and equipment use is rejected atomically', () => {
  const instance = app();
  const before = read(instance).view.items.find(item => item.id === 'redPotion-1');
  const used = call(instance, 'use', { id: before.id });
  assert(used.ok);
  assert.equal(used.view.items.find(item => item.id === before.id).quantity, before.quantity - 1);
  const stable = read(instance).view;
  assert.equal(call(instance, 'use', { id: 'sword-1' }).ok, false);
  assert.deepEqual(read(instance).view, stable);
});
test('last consumed unit frees a slot and clears selection', () => {
  const instance = app();
  const data = save(instance);
  data.items.find(item => item.id === 'redPotion-1').quantity = 1;
  assert(load(instance, data).ok);
  call(instance, 'select', { id: 'redPotion-1' });
  const used = call(instance, 'use', { id: 'redPotion-1' });
  assert.equal(used.view.usedSlots, 25);
  assert.equal(used.view.selectedId, null);
  assert(!used.view.items.some(item => item.id === 'redPotion-1'));
});
test('equipping replaces only its slot, returns the original item and aggregates stats', () => {
  const instance = app();
  const initial = read(instance).view;
  assert.equal(call(instance, 'equip', { id: 'sword-1' }).view.equipment.weapon.id, 'sword-1');
  const replaced = call(instance, 'equip', { id: 'axe-1' });
  assert(replaced.ok);
  assert.equal(replaced.view.equipment.weapon.id, 'axe-1');
  assert.equal(replaced.view.selectedId, 'axe-1');
  assert.equal(replaced.view.selected.equipped, true);
  assert(replaced.view.items.some(item => item.id === 'sword-1'));
  assert(!replaced.view.items.some(item => item.id === 'axe-1'));
  assert.equal(replaced.view.usedSlots, initial.usedSlots - 1);
  assert.equal(replaced.view.equipmentStats.attack, replaced.view.equipment.weapon.stats.attack);
  assert.equal(call(instance, 'equip', { id: 'shield-1' }).view.equipment.offhand.id, 'shield-1');
  call(instance, 'select', { id: 'axe-1' });
  const unequipped=call(instance, 'unequip', { slot: 'weapon' }).view;
  assert.equal(unequipped.equipment.weapon, null);
  assert.equal(unequipped.selectedId, 'axe-1');
  assert.equal(unequipped.selected.equipped, false);
});
test('unequip into a full bag fails without dropping the equipped object', () => {
  const instance = app();
  call(instance, 'equip', { id: 'sword-1' });
  const data = save(instance);
  for (let index = data.items.length; index < data.capacity; index++) data.items.push({ id: `ore-extra-${index}`, kind: 'ore', quantity: 1 });
  assert(load(instance, data).ok);
  const before = read(instance).view;
  const result = call(instance, 'unequip', { slot: 'weapon' });
  assert.equal(result.errorCode, 'bag_full');
  assert.deepEqual(result.view, before);
});
test('selling selected quantities credits exact price and rejects quest objects', () => {
  const instance = app();
  const ore = read(instance).view.items.find(item => item.id === 'ore-1');
  const sold = call(instance, 'sell', { id: ore.id, quantity: 2 });
  assert(sold.ok);
  assert.equal(sold.view.coins, 12480 + ore.price * 2);
  assert.equal(sold.view.items.find(item => item.id === ore.id).quantity, ore.quantity - 2);
  const before = read(instance).view;
  assert.equal(call(instance, 'sell', { id: 'key-1', quantity: 1 }).errorCode, 'quest_item');
  assert.deepEqual(read(instance).view, before);
});
test('invalid sale quantities and missing/worn targets never mutate business state', () => {
  const instance = app();
  call(instance, 'equip', { id: 'sword-1' });
  const before = read(instance).view;
  for (const quantity of [0,-1,1.5,'1',null,999999,Number.MAX_SAFE_INTEGER]) assert.equal(call(instance, 'sell', { id: 'ore-1', quantity }).ok, false);
  for (const id of ['missing', 'sword-1']) assert.equal(call(instance, 'sell', { id, quantity: 1 }).ok, false);
  assert.deepEqual(read(instance).view, before);
});
test('original reward eligibility, progress and one-time coins remain composed', () => {
  const instance = app();
  assert.equal(read(instance).view.rewards.items.length, 30);
  assert.equal(call(instance, 'claim', { id: 'item-0' }).ok, false);
  assert.equal(call(instance, 'claim', { id: 'item-1' }).view.coins, 12490);
  const before = read(instance).view;
  assert.equal(call(instance, 'claim', { id: 'item-1' }).ok, false);
  assert.deepEqual(read(instance).view, before);
  const progressed = call(instance, 'progress').view;
  assert.equal(progressed.rewards.items[0].state, 'ready');
  assert.equal(progressed.rewards.items[2].state, 'claimed');
  assert.equal(call(instance, 'claim', { id: 'item-0' }).view.coins, 12500);
});
test('save/load roundtrips equipment, quantity, wallet, filtering and original reward replay', () => {
  const instance = app();
  call(instance, 'equip', { id: 'sword-2' });
  call(instance, 'use', { id: 'bluePotion-1' });
  call(instance, 'sell', { id: 'ore-1', quantity: 2 });
  call(instance, 'progress');
  call(instance, 'claim', { id: 'item-0' });
  call(instance, 'rewardQuery', { query: '药水' });
  call(instance, 'query', { query: '剑' });
  call(instance, 'sort', { sort: 'rarity' });
  call(instance, 'select', { id: 'sword-2' });
  const saved = save(instance);
  const restored = app();
  assert(load(restored, saved).ok);
  const normalize = view => ({ ...view, revision: 0 });
  assert.deepEqual(normalize(read(restored).view), normalize(read(instance).view));
  assert.deepEqual(save(restored), saved);
  assert.equal(call(restored, 'claim', { id: 'item-0' }).ok, false);
});
test('invalid schema and impossible reward replay fail atomically', () => {
  const instance = app();
  const original = save(instance);
  const bad = [
    { ...original, schemaVersion: 2 },
    { ...original, walletCoins: -1 },
    { ...original, walletCoins: 1.5 },
    { ...original, selectedId: 'missing' },
    { ...original, capacity: 1 },
    { ...original, category: ['all'] },
    { ...original, sort: ['default'] },
    { ...original, items: [...original.items, original.items[0]] },
    { ...original, items: [{ ...original.items[0], quantity: 2 }, ...original.items.slice(1)] },
    { ...original, items: [{ ...original.items[0], price: 999 }, ...original.items.slice(1)] },
    { ...original, rewards: { ...original.rewards, claimedIds: ['item-0'] } },
    { ...original, rewards: { ...original.rewards, claimedIds: ['item-2'] } },
    { ...original, rewards: { ...original.rewards, claimedIds: ['item-1','item-1'] } },
    { ...original, equipment: { ...original.equipment, head: { id: 'axe-wrong', kind: 'axe', quantity: 1 } } },
  ];
  const before = read(instance);
  for (const data of bad) {
    assert.equal(load(instance, data).ok, false);
    assert.deepEqual(read(instance), before);
  }
});
test('one callback per mutation, idempotent subscriptions and released callbacks stay absent', () => {
  assert.equal(typeof exports.ComplexInventory, 'function', 'Pure model class is missing');
  const model = new exports.ComplexInventory();
  let notifications = 0;
  const fn = () => notifications++;
  const dispose = model.subscribe(fn);
  model.subscribe(fn);
  assert.equal(model.listenerCount, 1);
  model.setQuery('药水');
  assert.equal(notifications, 1);
  dispose(); dispose();
  assert.equal(model.listenerCount, 0);
  model.progress();
  assert.equal(notifications, 1);
});
test('250 facade open/close cycles preserve state and never grow listeners', () => {
  const instance = app();
  call(instance, 'sell', { id: 'ore-1', quantity: 1 });
  const coins = read(instance).view.coins;
  for (let index = 0; index < 250; index++) {
    call(instance, 'open');
    assert.equal(call(instance, 'open').session.listenerCount, 1);
    const notifications = read(instance).session.notifications;
    call(instance, 'query', { query: index % 2 ? '' : '药水' });
    assert.equal(read(instance).session.notifications, notifications + 1);
    call(instance, 'close');
    assert.equal(call(instance, 'close').session.listenerCount, 0);
    call(instance, 'progress');
    assert.equal(read(instance).session.notifications, notifications + 1);
  }
  const final = read(instance);
  assert.equal(final.view.coins, coins);
  assert.equal(final.session.closedCallbacks, 0);
  assert.equal(final.session.opens, 250);
  assert.equal(final.session.closes, 250);
});
test('malformed/unknown protocol and invalid filters leave model and session unchanged', () => {
  const instance = app();
  const before = read(instance);
  for (const [op, json] of [['query','{'], ['open','[]'], ['query','{"query":2}'], ['category','{"category":"magic"}'], ['sort','{"sort":"random"}'], ['select','{"id":"missing"}'], ['load','{"json":"{}"}'], ['equip','{"id":"ore-1"}'], ['unequip','{"slot":"unknown"}'], ['sellAll','{}']]) {
    assert.equal(JSON.parse(instance.dispatch(op, json)).ok, false);
    assert.deepEqual(read(instance), before);
  }
});
test('snapshots are detached from internal inventory and stats', () => {
  assert.equal(typeof exports.ComplexInventory, 'function', 'Pure model class is missing');
  const model = new exports.ComplexInventory();
  const before = model.snapshot();
  const changed = model.snapshot();
  changed.items[0].name = 'corrupted';
  changed.items[0].stats.attack = 999999;
  changed.rewards.items[0].state = 'claimed';
  assert.deepEqual(model.snapshot(), before);
});
test('the original reward source hash stays unchanged', () => {
  app();
  const bytes = fs.readFileSync(new URL('../../../prototype/shared/model.ts', import.meta.url));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'e3162e7d648a61dd5817918a8e2a753b4899f97fde0a15c124ca2c9a28742cf6');
});
test('C# display contract has string/null errors, fixed slots and preformatted stats', () => {
  const instance = app();
  const initial = read(instance);
  assert.equal(initial.error, null);
  assert.equal(initial.errorCode, null);
  assert.deepEqual(Object.keys(initial.view.equipment), ['weapon','offhand','head','body','feet','ring','neck']);
  for(const item of initial.view.items) assert.equal(typeof item.displayStats, 'string');
  assert(initial.view.selected.displayStats.includes(`攻击 +${initial.view.selected.stats.attack}`));
  const failed = call(instance, 'sell', { id: 'key-1', quantity: 1 });
  assert.equal(typeof failed.error, 'string');
  assert.equal(failed.errorCode, 'quest_item');
  assert.equal(JSON.parse(instance.dispatch('load','{"json":"{"}')).errorCode, 'invalid_save');
});
test('repeated loading does not duplicate reward payouts or equipment objects', () => {
  const instance = app();
  call(instance, 'open');
  call(instance, 'progress');
  call(instance, 'claim', { id: 'item-0' });
  call(instance, 'equip', { id: 'sword-1' });
  const saved = save(instance);
  const expected = read(instance).view;
  for(let index=0;index<12;index++) {
    const result=load(instance,saved);
    assert(result.ok);
    assert.deepEqual({ ...result.view, revision:0 }, { ...expected, revision:0 });
    assert.equal(result.session.listenerCount,1);
    assert.equal(new Set([...result.view.items.map(item => item.id),result.view.equipment.weapon.id]).size,26);
  }
  const before=read(instance);
  for(const json of ['{','null','[]','{}','{"schemaVersion":1}']) {
    assert.equal(call(instance,'load',{json}).ok,false);
    assert.deepEqual(read(instance),before);
  }
});
test('a stale repeated disposer cannot cancel a later subscription for the same callback', () => {
  assert.equal(typeof exports.ComplexInventory, 'function');
  const model=new exports.ComplexInventory();let count=0;
  const callback=()=>count++;
  const old=model.subscribe(callback), duplicate=model.subscribe(callback);
  old();
  const current=model.subscribe(callback);
  old();duplicate();
  assert.equal(model.listenerCount,1);
  model.progress();assert.equal(count,1);
  current();assert.equal(model.listenerCount,0);
});
