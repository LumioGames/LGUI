# LGUI

面向 Agent 创作的开源 UI 开发插件：浏览器优先，通过 FairyGUI 与共享 TypeScript 业务迁移到 Unity/PuerTS。[English overview](README.en.md)

安装后先初始化空工程与配置，再编辑、保存、发布与验证。网页构建、服务、测试和 Unity 步骤由工作区项目清单选择；背包是显式选择的参考示例。

## 安装与第一次使用

本轮目标：Codex CLI **0.160.0**、Claude Code **2.1.283**，Node **24.18.0**。命令实测范围见 [验证证据](docs/evidence.md)。

```sh
# Codex
codex plugin marketplace add LumioGames/LGUI --ref main
codex plugin add lgui@lumio-lgui

# Claude Code
claude plugin marketplace add LumioGames/LGUI
claude plugin install lgui@lumio-lgui
```

新开会话，调用 Codex 的 `$lgui-setup` 或 Claude 的 `/lgui:lgui-setup`：

> 在 D:/UI/MyGame 初始化空 UI 工程，恢复网页依赖并启动预览。

没有目标目录时先询问。插件缓存、用户工程与临时验证目录分开。空工程默认网页为 http://127.0.0.1:4182/；需要背包时使用 `init --template inventory`，入口为 `/fidelity/`。端口可配置。编辑器默认 http://127.0.0.1:5199/?agent=1 。[工程入口与 0.1.0 迁移](docs/projects.md) · [安装、更新和卸载](docs/install.md)。

## 工作流

需求与参考 → 初始化 → 工程编辑 → 预检提交 → 保存读回 → 导出发布 → 网页验证 → 原生验证 → 版本发布。

| 技能 | 使用目标 |
|---|---|
| lgui-setup | 安装后的配置与目录初始化、诊断、固定依赖恢复 |
| lgui-author | 参考拆层、素材来源、组件实例/XML、九宫格、动效与响应式实现 |
| lgui-edit | 与人共用编辑会话、query/preflight/transact/undo/save/export |
| lgui-verify | 独立浏览器交互、持久化、布局与截图验证 |
| lgui-unity | Unity/PuerTS 资源准备、原生验证与 Windows IL2CPP 构建 |

[工作流与命令](docs/workflow.md) · [架构与目录](docs/architecture.md) · [兼容矩阵](docs/compatibility.md) · [故障排查](docs/troubleshooting.md)

团队提供的 UI 设计 skill 已去重整合到 lgui-author，保留五份按需分册；[来源与整合说明](docs/imported-ui-skill.md)列出新增经验和适用边界。

## 当前能力与限制

共享业务保持纯 TS，布局数据可跨端使用；字体、资源加载、事件、存储与生命周期由平台适配处理。Agent 与人共享同一会话、队列、revision、精确重试和撤销历史。保存写浏览器工作区，显式 ZIP 导出后再发布；localhost relay 是 HTTP CLI，未伪装成 MCP。

网页 fidelity 仍使用 FairyGUI-dom 手工组件组装；Unity 使用正式发布包和原生 FairyGUI-unity/PuerTS，不是 WebView 或 WebGL。展示投影尚未全部去重，两端存储不在线同步。背包的 24 格、固定 ID 和设计画布只属于示例。参考美术提取脚本不等于任意图片自动分层器。

Unity 目标为 **6000.6.6f1 + PuerTS Core/V8 3.0.3**，Windows Player 需要 IL2CPP/C++ 工具链和本机许可证。准备、构建与运行步骤见 [原生流程](skills/lgui-unity/references/native.md)。

0.2.0 默认空工程提供可运行的最小 FairyGUI 网页与正式源组件。Unity 工程、资源适配与功能验收由项目声明；未配置的步骤明确报错，不回退背包。通用执行器支持配置 Unity 工程与 C# prepare/generate/build 方法，也支持官方 Unity CLI。它不自动设计任意 UI 或生成完整原生应用。

[官方 Unity CLI 调研与构建路径](docs/unity-cli.md)列出可用于打包、诊断、测试和 Agent 发现的能力，以及本轮实际验证范围。

用户历史验收通过；历史说明高度补丁当时只有构建结果。本轮补做 Windows Player 运行：52 条业务/生命周期与 16 条文本边界检查通过，并查看可见窗口截图。历史失败、隐藏窗口黑图、客户端测试范围和未测项均见 [证据](docs/evidence.md)；本轮不新增用户验收结论。

## 维护与许可

[贡献](CONTRIBUTING.md) · [可重复打包与 CI](docs/release.md) · [发布边界](PUBLICATION.md)

原创工作采用 [MIT](LICENSE)，Copyright © 2026 LumioGames。保留 [第三方通知与素材来源](THIRD_PARTY_NOTICES.md)。不分发 Unity、系统字体、许可证或上游编辑器构建。公开 GitHub 仓库、可安装插件包、官方插件目录收录是三种不同状态；本次不自动申请官方目录上架。
