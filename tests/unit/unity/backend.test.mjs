import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {importTs, typecheck} from '../../helpers/ts.mjs';

const entry = fileURLToPath(new URL('../../../plugin/framework/backends/unity/adapter/index.ts', import.meta.url));

test('Unity 后端在启动前明确拒绝读取 root/platform，在没有 PuerTS 时明确报错', async () => {
  const module = await importTs(entry).catch(() => ({}));
  assert.equal(typeof module.createUnityBackend, 'function', 'Unity 必须提供可启动的 createUnityBackend');
  const backend = module.createUnityBackend();
  assert.equal(backend.name, 'unity');
  assert.throws(() => backend.root, error => error.code === 'LGUI-RT-027');
  assert.throws(() => backend.platform, error => error.code === 'LGUI-RT-027');
  await assert.rejects(backend.init({projectName: 'test', defaultFont: null, uiBase: 'UI'}), error => error.code === 'LGUI-RT-001');
});

test('Unity 后端和平台只依赖 ES2020，在 strict 下完整实现 core 合同', () => {
  assert.deepEqual(typecheck([entry]), []);
});
