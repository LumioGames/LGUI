import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';

const moduleUrl = new URL('./acceptance.mjs', import.meta.url);
const source = fs.readFileSync(moduleUrl, 'utf8');
const assess = source.includes('export function assessHostErrors')
  ? (await import(moduleUrl.href)).assessHostErrors : undefined;
function policy(errors, options = {}) {
  assert.equal(typeof assess, 'function', 'The explicit strict/baseline error policy is not implemented yet');
  return assess(errors, { mode: 'editor', allowStartupSearchError: false, ...options });
}
const known = 'ArgumentOutOfRangeException: Index was out of range.\n'
  + 'UnityEditor.Search.SearchDatabase+<EnumerateAll>d__78.MoveNext ()\n'
  + 'UnityEditor.Search.SearchDatabase.GetDefaultSearchDatabase ()\n'
  + 'UnityEditor.Search.SearchInit.IndexationOnStartup ()';

test('explicit editor allowance still rejects unknown errors', () => {
  assert.equal(policy(['TypeError: Inventory dispatch failed'], { allowStartupSearchError: true }).ok, false);
});
test('default strict mode rejects even the known Search startup stack', () => {
  assert.equal(policy([known]).ok, false);
});
test('a partial Search stack is not an allowlisted startup exception', () => {
  assert.equal(policy([known.replace('UnityEditor.Search.SearchDatabase.GetDefaultSearchDatabase ()', '')], { allowStartupSearchError: true }).ok, false);
});
test('the opt-in is rejected in Player mode', () => {
  assert.throws(() => policy([], { mode: 'player', allowStartupSearchError: true }), /Editor/);
});
test('known startup baseline is retained verbatim and marks the result partial', () => {
  const result = policy([known], { allowStartupSearchError: true });
  assert.equal(result.ok, true);
  assert.equal(result.requiresPartial, true);
  assert.deepEqual(result.originalStartupErrors, [known]);
});
test('new occurrences of even the known stack are rejected after baseline capture', () => {
  assert.equal(policy([known, known], { allowStartupSearchError: true, baselineErrors: [known] }).ok, false);
});
test('unknown errors mixed with the captured baseline are rejected', () => {
  assert.equal(policy([known, 'NullReferenceException: RenderRow'], { allowStartupSearchError: true, baselineErrors: [known] }).ok, false);
});
test('a changed full stack is not silently folded into the original baseline', () => {
  assert.equal(policy([known + '\nA later failure'], { allowStartupSearchError: true, baselineErrors: [known] }).ok, false);
});
