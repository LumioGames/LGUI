import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {conformanceProject} from '../../conformance/runner.mjs';

test('Unity 开发运行器打包同一份一致性用例和真实后端，生成 Resources UI/翻译/游戏文件', async () => {
  const runner = await import('../../unity/runner.mjs').catch(() => ({}));
  assert.equal(typeof runner.prepareConformanceCase, 'function', 'Unity 必须提供共用用例的可执行准备入口');
  const context = await conformanceProject();
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-native-case-'));
  const output = await runner.prepareConformanceCase(context, 'binding-language', project);
  const bundle = fs.readFileSync(output.bundle, 'utf8');
  assert.match(bundle, /__lguiStart/);
  assert.match(bundle, /createUnityBackend/);
  assert.match(bundle, /ConformanceBridge/);
  assert.doesNotMatch(bundle, /\b(?:window|document)\s*\./);
  assert.doesNotMatch(bundle, /\brequire\s*\(/);
  assert.ok(fs.existsSync(path.join(output.ui, 'Main_fui.bytes')));
  assert.ok(fs.existsSync(path.join(output.ui, 'i18n', 'en.xml')));
  assert.ok(fs.existsSync(path.join(output.ui, 'i18n', 'zh-CN.xml')));
  assert.match(fs.readFileSync(path.join(output.ui, 'README.txt'), 'utf8'), /生成物/);
});

test('Unity 开发工程保留默认的相对 Search 索引配置，避免首次索引尚未初始化就进入 Play', async () => {
  const runner = await import('../../unity/runner.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-native-project-'));
  const source = name => {
    const directory = path.join(root, name);
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({name, version: name === 'com.lumiogames.lgui' ? '0.3.0' : '3.0.3'}));
    return directory;
  };
  const project = path.join(root, 'project');
  runner.prepareUnityProject(project, {unityPackage: source('com.lumiogames.lgui'), puertsCore: source('com.tencent.puerts.core'), puertsV8: source('com.tencent.puerts.v8')});
  const search = path.join(project, 'UserSettings/Search.index');
  assert.ok(fs.existsSync(search), '新测试工程必须包含 Unity 6000.6 生成的默认索引配置');
  assert.deepEqual(JSON.parse(fs.readFileSync(search, 'utf8')).roots, ['Assets', 'Packages']);
});
