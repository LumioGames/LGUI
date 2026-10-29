import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = fileURLToPath(new URL('../../..', import.meta.url));
const packageRoot = path.join(repo, 'plugin/framework/backends/unity/package');

test('Unity 包能作为 embedded package 安装：版本、PuerTS 依赖和程序集引用齐全', () => {
  const manifestFile = path.join(packageRoot, 'package.json');
  assert.ok(fs.existsSync(manifestFile), '导出需要真实的 Unity package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const plugin = JSON.parse(fs.readFileSync(path.join(repo, 'plugin/plugin.json'), 'utf8'));
  assert.equal(manifest.name, 'com.lumiogames.lgui');
  assert.equal(manifest.version, plugin.version);
  assert.equal(manifest.unity, '6000.6');
  assert.equal(manifest.dependencies['com.tencent.puerts.core'], '3.0.3');
  const assembly = JSON.parse(fs.readFileSync(path.join(packageRoot, 'Runtime/LGUI.Runtime.asmdef'), 'utf8'));
  assert.equal(assembly.name, 'LGUI.Runtime');
  assert.ok(assembly.references.includes('FairyGUI'));
  assert.ok(assembly.references.includes('com.tencent.puerts.core'));
  assert.deepEqual(assembly.includePlatforms, [], '运行时必须同时支持 Editor 和 Player');
  assert.ok(fs.existsSync(path.join(packageRoot, 'Runtime/LGUIBoot.cs')));
  assert.ok(fs.existsSync(path.join(packageRoot, 'Runtime/Platform/Platform.cs')));
});

test('Unity 包保留 FairyGUI 原始许可，并提供复制到 Assets 的动态反射保留模板', () => {
  const license = path.join(packageRoot, 'FairyGUI/LICENSE');
  assert.ok(fs.existsSync(license), 'FairyGUI 原始 LICENSE 必须随包分发');
  assert.match(fs.readFileSync(license, 'utf8'), /Copyright \(c\) 2015 fairygui\.com/);
  assert.ok(fs.existsSync(path.join(packageRoot, 'FairyGUI/UI/UIPackage.cs')));
  const linkerFile = path.join(packageRoot, 'Runtime/link.xml');
  assert.ok(fs.existsSync(linkerFile), '导出器需要把反射保留模板复制到 Assets/LGUI/link.xml');
  const linker = fs.readFileSync(linkerFile, 'utf8');
  assert.match(linker, /assembly fullname="FairyGUI" preserve="all"/);
  assert.match(linker, /assembly fullname="LGUI.Runtime" preserve="all"/);
  assert.match(linker, /assembly fullname="com.tencent.puerts.core" preserve="all"/);
  assert.match(linker, /assembly fullname="com.tencent.puerts.v8" preserve="all"/, 'JsEnv 通过名字反射创建 V8 backend，不能裁剪它');
});
