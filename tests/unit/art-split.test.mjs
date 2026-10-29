import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {run} from './cli/helpers.mjs';
import {generateWeb} from '../../plugin/tools/lib/generate/index.mjs';

const atlas = fileURLToPath(new URL('../../examples/inventory/ui/art-src/Bag/items-atlas.png', import.meta.url));
const names = Array.from({length: 24}, (_, i) => `item${i}`);

test('lgui art split：旧示例的 items-atlas.png（1536×1024，6×4）拆成 24 张 128×128，登记进 package.xml，lgui check 通过，网页界面包里有它们', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-art-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const result = JSON.parse((await run(['art', 'split', atlas, '--grid', '6x4', '--size', '128x128', '--pkg', 'Main', '--names', names.join(','), '--json'], root)).stdout);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.data.images.length, 24);
  assert.deepEqual(result.data.cell, {width: 256, height: 256});
  const xml = fs.readFileSync(path.join(root, 'ui/assets/Main/package.xml'), 'utf8');
  assert.match(xml, /<image id="art00000" name="item0\.png" path="\/" exported="true" width="128" height="128"\/>/);
  assert.ok(fs.existsSync(path.join(root, 'ui/art-src/Main/items-atlas.png')));
  const check = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(check.ok, true, JSON.stringify(check.errors));
  const web = await generateWeb(path.join(root, 'ui/UI.fairy'), path.join(root, '.lgui/build/web/ui'));
  assert.equal(Object.keys(web.manifest.packages.main0001.images).length, 24);
  // 再拆一次：目标已存在，报错不覆盖
  const again = JSON.parse((await run(['art', 'split', atlas, '--grid', '6x4', '--size', '128x128', '--pkg', 'Main', '--names', names.join(','), '--json'], root)).stdout);
  assert.equal(again.errors[0].code, 'LGUI-CLI-082');
});

test('lgui art split：名字数和格子数不一样报 LGUI-CLI-081；包不存在报 LGUI-CLI-083；名字可以写在文件里', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-art2-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const short = JSON.parse((await run(['art', 'split', atlas, '--grid', '6x4', '--size', '64x64', '--pkg', 'Main', '--names', 'a,b', '--json'], root)).stdout);
  assert.equal(short.errors[0].code, 'LGUI-CLI-081');
  const nopkg = JSON.parse((await run(['art', 'split', atlas, '--grid', '6x4', '--size', '64x64', '--pkg', 'Nope', '--names', 'a', '--json'], root)).stdout);
  assert.equal(nopkg.errors[0].code, 'LGUI-CLI-083');
  fs.writeFileSync(path.join(root, 'names.txt'), names.map(n => n + 'x').join('\n'));
  const fromFile = JSON.parse((await run(['art', 'split', atlas, '--grid', '6x4', '--size', '64x64', '--pkg', 'Main', '--names', 'names.txt', '--json'], root)).stdout);
  assert.equal(fromFile.ok, true, JSON.stringify(fromFile.errors));
});
