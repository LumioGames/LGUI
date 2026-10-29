import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'plugin/tools/lgui.mjs');
const run = (...args) => spawnSync(process.execPath, [cli, ...args], {cwd: os.tmpdir(), encoding:'utf8'});
test('initialization works from unrelated cwd, repeats safely, and preserves user changes', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-test-'));
  const workspace = path.join(parent, 'user workspace');
  assert.equal(run('init', '--workspace', workspace, '--template', 'inventory').status, 0);
  assert.ok(fs.existsSync(path.join(workspace, '.lgui/workspace.json')));
  assert.ok(fs.existsSync(path.join(workspace, 'unity-migration/complex-inventory/fidelity/index.html')));
  assert.equal(run('init', '--workspace', workspace).status, 0);
  const model = path.join(workspace, 'prototype/shared/model.ts');
  fs.appendFileSync(model, '\n// user change\n');
  const result = run('init', '--workspace', workspace);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /differing|modified/i);
  assert.match(fs.readFileSync(model, 'utf8'), /user change/);
});
test('missing workspace, cache-contained workspace and unknown command fail without default writes', () => {
  assert.match(run('init').stderr, /--workspace/);
  assert.match(run('init', '--workspace', path.join(root, 'bad-project')).stderr, /overlap|plugin/i);
  assert.match(run('no-such-command', '--workspace', os.tmpdir()).stderr, /Unknown command/);
});
test('workspace alias through a junction cannot write inside the plugin', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-link-'));
  fs.symlinkSync(root, path.join(parent, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.notEqual(run('init', '--workspace', path.join(parent, 'alias', 'bad-project')).status, 0);
  assert.equal(fs.existsSync(path.join(root, 'bad-project')), false);
});
test('agent exports cannot write outside the explicitly selected workspace', () => {
  const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'lgui-export-'));
  fs.mkdirSync(path.join(workspace,'.lgui'));
  fs.writeFileSync(path.join(workspace,'.lgui/workspace.json'),JSON.stringify({version:'0.1.0'}));
  const result=run('agent','--workspace',workspace,'call','selected-client',path.join(workspace,'request.json'),path.join(root,'bad-export.zip'));
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/Export must be.*workspace/);
  assert.equal(fs.existsSync(path.join(root,'bad-export.zip')),false);
});
