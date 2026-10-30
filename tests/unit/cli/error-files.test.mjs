// 命令行报错里的文件：一律相对工程根目录、用 /（和 lgui check 的输出一样），Windows 上也不出现 D:\…。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from './helpers.mjs';
import {readTexts} from '../../../plugin/tools/lib/dev/bundle.mjs';
import {generateProjectTypes} from '../../../plugin/tools/lib/generate/index.mjs';

const fresh = async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-files-'));
  assert.equal((await run(['init', 'g'], parent)).code, 0);
  return path.join(parent, 'g');
};
const json = async (argv, root) => JSON.parse((await run([...argv, '--json'], root)).stdout);
const replace = (root, file, from, to) => { const full = path.join(root, file); fs.writeFileSync(full, fs.readFileSync(full, 'utf8').replace(from, to)); };
const errorsOf = async promise => { try { await promise; } catch (error) { return error.errors ?? [error]; } assert.fail('应该报错'); };

test('工程配置、XML、文本表的报错：file 是相对路径', async () => {
  const root = await fresh();
  fs.writeFileSync(path.join(root, '.lgui/project.json'), '{ not json');
  const bad = await json(['check'], root);
  assert.deepEqual([bad.errors[0].code, bad.errors[0].file], ['LGUI-CLI-004', '.lgui/project.json']);
  assert.ok(!bad.errors[0].message.includes(root), bad.errors[0].message);

  const xml = await fresh();
  replace(xml, 'ui/assets/Main/MainView.xml', '</displayList>', '</displayList');
  const broken = await json(['check'], xml);
  assert.ok(broken.errors.some(e => e.code === 'LGUI-CLI-020' && e.file === 'ui/assets/Main/MainView.xml'), JSON.stringify(broken.errors));

  const texts = await fresh();
  fs.writeFileSync(path.join(texts, 'i18n/en.json'), '{');
  const table = await json(['check'], texts);
  assert.deepEqual([table.errors[0].code, table.errors[0].file], ['LGUI-CLI-031', 'i18n/en.json']);
  const missing = await errorsOf(Promise.resolve().then(() => readTexts(texts, ['fr'])));
  assert.deepEqual([missing[0].code, missing[0].file], ['LGUI-CLI-031', 'i18n/fr.json']);
});

test('OpenFairyGUI 校验没通过：file 是出问题的组件文件，带行号', async () => {
  const root = await fresh();
  replace(root, 'ui/assets/Main/MainView.xml', 'src="button01"', 'src="zzzz0001"');
  const found = (await json(['check'], root)).data.findings.filter(f => f.code === 'LGUI-CLI-020');
  assert.ok(found.length > 0);
  for (const f of found) {
    assert.equal(f.file, 'ui/assets/Main/MainView.xml');
    assert.ok(f.line > 1, '指到出问题的元素');
  }
});

test('生成类型时的控件重名、横竖不一致：file 是相对路径', async () => {
  const root = await fresh();
  replace(root, 'ui/assets/Main/MainView.xml', 'name="status"', 'name="title"');
  replace(root, 'ui/assets/Main/MainView@portrait.xml', 'name="status"', 'name="state"');
  const errors = await errorsOf(generateProjectTypes(root));
  assert.ok(errors.some(e => e.code === 'LGUI-UI-004'));
  assert.ok(errors.some(e => e.code === 'LGUI-UI-007'));
  for (const e of errors) assert.match(e.file, /^ui\/assets\/Main\/MainView(@portrait)?\.xml$/, e.message);
});
