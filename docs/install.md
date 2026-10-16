# 安装、初始化、更新和卸载

核查日期：2026-10-16（America/Los_Angeles）。目标客户端是本机 **Codex CLI 0.160.0**、**Claude Code 2.1.283**。实际结果见 [测试证据](evidence.md)，标准差异见 [兼容矩阵](compatibility.md)。

## Codex

```sh
codex plugin marketplace add LumioGames/LGUI --ref main
codex plugin add lgui@lumio-lgui
codex plugin list
```

0.160.0 的本机 `plugin --help` 提供 add/remove；官方页面仍建议部分本地安装通过桌面插件目录完成，因此不要把新 CLI 命令复制到未核实版本。旧版先检查 `codex plugin --help`；桌面端可以从本地 marketplace 安装后新开聊天。根 manifest 的 OpenAI onboardingSkill 指向 lgui-setup；新聊天也可以明确调用 `$lgui-setup`。桌面 onboarding 自动弹出与 CLI 安装是不同验证项目。

## Claude Code

```sh
claude plugin marketplace add LumioGames/LGUI
claude plugin install lgui@lumio-lgui
claude plugin list
```

新开会话运行 `/lgui:lgui-setup`。开发包临时加载可用 `claude --plugin-dir <解压后的绝对插件目录>`；这不是 marketplace 持久安装。Claude 使用生成的 `.claude-plugin/plugin.json`，不假设它解释标准根 manifest 或 OpenAI 扩展。

## 第一步：初始化配置与目录

对 Agent 说：

> 使用 LGUI，在 D:/UI/MyGame 初始化空工程，恢复网页依赖并启动预览。

没有工作目录时技能应先询问。它会创建 `.lgui/workspace.json`、`.lgui/project.json` 与最小空 UI，再诊断依赖。参考背包需要显式 `--template inventory`。手工操作（PowerShell；替换为真实路径）：

```powershell
$Lgui = 'D:/Plugins/lgui/tools/lgui.mjs'
$Workspace = 'D:/UI/MyGame'
node $Lgui init --workspace $Workspace
node $Lgui doctor --workspace $Workspace
node $Lgui bootstrap --workspace $Workspace --dry-run
node $Lgui bootstrap --workspace $Workspace --install
node $Lgui build-web --workspace $Workspace
node $Lgui serve --workspace $Workspace
```

空工程打开 http://127.0.0.1:4182/，背包 recipe 打开 `/fidelity/`。服务保持前台；Ctrl+C 结束。另一个终端执行 `node $Lgui editor --workspace $Workspace`，打开 http://127.0.0.1:5199/?agent=1 。[工程入口与旧版本迁移](projects.md)说明如何接入自己的网页、Unity 工程与验收；具体编辑、保存与导出见 [工作流](workflow.md)。

端口冲突时在工作区 `.lgui/workspace.json` 修改 `webPort` / `editorPort`（1024–65535），然后重新启动；诊断和验证使用同一配置。临时覆盖可设 `LGUI_WEB_PORT` / `LGUI_EDITOR_PORT`。不要停止其他工程的服务来占用默认端口。

## 从发布包安装

下载维护者生成的 `lgui-<version>.tar.gz` 和 `.sha256`，核对摘要，在单独插件目录解压。包内有两个 marketplace 入口；在包目录外执行：

```sh
codex plugin marketplace add <解压目录绝对路径>
codex plugin add lgui@lumio-lgui
claude plugin marketplace add <解压目录绝对路径>
claude plugin install lgui@lumio-lgui
```

不要将 npm install/bootstrap 在插件缓存内运行。安装缓存路径由宿主管理，CLI 的绝对路径应从加载到的 SKILL.md 反向解析，不硬编码用户名或版本目录。临时解压包、插件安装缓存、用户工程三者分开。公开仓库、可安装包、官方目录收录是不同状态；本项目不自动申请官方目录。

## 更新与卸载

```sh
codex plugin marketplace upgrade lumio-lgui
codex plugin add lgui@lumio-lgui
claude plugin marketplace update lumio-lgui
claude plugin update lgui@lumio-lgui
```

重启/新开会话加载新缓存。用 `doctor` 比较插件与 workspace 版本。0.1.0 工程保留全部文件，按 [迁移说明](projects.md)新增明确的工程清单；不要对已编辑工程强制重跑 init。

```sh
codex plugin remove lgui@lumio-lgui
codex plugin marketplace remove lumio-lgui
claude plugin uninstall lgui@lumio-lgui
claude plugin marketplace remove lumio-lgui
```

卸载宿主插件不删除用户工程；依赖和生成物也由用户在自己的工作区管理。完整清理前自行保存所需存档与导出。
