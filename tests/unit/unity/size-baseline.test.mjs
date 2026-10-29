import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createUnityProject, puertsPatchedHash} from '../../helpers/unity.mjs';

async function tooling() {
  const value = await import('../../unity/size-baseline.mjs').catch(() => ({}));
  assert.equal(typeof value.prepareSizeBaseline, 'function', '包体对照必须有独立、可重跑的真实Unity工程准备入口');
  return value;
}
function directory(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-size-baseline-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  return root;
}
const buildConfig = () => ({unity: '6000.6.6f1', target: 'StandaloneWindows64', backend: 'IL2CPP', compiler: 'Release',
  stripping: 'Low', apiCompatibility: 'NET_Standard_2_0', managedCodeVariant: 'Release', development: false,
  buildOptions: 'None', width: 1280, height: 720, screenMode: 'Windowed', resizable: true});
test('A空白基线只有Unity依赖和Camera构建脚本，没有PuerTS或LGUI运行时', async t => {
  const value = await tooling(), root = directory(t), project = path.join(root, 'A');
  const result = value.prepareSizeBaseline({project, mode: 'A'});
  assert.equal(result.mode, 'A');
  const dependencies = JSON.parse(fs.readFileSync(path.join(project, 'Packages/manifest.json'), 'utf8')).dependencies;
  assert.equal(dependencies['com.tencent.puerts.core'], undefined);
  assert.equal(dependencies['com.lumiogames.lgui'], undefined);
  assert.equal(fs.existsSync(path.join(project, 'Assets/LGUIPuerTSBaseline.cs')), false);
  assert.ok(fs.existsSync(path.join(project, 'Assets/Editor/LGUISizeBaseline.cs')));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(project, 'UserSettings/Search.index'), 'utf8')).roots, ['Assets', 'Packages']);
});
test('B只复制明确的Core/V8 3.0.3包，固定补丁摘要，实际JsEnv探针与两程序集保留', async t => {
  const value = await tooling(), root = directory(t);
  const fixture = createUnityProject(path.join(root, 'official'), {patched: true});
  const result = value.prepareSizeBaseline({project: path.join(root, 'B'), mode: 'B', puertsCore: path.join(fixture, 'Packages/com.tencent.puerts.core'), puertsV8: path.join(fixture, 'Packages/com.tencent.puerts.v8')});
  assert.equal(result.patch.sha256, puertsPatchedHash);
  assert.equal(fs.existsSync(path.join(root, 'B/Packages/com.lumiogames.lgui')), false);
  const probe = fs.readFileSync(path.join(root, 'B/Assets/LGUIPuerTSBaseline.cs'), 'utf8');
  assert.match(probe, /new JsEnv\(/); assert.match(probe, /BackendType\.V8/); assert.match(probe, /\.Eval<int>\(/); assert.match(probe, /\.Dispose\(\)/);
  const link = fs.readFileSync(path.join(root, 'B/Assets/Baseline/link.xml'), 'utf8');
  assert.match(link, /assembly fullname="com.tencent.puerts.core" preserve="all"/);
  assert.match(link, /assembly fullname="com.tencent.puerts.v8" preserve="all"/);
});
test('B拒绝未知补丁字节与非新工程，不改源包也不留下半成品工程', async t => {
  const value = await tooling(), root = directory(t);
  const fixture = createUnityProject(path.join(root, 'official'), {patched: true});
  const core = path.join(fixture, 'Packages/com.tencent.puerts.core');
  fs.appendFileSync(path.join(core, 'Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt'), '\n');
  assert.throws(() => value.prepareSizeBaseline({project: path.join(root, 'B'), mode: 'B', puertsCore: core, puertsV8: path.join(fixture, 'Packages/com.tencent.puerts.v8')}), /LGUI-RT-001.*SHA256/);
  assert.equal(fs.existsSync(path.join(root, 'B')), false);
  assert.throws(() => value.prepareSizeBaseline({project: fixture, mode: 'A'}), /LGUI-RT-001.*fresh/);
});
test('显式lgui基线包含真实Boot和空合法生命周期脚本，完全没有UI资源', async t => {
  const value = await tooling(), root = directory(t);
  const fixture = createUnityProject(path.join(root, 'official'), {patched: true});
  const source = path.join(root, 'LGUI'); fs.mkdirSync(path.join(source, 'Runtime'), {recursive: true});
  fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({name: 'com.lumiogames.lgui', version: '0.3.0'}));
  fs.writeFileSync(path.join(source, 'Runtime/LGUIBoot.cs'), '// fixed native host fixture');
  fs.writeFileSync(path.join(source, 'Runtime/link.xml'), '<linker><assembly fullname="FairyGUI" preserve="all"/><assembly fullname="LGUI.Runtime" preserve="all"/><assembly fullname="com.tencent.puerts.core" preserve="all"/><assembly fullname="com.tencent.puerts.v8" preserve="all"/></linker>');
  const project = path.join(root, 'C');
  const result = value.prepareSizeBaseline({project, mode: 'lgui', puertsCore: path.join(fixture, 'Packages/com.tencent.puerts.core'), puertsV8: path.join(fixture, 'Packages/com.tencent.puerts.v8'), lguiPackage: source});
  assert.equal(result.label, 'C');
  assert.equal(fs.existsSync(path.join(project, 'Assets/LGUI/Resources/UI')), false);
  assert.equal(fs.existsSync(path.join(project, 'Assets/LGUIPuerTSBaseline.cs')), false);
  const script = fs.readFileSync(path.join(project, 'Assets/LGUI/Resources/Game/game.js.txt'), 'utf8');
  for (const hook of ['__lguiStart', '__lguiFrame', '__lguiDispose']) assert.match(script, new RegExp(hook));
  assert.equal(fs.existsSync(path.join(project, 'Packages/com.lumiogames.lgui/Runtime/LGUIBoot.cs')), true);
});
test('包体对照只报告同配置真实分发数字的原始差，保留负数与归属限制', async () => {
  const value = await tooling();
  assert.equal(typeof value.compareBaselineMeasurements, 'function');
  const config = buildConfig();
  const output = value.compareBaselineMeasurements([{mode: 'A', config, measurement: {distributionBytes: 100, v8Bytes: 0}}, {mode: 'B', config, measurement: {distributionBytes: 90, v8Bytes: 20}}]);
  assert.equal(output.deltas[0].bytes, -10);
  assert.match(output.attributionLimit, /GameAssembly/);
  assert.throws(() => value.compareBaselineMeasurements([{mode: 'A', config, measurement: {distributionBytes: 100}}, {mode: 'B', config: {...config, development: true}, measurement: {distributionBytes: 90}}]), /LGUI-RT-001.*config/);
});

test('包体比较拒绝双方同样缺少的每个真实配置字段', async () => {
  const value = await tooling();
  for (const key of Object.keys(buildConfig())) {
    const config = buildConfig(); delete config[key];
    const reports = ['A', 'B'].map(mode => ({mode, config, measurement: {distributionBytes: 0, v8Bytes: 0}}));
    assert.throws(() => value.compareBaselineMeasurements(reports), error => /LGUI-RT-001/.test(error.message) && error.message.includes(key),
      'missing actual field must fail even when both reports omit ' + key);
  }
});

test('包体比较明确验证配置合法值，保留合法false和零字节测量', async () => {
  const value = await tooling();
  const invalid = {unity: [''], target: ['WebGL'], backend: ['Mono2x'], compiler: ['Debug'], managedCodeVariant: ['Debug'],
    stripping: ['High'], apiCompatibility: ['NET_Standard', 'NET_Unity_4_8'], development: [0, 'false', true], buildOptions: ['Development'],
    width: [0, -1, 1.5, '1280'], height: [0, -1, 1.5, '720'], screenMode: ['invalid'], resizable: [0, 'false']};
  for (const [key, values] of Object.entries(invalid)) for (const invalidValue of [undefined, null, ...values]) {
    const config = {...buildConfig(), [key]: invalidValue};
    const reports = ['A', 'B'].map(mode => ({mode, config, measurement: {distributionBytes: 0, v8Bytes: 0}}));
    assert.throws(() => value.compareBaselineMeasurements(reports), error => /LGUI-RT-001/.test(error.message) && error.message.includes(key),
      'same invalid actual config must fail: ' + key + '=' + String(invalidValue));
  }
  const config = {...buildConfig(), resizable: false};
  const comparison = value.compareBaselineMeasurements(['A', 'B'].map(mode => ({mode, config, measurement: {distributionBytes: 0, v8Bytes: 0}})));
  assert.equal(comparison.config.development, false);
  assert.equal(comparison.config.resizable, false);
  assert.equal(comparison.deltas[0].bytes, 0);
});
test('基线报告读取实际Player Csc响应文件证明托管Release，不误读Editor编译', async t => {
  const value = await tooling(); assert.equal(typeof value.inspectManagedRelease, 'function');
  const root = directory(t); fs.mkdirSync(path.join(root, 'Library/Bee'), {recursive: true});
  const rsp = path.join(root, 'Library/Bee/Player.rsp'); fs.writeFileSync(rsp, '/optimize+\n/debug:portable\n');
  fs.writeFileSync(path.join(root, 'Library/Bee/controlP.dag.json'), JSON.stringify({Nodes: [{Annotation: 'Csc Player.dll', Inputs: ['Library/Bee/Player.rsp']}]}));
  const result = value.inspectManagedRelease(root); assert.equal(result.responses.length, 1); assert.equal(result.responses[0].optimized, true);
  fs.writeFileSync(rsp, '/optimize-\n');
  assert.throws(() => value.inspectManagedRelease(root), /LGUI-RT-001.*optimize/);
});
