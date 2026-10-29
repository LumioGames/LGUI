# LGUI

> **开发中，0.3.0 还没发布。** 下面的安装步骤和命令要等 0.3.0 发布后才能用；0.2.0 的旧版本在 tag `v0.2.0-final`。

## 给 AI Agent：安装与第一次使用

用户把这个仓库地址发给你时，按下面的步骤做。任何一步失败，都停下来，把错误原文告诉用户，不要跳过。

1. 检查 Node：运行 `node -v`，要求 24 或更高。缺了就请用户自己安装，不要替用户装。
2. 安装插件，按你所在的客户端选一种：
   - Claude Code：
     ```
     claude plugin marketplace add LumioGames/LGUI
     claude plugin install lgui@lumio-lgui
     ```
   - Codex：
     ```
     codex plugin marketplace add LumioGames/LGUI
     codex plugin add lgui@lumio-lgui
     ```
   - 其他客户端：运行 `git clone --depth 1 https://github.com/LumioGames/LGUI`，把其中的 `plugin/` 当作插件目录。技能在 `plugin/skills/`。
3. 命令行工具不依赖技能，装完马上就能用。在当前会话里接着做：
   1. 找到插件目录：Claude Code 在 `~/.claude/plugins/cache/lumio-lgui/lgui/<版本>/`，Codex 在 `~/.codex/plugins/cache/lumio-lgui/lgui/<版本>/`，其他客户端就是克隆下来的 `plugin/`。下面的 `lgui` 都指 `node <插件目录>/tools/lgui.mjs`。
   2. 运行 `lgui doctor` 检查环境，包括电脑上有没有 Chrome 或 Edge。
   3. 问用户工程放在哪个文件夹，然后运行 `lgui init` 建工程。
   4. 运行 `lgui dev` 打开预览，把网址告诉用户。
4. 告诉用户：LGUI 的技能要新开一个会话才会生效。新会话里直接说「用 LGUI 做一个某某界面」就行。
5. 之后做界面、写功能，都按 `plugin/references/` 里的 UI 开发规范和 MVC 开发规范来做。

## 是什么

LGUI 是一个面向 AI Agent 的开源 UI 引擎框架。UI 资源、预制结构和全部界面代码、业务代码都能直接在网页上写完，不依赖任何游戏引擎；以后需要上 Unity 时，用一条命令导出（Unity + PuerTS），代码不用重构。

- 界面只有一个源：用户工程里的 `ui/`（FairyGUI 格式）。网页和 Unity 用的界面文件都由命令生成。
- 游戏代码用 TypeScript，按 MVC 开发规范写，只调用 LGUI 框架的接口。
- 横竖屏是一等公民：切换方向时界面自动换版，游戏代码不写横竖屏代码。
- 装好就能用：用户机器上只需要 Node 24 或更高，以及 Chrome 或 Edge；其余工具都随插件提供。

## 怎么装

见最上面「给 AI Agent」一节。插件只下发仓库里的 `plugin/` 文件夹。

## 技能

| 技能 | 什么时候用 |
|---|---|
| `lgui-setup` | 建工程、检查环境、打开预览 |
| `lgui-ui` | 拼界面：XML、排布模式、出图拆图、动效、编辑器 |
| `lgui-code` | 写功能：Model、View、Controller、Service、测试 |
| `lgui-verify` | 截图、测试、调试快照 |
| `lgui-unity` | 接 Unity（阶段 3 实现） |

## 已知限制

- 0.3.0 还在开发：新的命令行、框架和背包示例正在按新结构重写，旧命令暂时跑不起来。
- 技能要新开一个会话才生效（宿主的限制）；命令行不受影响。
- Unity 支持放在最后做。

## 链接

- [更新记录](CHANGELOG.md)
- [参与开发](CONTRIBUTING.md)
- UI 开发规范：[plugin/references/ui-spec.md](plugin/references/ui-spec.md)
- MVC 开发规范：[plugin/references/mvc-spec.md](plugin/references/mvc-spec.md)
- 用户工程目录：[plugin/references/project-layout.md](plugin/references/project-layout.md)
- 接入 Unity（阶段 3 实现）：[plugin/references/unity.md](plugin/references/unity.md)
- 错误码：[plugin/references/error-codes.md](plugin/references/error-codes.md)
- 第三方许可：[plugin/THIRD_PARTY_NOTICES.md](plugin/THIRD_PARTY_NOTICES.md)

原创部分采用 [MIT](LICENSE) 许可，Copyright © 2026 LumioGames。
