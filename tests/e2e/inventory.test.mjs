// 背包示例（examples/inventory）：用当前的框架跑 lgui check（没有错误和警告）和 lgui test（全部通过）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {run} from '../unit/cli/helpers.mjs';
import {copyFramework} from '../../plugin/tools/lib/commands/init.mjs';

const example = fileURLToPath(new URL('../../examples/inventory', import.meta.url));

test('背包示例：lgui check 没有错误和警告，lgui test 全部通过', async () => {
  const root = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-inventory-')), 'inventory');
  fs.cpSync(example, root, {recursive: true, filter: src => !/[\\/]\.lgui[\\/](framework|build)([\\/]|$)/.test(src)});
  copyFramework(path.join(root, '.lgui', 'framework'));
  const check = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.deepEqual(check.data?.findings ?? check.errors, []);
  const result = JSON.parse((await run(['test', '--json'], root)).stdout);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.data.failed, []);
  assert.ok(result.data.passed >= 16, `通过 ${result.data.passed}`);
});
