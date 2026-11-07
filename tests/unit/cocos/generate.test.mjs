import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateCocos} from '../../../plugin/tools/lib/generate/index.mjs';

const repo = fileURLToPath(new URL('../../..', import.meta.url));
const projects = {
  template: path.join(repo, 'plugin/templates/project/ui/UI.fairy'),
  inventory: path.join(repo, 'examples/inventory/ui/UI.fairy')
};
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-cocos-'));

for (const [label, fairy] of Object.entries(projects)) {
  test(`${label}：Cocos 界面包按 <out>/<包名>/ 分组，二进制包和图集都在`, async () => {
    const out = temp();
    const result = await generateCocos(fairy, out);
    assert.ok(result.files.length > 0);
    for (const file of result.files) {
      assert.ok(fs.existsSync(file), file);
      // 全部产物都在包目录里，根目录不放文件（decisions/003 的 bundle 布局）
      assert.notEqual(path.dirname(file), out, file);
    }
    const bytes = result.files.filter(file => file.endsWith('_fui.bytes'));
    assert.ok(bytes.length > 0);
    for (const file of bytes) assert.equal(fs.readFileSync(file).subarray(0, 4).toString(), 'FGUI');
  });
}

test('背包示例：五个包各自成目录，图集和声音在包目录里，根目录没有散文件', async () => {
  const out = temp();
  await generateCocos(projects.inventory, out);
  for (const name of ['Bag', 'Common', 'Main', 'Reward', 'Shop']) {
    const dir = path.join(out, name);
    assert.ok(fs.existsSync(path.join(dir, `${name}_fui.bytes`)), `${name}_fui.bytes`);
  }
  assert.ok(fs.existsSync(path.join(out, 'Common', 'Common_click001.mp3')), '包里的声音跟着包目录走');
  const atlases = fs.readdirSync(out, {recursive: true}).filter(file => String(file).endsWith('_atlas0.png'));
  assert.ok(atlases.length >= 3, `图集数量 ${atlases.length}`);
  assert.deepEqual(fs.readdirSync(out).filter(file => !['Bag', 'Common', 'Main', 'Reward', 'Shop'].includes(file)), []);
});

test('每次都全部重新生成：旧输出里的多余文件会被清掉', async () => {
  const out = temp();
  fs.writeFileSync(path.join(out, 'stale.txt'), 'old');
  await generateCocos(projects.template, out);
  assert.equal(fs.existsSync(path.join(out, 'stale.txt')), false);
});
