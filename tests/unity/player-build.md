# Windows Release IL2CPP 构建

这是仓库开发用工具。`lgui unity export` 仍只导出文件，不启动 Unity。

先在 Windows 上明确提供已安装的 Unity 6000.6.6f1、官方 PuerTS Core/V8 3.0.3 本地包；不下载软件。准备普通背包工程：

```text
node tests/unity/player-build.mjs prepare --project <新的工程绝对路径> --puerts-core <Core绝对路径> --puerts-v8 <V8绝对路径> --evidence <新的准备证据目录绝对路径>
```

工具先同步示例框架，再从当前分支的真实 `examples/inventory` 调用导出命令，恢复示例工程配置。`src/` 和 `ui/` 不改动。普通预览工程只有导出的游戏和构建 Editor 脚本，没有一致性测试输入桥，也不替换游戏 JS。

已有导出工程可以先检查，再构建：

```text
node tests/unity/player-build.mjs inspect --project <工程绝对路径>
node tests/unity/player-build.mjs build --editor <Unity.exe绝对路径> --project <工程绝对路径> --evidence <新的构建证据目录绝对路径> --output <新的输出目录绝对路径/Inventory.exe>
```

普通构建在 Configure 中明确把 `PlayerSettings.insecureHttpOption` 设为 `NotAllowed`，后续阶段逐次核对。专用网络测试工程可显式加 `--allow-test-http true`，或调用 `buildPlayer({allowTestHTTP: true, ...})`；只有 `Assets/LGUIConformanceBridge.cs` 和 `Assets/LGUIPlayerAcceptance.cs` 两份真实、非空、非链接文件都存在才允许。CLI 不接受 false、1、yes 等其他值；普通构建省略开关。

这个测试开关使专用测试构建明确使用 `AlwaysAllowed`，用于本机 HTTP fixture 的正向验证。三个阶段均收到显式 `-lguiTestHTTP true`，每阶段重新核对测试桥与实际策略；普通构建明确传 false。`testOnlyHTTP`、`insecureHttpOption` 及其原始枚举数字记录在各阶段和最终报告顶层，不加入包体对照的 `config` 键。最终普通 Player 保持 `NotAllowed`；负向启动异常测试也用未放开的专用构建。

构建分三个独立 Editor 进程，给生成的 C# 元数据和原生文件留出正常导入、编译的边界：

1. `LGUI.Tests.LGUIPlayerBuild.Configure`：Windows x64、IL2CPP、Release、Low stripping、.NET Standard、非 Development；默认 1280×720、Windowed、可拖动改变大小。启动场景必须只有一个 `LGUIBoot`，普通预览的 `debugPort` 必须为 -1。
2. `Generate`：核对 PuerTS 模板的固定原始字节 SHA256，再运行官方 `GenV2WithoutWrapper()`，即菜单中的 Reflection Mode。它生成原生桥、扩展方法元数据和 linker 文件；没有生成类型静态 wrapper。原生通用查找表的文件名包含 `Wrapper.cpp`，不能仅凭文件名认定生成了类型绑定。工具拒绝 `*_Wrap.cs`、`RegisterInfo_Gen.cs`、`PuertsIl2cppWrapperDefN.cpp` 这些残留。
3. `Build`：再次检查设置、四处补丁进入生成后的 C++、默认 `Assets/Gen/Plugins/puerts_il2cpp/` 原生输出和 `Assets/LGUI/link.xml` 的四个保留程序集，再以 `BuildOptions.None` 调用 `BuildPipeline.BuildPlayer`。

`configure.json`、`generate.json`、`build.json` 记录配置、输入 SHA256、原生桥文件、C# 源文件、Unity 消息、构建步骤和 `BuildReport` 的总量、输出文件、packed assets。输入摘要记录的是交给 Unity 的源文件，不代表每个源码文件都在最终机器码里占有独立区间。捕获到 Error、Exception 或 Assert 会使阶段失败；Warning 原文保留。

`acceptance.json` 记录真实输出目录内各文件大小与摘要，并确认构建没有改变导出的场景、脚本、补丁、linker、UI 包、图集或翻译。`compiledBridge` 核对生成桥和 Unity 实际 IL2CPP 编译副本的摘要，再从 Bee 构建图记录 Windows x64 编译命令与已存在的 object 输出。失败时保留完整各阶段原生日志和已有 JSON。

输出必须使用独立空目录。`allOutputBytes` 包含全部文件；`distributionBytes` 排除 Unity 明确命名为 `_BackUpThisFolder_ButDontShipItWithYourGame`、`_BurstDebugInformation_DoNotShip` 的构建支持目录；`buildSupportBytes` 单列这些目录。`v8Files`、`v8Bytes` 单列实际 Player 的 `PapiV8.dll`。源码 Unity package 的大小需另记，不能代替这些 Player 数字。

`BuildOptions.None` 可能不给出逐项 packed asset 细节；报告如实保留可得到的内容。序列化资产的 `packedSize`、源码目录大小和 `GameAssembly.dll` 中 C# 代码的贡献是不同数字，不能互相代替。PuerTS V8 DLL 可单独量文件；运行时包的代码增量需要另做明确对照构建。

