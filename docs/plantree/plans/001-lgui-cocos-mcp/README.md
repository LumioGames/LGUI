# P001 · lgui-cocos-mcp

## 目标（北极星）

**给 Cocos Creator 通过 MCP 来接入/管理/开发 LGUI 界面，并且启动游戏，替代 FGUI 工作流。**

具体说：Cocos Creator 游戏项目里，界面用 LGUI 做（`ui/` FairyGUI 格式源 + lgui 运行时框架 + MVC/UI 管理），Agent 通过 MCP server 完成建界面、改属性、同步包、验证截图、启动 Cocos Creator 跑游戏的全流程；FGUI 编辑器与「FGUI 编辑器 → Cocos 运行时」的旧链路被替代。界面源仍是 FairyGUI 格式 XML（LGUI 的 `ui/` 格式），「替代 FGUI」替代的是编辑器工作流与运行时接入方式，不是文件格式。

## 范围与影响面

- Affected Modules（键见 [baseline/module-map.md](../../baseline/module-map.md)）：`lgui-cocos-mcp`、`plugin/framework/backends/cocos`（新增）、`plugin/tools`（generate 分支、后续 MCP）。
- 不做（非目标）：修改 LGUI 现有 h5/unity 后端行为；界面格式变更；Unity 管线改动。

## 里程碑

| 阶段 | 内容 | 状态 |
|---|---|---|
| M1 | Cocos 后端基座：backends/cocos 适配层 + generate/cocos 产物 + testbed 跑通五层栈 + conformance 四方快照 | **In Progress**（工作区已落地） |
| M2 | MCP server（`lgui-cocos-mcp/mcp`）：接入（工程初始化/包同步）、管理/开发（建界面/改属性/i18n）、验证（check/test/verify→Cocos 截图） | 规划 |
| M3 | 启动游戏：MCP 启动/控制 Cocos Creator（打开工程、Play、日志与截图回传），闭环「Agent 改 UI → 实机看效果」 | 规划 |

Deferred：原生目标（native shell）、XML 直载链评估、其他引擎。

## 文件地图

- [roadmap.md](roadmap.md) — 任务状态与顺序（唯一任务状态权威）
- [topics/cocos-backend.md](topics/cocos-backend.md) — M1 解法图：契约映射、缺口、工作量
- [topics/mcp-server.md](topics/mcp-server.md) — M2/M3 解法图：工具面草案、启动游戏的自动化面
- [decisions/](decisions/) — 已定决策
- [open-questions.md](open-questions.md) — 未决问题（Q1–Q5）

## 阅读路径

新会话先读本 README → roadmap → 当前阶段的 topic → open-questions。架构事实用 llmdoc 检索，不在此复制。
