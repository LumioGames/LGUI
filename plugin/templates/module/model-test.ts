import { test } from 'node:test';
import assert from 'node:assert/strict';
import { {{model}} } from '../src/modules/{{feature}}/{{NAME}}Model';

test('{{NAME}}Model：选中一项', () => {
  {{model}}.select('item2');
  assert.equal({{model}}.get().selectedId, 'item2');
});