打包成功只证明构建通过。实际 Player 的游戏操作、横竖屏像素、一致性快照、200 次开关和真实 V8 堆仍需独立验收。普通预览可从命令行分别指定 `-screen-width 1280 -screen-height 720`、`-screen-width 450 -screen-height 800`；实际分辨率和画面由后续运行证据确认。

## 开发验收的最短入口

测试工程与普通工程分开。以下命令都要求新证据目录；`prepare` 的工程目录也必须是新的。PuerTS 输入仍为前述官方本地包。

```text
node tests/unity/player-runner.mjs prepare --project <测试工程> --package <仓库/plugin/framework/backends/unity/package> --puerts-core <Core> --puerts-v8 <V8> --evidence <准备证据>
node tests/unity/player-build.mjs build --editor <Unity.exe> --project <测试工程> --evidence <构建证据> --output <新目录/Conformance.exe>
node tests/unity/player-runner.mjs suite --context <准备证据/context.json> --player <Conformance.exe> --evidence <一致性证据>
```

`suite` 在真实 Release IL2CPP Player 中逐一运行现有五个共享用例，与 headless、H5 的完整快照分别严格比较。背包业务和内存使用独立测试工程：

```text
node tests/unity/player-runner.mjs prepare-inventory --project <背包测试工程> --package <Unity包> --puerts-core <Core> --puerts-v8 <V8> --evidence <背包准备证据>
node tests/unity/player-build.mjs build --editor <Unity.exe> --project <背包测试工程> --evidence <构建证据> --output <新目录/InventoryValidation.exe>
node tests/unity/player-runner.mjs run --player <InventoryValidation.exe> --case inventory --result <新结果.json> --log <新Player.log> --graphical true
node tests/unity/acceptance/memory-host.mjs --player <InventoryValidation.exe> --evidence <内存证据> --port <明确端口> --scenario memory-settled --alternating-gc true --paused-heap true --graphical true
```

`memory-settled` 在同一个应用、原始 VM 中先运行完整 200 次暖机，再运行完整 200 次正式循环；两组各自原有的一次暖机也保留，合计 402 次。每次改变美术字内容后关闭背包。全部逻辑释放结果、12 个原始采样点、固定两轮 V8/托管回收与最后 V8 回收阶段均保存，不按数字选择回收次数。`--paused-heap true` 在每点末尾追加原 VM 的 `debugger` 暂停采样，记录 GC 和堆读取的帧号，并在 finally 中恢复调试器；不会替换原始曲线或自动作出内存通过结论。Inspector 仅由这个明确端口的测试运行启用，普通预览仍为 -1。

需要调查引用保留链时，再显式追加 `--heap-snapshots true`；它要求上述 settled 与 paused 模式，只在正式第 0、200 次的同一暂停点保存原始 `.heapsnapshot` 和采集报告。必须同时收到完整快照块和命令成功回执，文件还要通过节点/边结构校验；采集失败也会恢复调试器并保留错误及已有文件。堆图是额外诊断，不能用空白文件、两次文件大小差或人为容差代替泄漏判断。

绑定占位图的真实像素检查必须使用图形 Player。上面的 `prepare-inventory` 命令默认不安装截图握手；像素专用工程应通过准备 API 明确启用它，随后再构建：

```javascript
import {createInventoryContext} from './tests/unity/acceptance/context.mjs';
import {prepareValidationPlayer} from './tests/unity/player-runner.mjs';
await prepareValidationPlayer({
  context: await createInventoryContext({coverageCapture: true}),
  caseNames: ['inventory', 'coverage', 'memory', 'memory-settled', 'format'],
  project: '<新的测试工程绝对路径>', unityPackage: '<Unity包绝对路径>',
  puertsCore: '<Core绝对路径>', puertsV8: '<V8绝对路径>', evidence: '<新准备证据绝对路径>'
});
```

`coverage-host.mjs` 明确以图形模式启动并显示窗口，截图记录 acquisition 与像素判定两层证据；不能把 batch 模式返回的纯黑 PNG 算作成功。测试工程显式允许 HTTP 后，可选择有实际服务器可达证据的 fixture 主机名：

```text
node tests/unity/player-build.mjs build --editor <Unity.exe> --project <背包测试工程> --evidence <HTTP测试构建证据> --output <新目录/InventoryValidation.exe> --allow-test-http true
node tests/unity/acceptance/coverage-host.mjs player --player <InventoryValidation.exe> --evidence <像素证据> --port <明确端口> --fixture-host localhost
```

网络同步启动异常与重入关闭的隔离负向流程见 [network-startup/README.md](network-startup/README.md)。这些预期的带码 Error 与普通正向零错误验收分开保存。包体对照流程见 [baseline/README.md](baseline/README.md)；A/B/C 与真实普通背包 D 必须使用完全相同的实际构建配置，保留原始差值及独立 V8 DLL、packed assets 数字。
