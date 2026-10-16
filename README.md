# LGUI

面向 Agent 创作的开源 UI 开发插件：浏览器优先，通过 FairyGUI 与共享 TypeScript 业务迁移到 Unity/PuerTS。[English overview](README.en.md)

安装后先初始化配置和工程目录，再编辑、保存、发布与验证。背包是可运行的参考示例；通用能力是工作区初始化、固定依赖恢复、共用编辑会话和快照发布，后续 UI 可复用这些工作流。

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

> 在 D:/UI/MyGame 初始化 LGUI 配置和目录，恢复网页依赖并启动示例。

没有目标目录时先询问。插件缓存、用户工程与临时验证目录分开；不在缓存里安装依赖或保存工程。完整手工命令、发布包安装、更新和卸载见 [安装指南](docs/install.md)。网页示例运行于 http://127.0.0.1:4182/fidelity/ ，编辑器运行于 http://127.0.0.1:5199/?agent=1 。

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

[官方 Unity CLI 调研与构建路径](docs/unity-cli.md)列出可用于打包、诊断、测试和 Agent 发现的能力，以及本轮实际验证范围。

用户历史验收通过；历史说明高度补丁当时只有构建结果。本轮补做 Windows Player 运行：52 条业务/生命周期与 16 条文本边界检查通过，并查看可见窗口截图。历史失败、隐藏窗口黑图、客户端测试范围和未测项均见 [证据](docs/evidence.md)；本轮不新增用户验收结论。

## 维护与许可

[贡献](CONTRIBUTING.md) · [可重复打包与 CI](docs/release.md) · [发布边界](PUBLICATION.md)

原创工作采用 [MIT](LICENSE)，Copyright © 2026 LumioGames。保留 [第三方通知与素材来源](THIRD_PARTY_NOTICES.md)。不分发 Unity、系统字体、许可证或上游编辑器构建。公开 GitHub 仓库、可安装插件包、官方插件目录收录是三种不同状态；本次不自动申请官方目录上架。
