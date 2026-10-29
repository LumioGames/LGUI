import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {sharp} from '../../../plugin/tools/lib/vendor.mjs';

async function pngFixture(pixels, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-screenshot-pixels-'));
  const file = path.join(root, 'actual.png');
  try {
    // Encode actual independent RGB pixels. The evidence reader must decode the
    // resulting PNG, rather than accepting a header or injected statistics.
    await sharp()(Buffer.from(pixels), {raw: {width: 2, height: 2, channels: 3}}).png().toFile(file);
    const {pngEvidence} = await import('../../unity/acceptance/coverage-host.mjs');
    assert.equal(typeof pngEvidence, 'function');
    await run(file, pngEvidence);
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
}

test('coverage screenshots reject an actually encoded all-black PNG', async () => {
  await pngFixture(Array(12).fill(0), async (file, evidence) => {
    await assert.rejects(async () => evidence(file), /LGUI-RT-001.*(?:black|solid|uniform)/i);
  });
});

test('coverage screenshots reject an actually encoded non-black solid-color PNG', async () => {
  await pngFixture(Array.from({length: 4}, () => [12, 80, 145]).flat(), async (file, evidence) => {
    await assert.rejects(async () => evidence(file), /LGUI-RT-001.*(?:solid|uniform)/i);
  });
});

test('coverage screenshots accept different actual RGB pixels and retain untouched PNG evidence and raw statistics', async () => {
  await pngFixture([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255], async (file, evidence) => {
    const bytes = fs.readFileSync(file), before = createHash('sha256').update(bytes).digest('hex');
    const result = await evidence(file);
    assert.equal(result.width, 2);
    assert.equal(result.height, 2);
    assert.equal(result.bytes, bytes.length);
    assert.equal(result.sha256, before);
    assert.equal(result.path, file);
    assert.ok(Array.isArray(result.rgb?.channels), '必须记录解码后的真实 RGB 通道统计');
    assert.deepEqual(result.rgb.channels.map(channel => ({min: channel.min, max: channel.max, mean: channel.mean})),
      Array.from({length: 3}, () => ({min: 0, max: 255, mean: 63.75})));
    assert.deepEqual(fs.readFileSync(file), bytes, '读取统计不能重写、转换或修饰原始截图');
  });
});
