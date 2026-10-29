import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateProject, fields} from '../../../plugin/tools/lib/project.mjs';
import {run, tempProject} from './helpers.mjs';

test('只写必填字段时其余字段补默认值', () => {
  const project = validateProject({name: 'demo', lguiVersion: '0.3.0'});
  assert.equal(project.orientation, 'both');
  assert.equal(project.devPort, 4173);
  assert.equal(project.verifySizes.length, 6);
  assert.deepEqual(project.uiCache, {keepClosedViews: 0});
});

test('缺必填字段、类型不对、多出字段，一次全部报 LGUI-CLI-004', () => {
  assert.throws(() => validateProject({orientation: 'diagonal', extra: 1}), error => {
    const messages = error.errors.map(item => item.message).join('\n');
    return error.errors.every(item => item.code === 'LGUI-CLI-004') && /name/.test(messages) && /lguiVersion/.test(messages) && /orientation/.test(messages) && /extra/.test(messages);
  });
});

test('defaultLanguage 必须在 languages 里', () => {
  assert.throws(() => validateProject({name: 'demo', lguiVersion: '0.3.0', languages: ['en'], defaultLanguage: 'zh-CN'}), error => error.errors[0].code === 'LGUI-CLI-004');
});

test('坏的 project.json 在命令里报 LGUI-CLI-004 并写明文件', async () => {
  const root = tempProject();
  fs.writeFileSync(path.join(root, '.lgui', 'project.json'), '{ not json');
  const json = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(json.errors[0].code, 'LGUI-CLI-004');
  assert.match(json.errors[0].file, /project\.json$/);
});

test('project-layout.md 的字段表列出了每个字段', () => {
  const doc = fs.readFileSync(fileURLToPath(new URL('../../../plugin/references/project-layout.md', import.meta.url)), 'utf8');
  for (const key of Object.keys(fields)) assert.ok(doc.includes(`| \`${key}\` |`), key);
});
