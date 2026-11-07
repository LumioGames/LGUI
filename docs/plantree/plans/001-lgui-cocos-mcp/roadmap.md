# P001 Roadmap

任务状态唯一权威。T 编号 Plan 内自增。

## Done

- T001 可行性评估：fairygui-cocos fork 调查 + LGUI Backend/Platform 契约对照，结论「可以，比接 Unity 起点更好」（2026-11-07，报告要点在 topics/cocos-backend.md）
- T002 用户目标澄清与 M1 范围决策（见 decisions/001、002）
- T003 工作区落地：`lgui-cocos-mcp/` 骨架 + 本 plan-tree 立项

## In Progress

（空——T004 待开工）

## Next

- T004 fork rebase：`aloasut/fairygui-cocos` 基点 `cd19b70` 落后官方 `ccc3.0` 149 commits，先 rebase 再动手（依赖 Q1 未决也可并行）
- T005 backends/cocos 骨架：index（照 h5 `index.ts` 88 行形态）+ objects 包装 + platform 九服务
- T006 generate/cocos 分支：复用 unity 二进制产物格式，产物布局按 Q2 定
- T007 testbed：CC 3.8.2 工程就位（来源按 Q1），跑通 GRoot 挂载 + 五层栈 + 横竖屏换版
- T008 conformance 四方快照：headless/h5/unity/cocos（桥的实现按 Q3）

## Deferred

- T009 `lgui cocos export` 命令与工程模板（M2 一起考虑 CLI 面）
- T010 MCP server（M2，工具面草案在 topics/mcp-server.md）
- T011 启动/控制 Cocos Creator（M3，自动化面按 Q4）
- T012 原生目标（native shell：剪贴板/IME/返回键另有坑）
- T013 XML 直载链评估（见 ideas/inbox.md）
