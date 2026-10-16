# 官方 Unity CLI 的可用路径

核查于 2026-10-16。这里指 Unity 官方 `unity` CLI，区别于 Unity Editor 的 `Unity.exe`、Hub CLI 和第三方 UniCli。它仍是实验产品。本轮从官方安装脚本所用 CDN 取得 **1.0.0-beta.13 / Windows x64**，校验发布清单 SHA256 后放在独立验证目录，以绝对路径运行；没有修改全局 PATH、登录状态或项目依赖。二进制不随 LGUI 分发。

来源：[使用与安装](https://docs.unity.com/en-us/unity-cli/use-unity-cli)、[命令参考](https://docs.unity.com/en-us/unity-cli/unity-cli-reference)、[官方构建技能参考](https://github.com/Unity-Technologies/skills/blob/main/skills/unity-cli/references/build-run-test.md)、[版本记录](https://docs.unity.com/en-us/unity-cli/release-notes)。参数以已安装版本的 `--help` 为准。

| 能力 | LGUI 的用法与本轮范围 |
|---|---|
| `version`、`commands --grep` | 已实际读取版本与机器可读命令清单；可用于 Agent 能力发现 |
| `build --list-targets` | 已运行；列出合法目标，不表示本机已安装全部平台模块 |
| `build --execute-method` | 复用现有 `FidelityMigrationBuild.BuildWindows`，保持正式发布包、IL2CPP Release 与 PuerTS 补丁；构建结果见[证据](evidence.md) |
| `run -- -executeMethod` | 可调用现有 Prepare / GeneratePuerTS；本轮这两个步骤使用原启动器验证，未重复用官方 CLI 验证 |
| `test` | 官方支持 Edit Mode / Play Mode 与 NUnit 报告；LGUI 当前原生验收走已有文件协议，尚未迁移到 Test Runner |
| `doctor`、`cache key`、模块管理 | 可诊断环境、生成 Library 缓存键、安装指定 Editor/模块；本轮只调研，未改动本机安装 |
| `status`、`list`、`command`、`recompile` | 需 Unity Pipeline 项目包和运行中的 Editor；适合将来场景与资源操作，本轮未安装 Pipeline、未实测 |

## 在已初始化工作区构建

先按[原生流程](../skills/lgui-unity/references/native.md)完成依赖恢复、资源准备、Prepare 和 GeneratePuerTS。设置 `$UnityCli` 为实际官方 CLI 路径，`$env:UNITY_EDITOR` 为实际 Unity Editor 可执行文件路径：两者不能混用。以下构建调用已用于本轮 Windows 验证：

```powershell
$Project = Join-Path $Workspace 'unity-migration/InventoryUnity'
$Log = Join-Path $Workspace 'unity-cli-build.log'
& $UnityCli version --format json
& $UnityCli build $Project --list-targets --format json
& $UnityCli build $Project --target StandaloneWindows64 --execute-method FidelityMigrationBuild.BuildWindows --editor-path $env:UNITY_EDITOR --log-file $Log --no-tail --non-interactive --format json
if ($LASTEXITCODE -ne 0) { throw 'Unity CLI build failed; inspect log' }
```

这个 C# 方法自己确定输出为工作区的 `unity-migration/build/fidelity-windows-il2cpp/FidelityInventory.exe`，不读取 CLI 的 `--output-path`。不要增加一个看似有效却被方法忽略的输出参数。JSON 模式可能伴随进度帧，自动化不能假设全部 stdout/stderr 合起来是单个 JSON 文档。构建完成还要运行 Player 验收并检查截图。

## 接入决定

当前提供官方 CLI 的可选构建路径；默认 `lgui unity` 仍复用已经覆盖 prepare/generate/build/editor/player 的启动器。这样不把实验 CLI 变成网页用户的必装依赖。新工程可进一步采用 Unity 6 Build Profiles；本例的 C# 构建入口保留 IL2CPP/PuerTS 专属准备。

未来若采用 Pipeline，应先在独立工程固定包版本，测试工具发现、场景保存与运行，再决定是否接入。它操作 Unity 场景，不能替代 FairyGUI 编辑器的同一会话、revision、requestId 与撤销队列。当前无需新增 MCP；仅当确实需要 MCP 客户端时再验证官方 `unity mcp` 的真实发现与调用。
