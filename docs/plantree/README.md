# Plan Tree

LGUI 仓库的规划入口。职责分工：

| 权威 | 管什么 |
|---|---|
| [llmdoc/](../../llmdoc/) | 架构知识（检索用 `npx -y @tokenroll/llmdoc search/tree/context`） |
| [CONTRIBUTING.md](../../CONTRIBUTING.md)、[AGENTS.md](../../AGENTS.md) | 贡献流程与仓库约定 |
| 本目录 | 规划状态：路线、决策、未决问题、落地证据 |

## Baseline

架构与模块事实不在这里复制，见 [baseline/README.md](baseline/README.md)。

## 活跃计划

| ID | Plan | Affected Modules | Status | Current Phase | Last Landed | Next Target |
|---|---|---|---|---|---|---|
| [P001](plans/001-lgui-cocos-mcp/README.md) | lgui-cocos-mcp：Cocos Creator 接入 LGUI（MCP 驱动，替代 FGUI 工作流） | lgui-cocos-mcp, plugin/framework, plugin/tools | In Progress | M1 Cocos 后端基座（T005 适配层骨架 + T006 生成分支已落地，未在引擎里跑过） | 2026-11-07 [T006 证据](plans/001-lgui-cocos-mcp/evidence/2026-11-07-t006-generate-cocos.md) | T007 testbed（含运行时校准清单） |

## 其他

- 想法池：[ideas/inbox.md](ideas/inbox.md)
- 历史/归档：暂无
