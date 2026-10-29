import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createUnityProject, puertsPatchedHash} from '../../helpers/unity.mjs';

async function builder() {
  const value = await import('../../unity/player-build.mjs').catch(() => ({}));
  assert.equal(typeof value.inspectPlayerProject, 'function', 'Player 构建前必须验证实际工程，而不能仅相信包版本');
  return value;
}
function project(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-player-build-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const root = createUnityProject(path.join(temporary, 'project'), {patched: true});
  fs.mkdirSync(path.join(root, 'Assets/LGUI/Resources/Game'), {recursive: true});
  fs.writeFileSync(path.join(root, 'Assets/LGUI/Resources/Game/game.js.txt'), 'globalThis.__lguiStart=()=>{};');
  fs.mkdirSync(path.join(root, 'Assets/LGUI/Resources/UI'), {recursive: true});
  fs.writeFileSync(path.join(root, 'Assets/LGUI/Resources/UI/Main_fui.bytes'), 'real generated UI input');
  fs.writeFileSync(path.join(root, 'Assets/LGUI/LGUIBoot.unity'), '%YAML 1.1\n');
  fs.copyFileSync(new URL('../../../plugin/framework/backends/unity/package/Runtime/link.xml', import.meta.url), path.join(root, 'Assets/LGUI/link.xml'));
  return root;
}

