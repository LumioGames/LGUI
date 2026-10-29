import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateWeb, generateUnity} from '../../plugin/tools/lib/generate/index.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const projects = {
  // 新建工程模板里的界面工程（S2-A3 改成 ui/ 之前还在 project/ 下）。
  template: path.join(repo, 'plugin/templates/project/project/UI.fairy'),
  inventory: path.join(repo, 'examples/inventory/legacy/project/Inventory.fairy')
};
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-gen-'));

for (const [label, fairy] of Object.entries(projects)) {
  test(`${label}：网页界面包有 package.xml、散图和 manifest.json，manifest 里的图片都在`, async () => {
    const out = temp();
    const result = await generateWeb(fairy, out);
    const manifest = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'));
    assert.equal(manifest.schemaVersion, 1);
    assert.ok(Object.keys(manifest.packages).length > 0);
    for (const {name, images} of Object.values(manifest.packages)) {
      const binary = fs.readFileSync(path.join(out, name, 'package.xml'));
      assert.equal(binary.subarray(0, 4).toString(), 'FGUI');
      for (const file of Object.values(images)) assert.ok(fs.existsSync(path.join(out, name, file)), `${name}/${file}`);
    }
    assert.ok(result.files.every(file => fs.existsSync(file)));
  });

  test(`${label}：Unity 界面包有 _fui.bytes`, async () => {
    const out = temp();
    const result = await generateUnity(fairy, out);
    const bytes = result.files.filter(file => file.endsWith('_fui.bytes'));
    assert.ok(bytes.length > 0);
    for (const file of bytes) assert.equal(fs.readFileSync(file).subarray(0, 4).toString(), 'FGUI');
  });
}

test('背包示例：119 张散图全部输出，Unity 端打成图集', async () => {
  const web = await generateWeb(projects.inventory, temp());
  assert.equal(Object.values(web.manifest.packages)[0].images ? Object.keys(Object.values(web.manifest.packages)[0].images).length : 0, 119);
  const unity = await generateUnity(projects.inventory, temp());
  assert.ok(unity.files.some(file => /_atlas0\.png$/.test(file)));
});

test('每次都全部重新生成：旧输出里的多余文件会被清掉', async () => {
  const out = temp();
  fs.writeFileSync(path.join(out, 'stale.txt'), 'old');
  await generateWeb(projects.template, out);
  assert.equal(fs.existsSync(path.join(out, 'stale.txt')), false);
});

test('界面工程校验不过时报 LGUI-CLI-020', async () => {
  const dir = temp();
  fs.cpSync(path.dirname(projects.template), dir, {recursive: true});
  const pkgXml = path.join(dir, 'assets/UI/package.xml');
  fs.writeFileSync(pkgXml, fs.readFileSync(pkgXml, 'utf8').replace('<resources>', '<resources><component id="missing1" name="Missing.xml" path="/"/>'));
  await assert.rejects(generateWeb(path.join(dir, 'UI.fairy'), temp()), error => (error.errors ?? [error]).every(item => item.code === 'LGUI-CLI-020'));
});

test('找不到界面工程文件时报 LGUI-CLI-020', async () => {
  await assert.rejects(generateWeb(path.join(temp(), 'UI.fairy'), temp()), error => error.code === 'LGUI-CLI-020');
});
