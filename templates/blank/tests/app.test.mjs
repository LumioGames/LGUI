import {test} from 'node:test';import assert from 'node:assert/strict';import {createUIApp} from '../shared/app.ts';
test('title edits validate input and keep the last valid state',()=>{const app=createUIApp();app.setTitle('My UI');assert.equal(app.snapshot().title,'My UI');assert.throws(()=>app.setTitle(' '));assert.equal(app.snapshot().title,'My UI');});