test('Release Player 前置检查记录固定补丁原始字节摘要和实际导出脚本，输入不变', async t => {
  const {inspectPlayerProject} = await builder();
  const root = project(t);
  const output = inspectPlayerProject(root);
  assert.equal(output.unityVersion, '6000.6.6f1');
  assert.equal(output.patch.sha256, puertsPatchedHash);
  assert.equal(output.patch.unboxCalls, 4);
  assert.equal(output.game.bytes, Buffer.byteLength('globalThis.__lguiStart=()=>{};'));
  assert.match(output.game.sha256, /^[a-f0-9]{64}$/);
  assert.equal(output.ui[0].path, 'Assets/LGUI/Resources/UI/Main_fui.bytes');
  assert.match(output.ui[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(fs.existsSync(path.join(root, 'Assets/Gen')), false, '检查阶段不能生成桥或启动 Unity');
});

test('构建阶段即使summary为零错误也不能忽略实际Error/Exception/Assert', async () => {
  const value = await builder();
  assert.equal(typeof value.validatePhaseReport, 'function', 'Unity消息中的实际错误必须使构建证据失败');
  for (const type of ['Error', 'Exception', 'Assert']) {
    assert.throws(() => value.validatePhaseReport({ok: true, phase: 'generate', totalErrors: 0, editorMessages: [{type, content: 'native failure'}]}), /LGUI-RT-001.*native failure/);
  }
  assert.doesNotThrow(() => value.validatePhaseReport({ok: true, phase: 'generate', editorMessages: [{type: 'Warning', content: 'retained warning'}]}));
});

test('普通Player构建源码合同同时固定、核验和报告托管Release，保留C++ Release', () => {
  const source = fs.readFileSync(new URL('../../unity/Assets/Editor/LGUIPlayerBuild.cs', import.meta.url), 'utf8');
  const configure = source.slice(source.indexOf('public static void Configure()'), source.indexOf('public static void Generate()'));
  const verify = source.slice(source.indexOf('static void RequireConfig()'), source.indexOf('static void CheckGeneratedBridge()'));
  const report = source.slice(source.indexOf('static Configuration Config()'), source.indexOf('static void Prerequisites('));
  assert.match(configure, /PlayerSettings\.SetManagedCodeVariant\(Standalone,\s*ManagedCodeVariant\.Release\)/,
    'existing Debug managed settings must be replaced explicitly');
  assert.match(verify, /PlayerSettings\.GetManagedCodeVariant\(Standalone\)\s*!=\s*ManagedCodeVariant\.Release/,
    'Generate and Build must reject non-Release managed settings');
  assert.match(report, /managedCodeVariant\s*=\s*PlayerSettings\.GetManagedCodeVariant\(Standalone\)\.ToString\(\)/,
    'evidence must report the actual managed setting');
  assert.match(configure, /SetIl2CppCompilerConfiguration\(Standalone,\s*Il2CppCompilerConfiguration\.Release\)/);
  assert.match(verify, /GetIl2CppCompilerConfiguration\(Standalone\)\s*!=\s*Il2CppCompilerConfiguration\.Release/);
});

test('Release Player 拒绝改过字节的补丁模板，即使仍有四处 unbox 调用', async t => {
  const {inspectPlayerProject} = await builder();
  const root = project(t);
  fs.appendFileSync(path.join(root, 'Packages/com.tencent.puerts.core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt'), '\n');
  assert.throws(() => inspectPlayerProject(root), /LGUI-RT-001.*SHA256/);
});

test('Release Player 拒绝遗漏动态调用保留程序集的 Assets link.xml', async t => {
  const {inspectPlayerProject} = await builder();
  const root = project(t);
  const file = path.join(root, 'Assets/LGUI/link.xml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/.*fullname="com.tencent.puerts.v8".*\n/, ''));
  assert.throws(() => inspectPlayerProject(root), /LGUI-RT-001.*com\.tencent\.puerts\.v8/);
});

test('Release Player 拒绝其他 Unity 版本和项目内的静态绑定污染', async t => {
  const {inspectPlayerProject} = await builder();
  const root = project(t);
  const version = path.join(root, 'ProjectSettings/ProjectVersion.txt');
  fs.writeFileSync(version, 'm_EditorVersion: 6000.6.5f1\n');
  assert.throws(() => inspectPlayerProject(root), /LGUI-RT-001.*6000\.6\.6f1/);
  fs.writeFileSync(version, 'm_EditorVersion: 6000.6.6f1\n');
  fs.mkdirSync(path.join(root, 'Assets/Gen'), {recursive: true});
  fs.writeFileSync(path.join(root, 'Assets/Gen/RegisterInfo_Gen.cs'), '// stale generated type bindings');
  assert.throws(() => inspectPlayerProject(root), /LGUI-RT-001.*static wrapper/);
});

test('Player 分发体积排除 Unity 明确标记不随游戏分发的构建备份', async t => {
  const value = await builder();
  assert.equal(typeof value.measurePlayerOutput, 'function', '包体报告必须区分实际分发文件和Unity构建备份');
  const root = project(t), output = path.join(root, 'build');
  const write = (name, count) => {const file = path.join(output, name); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, Buffer.alloc(count));};
  write('Inventory.exe', 11);
  write('Inventory_Data/Plugins/x86_64/PapiV8.dll', 23);
  write('Inventory_BackUpThisFolder_ButDontShipItWithYourGame/il2cppOutput/bridge.cpp', 101);
  write('Inventory_BurstDebugInformation_DoNotShip/debug.pdb', 103);
  const report = value.measurePlayerOutput(path.join(output, 'Inventory.exe'));
  assert.equal(report.allOutputBytes, 238);
  assert.equal(report.distributionBytes, 34);
  assert.equal(report.buildSupportBytes, 204);
  assert.equal(report.v8Bytes, 23);
});

test('构建证据核对 Unity 实际 C++ 编译副本与已生成的原生桥，拒绝过期副本', async t => {
  const value = await builder();
  assert.equal(typeof value.inspectCompiledBridge, 'function', '必须核对实际进入Unity C++编译的源文件摘要');
  const root = project(t);
  const generated = path.join(root, 'Assets/Gen/Plugins/puerts_il2cpp/Puerts_il2cpp.cpp');
  const compiled = path.join(root, 'Library/Bee/artifacts/WinPlayerBuildProgram/il2cppOutput/cpp/Puerts_il2cpp.cpp');
  for (const file of [generated, compiled]) {fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, 'patched bridge');}
  const dag = path.join(root, 'Library/Bee/Player-test.dag.json');
  const object = path.join(root, 'Library/Bee/bridge.obj');
  fs.writeFileSync(object, 'real object input');
  fs.writeFileSync(dag, JSON.stringify({Nodes: [{Annotation: 'C_Win_x64_VS2022', Action: 'cl /c', Inputs: [compiled], Outputs: [object]}]}));
  const result = value.inspectCompiledBridge(root);
  assert.equal(result.files.length, 1);
  assert.equal(result.files[0].source.sha256, result.files[0].compiled.sha256);
  assert.equal(result.files[0].objects.length, 1);
  fs.writeFileSync(compiled, 'stale bridge');
  assert.throws(() => value.inspectCompiledBridge(root), /LGUI-RT-001.*compiled.*SHA256/);
});

test('普通Player默认NotAllowed，HTTP测试开关必须是真布尔且同时有两份真实测试桥', async t => {
  const value = await builder();
  assert.equal(typeof value.testHttpOptions, 'function', 'HTTP放行只能是显式测试配置，不能改变普通Player默认策略');
  const root = project(t);
  assert.deepEqual(value.testHttpOptions(root), {testOnlyHTTP: false, expectedPolicy: 'NotAllowed', nativeArgs: ['-lguiTestHTTP', 'false']});
  for (const invalid of ['true', 'false', 1, null]) assert.throws(() => value.testHttpOptions(root, invalid), /LGUI-RT-001.*boolean/);
  assert.throws(() => value.testHttpOptions(root, true), /LGUI-RT-001.*LGUIConformanceBridge/);
  fs.writeFileSync(path.join(root, 'Assets/LGUIConformanceBridge.cs'), '// real conformance bridge fixture');
  assert.throws(() => value.testHttpOptions(root, true), /LGUI-RT-001.*LGUIPlayerAcceptance/);
  fs.writeFileSync(path.join(root, 'Assets/LGUIPlayerAcceptance.cs'), '// real acceptance bridge fixture');
  assert.deepEqual(value.testHttpOptions(root, true), {testOnlyHTTP: true, expectedPolicy: 'AlwaysAllowed', nativeArgs: ['-lguiTestHTTP', 'true']});
  fs.writeFileSync(path.join(root, 'Assets/LGUIPlayerAcceptance.cs'), '');
  assert.throws(() => value.testHttpOptions(root, true), /LGUI-RT-001.*LGUIPlayerAcceptance/);
});

test('每个Unity阶段报告的实际HTTP策略必须与显式测试开关一致', async () => {
  const value = await builder();
  assert.equal(typeof value.validateTestHttpReport, 'function');
  assert.doesNotThrow(() => value.validateTestHttpReport({testOnlyHTTP: false, insecureHttpOption: 'NotAllowed'}, false));
  assert.doesNotThrow(() => value.validateTestHttpReport({testOnlyHTTP: true, insecureHttpOption: 'AlwaysAllowed'}, true));
  assert.throws(() => value.validateTestHttpReport({testOnlyHTTP: false, insecureHttpOption: 'AlwaysAllowed'}, false), /LGUI-RT-001.*HTTP/);
  assert.throws(() => value.validateTestHttpReport({testOnlyHTTP: false, insecureHttpOption: 'NotAllowed'}, true), /LGUI-RT-001.*HTTP/);
});

test('CLI仅接受--allow-test-http true，其他值在启动Unity前带码拒绝', () => {
  const entry = fileURLToPath(new URL('../../unity/player-build.mjs', import.meta.url));
  for (const invalid of ['false', '1', 'yes']) {
    const output = spawnSync(process.execPath, [entry, 'build', '--allow-test-http', invalid], {encoding: 'utf8', windowsHide: true});
    assert.notEqual(output.status, 0);
    assert.match(output.stderr, /LGUI-RT-001.*--allow-test-http.*true/);
  }
});
