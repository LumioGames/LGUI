import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSupportedPlatform, supportedPlatforms, typescript} from '../../plugin/tools/lib/vendor.mjs';

test('4 个支持的平台都通过平台检查', () => {
  for (const platform of supportedPlatforms) assert.doesNotThrow(() => assertSupportedPlatform(platform));
});

test('不支持的平台报 LGUI-CLI-005，并写明怎么改', () => {
  for (const platform of ['linux-x64-musl', 'linux-arm64', 'win32-arm64']) {
    assert.throws(() => assertSupportedPlatform(platform), error => error.code === 'LGUI-CLI-005' && error.message.includes(platform) && Boolean(error.fix));
  }
});

test('能从 plugin/tools/vendor/ 加载 TypeScript 5.9.3', () => {
  assert.equal(typescript().version, '5.9.3');
});
