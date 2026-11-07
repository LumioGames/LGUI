# P001 未决问题

| # | 问题 | 影响 | 状态 |
|---|---|---|---|
| Q1 | testbed 的 CC 3.8.2 工程从哪来：新建最小工程，还是移植 fork 的 sdk/demo（16 包回归场）再裁剪？ | T005–T007 开工方式 | 未决 |
| Q2 | Cocos 侧包加载约定：resources 直载还是 AssetManager bundle？影响 generate/cocos 产物布局、`.lgui/project.json` 字段、M2 的包同步命令 | T006、M2 接入工具 | 未决 |
| Q3 | conformance 四方快照的 Cocos 桥怎么做：Web 目标下能否复用浏览器桥（tests/helpers/browser.mjs）的思路？ | T008 | 未决 |
| Q4 | 启动/控制 Cocos Creator 的自动化面：Creator CLI 能做到哪一步，Play 控制/日志/截图是否需要自研 extension？ | T011、M3 范围 | 未决（可先调研） |
| Q5 | MCP server 宿主形态：独立 npm 包还是挂在 plugin/tools；与 lgui CLI 的关系是包装还是新增命令。M2 与 T009 要一起设计，避免 MCP 与 CLI 两套口令漂移 | M2 架构 | 未决（M1 期间可缓） |
