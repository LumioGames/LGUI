# Topic：MCP server 与启动游戏（M2/M3 解法图）

终态（用户 2026-11-07 明确）：**给 Cocos Creator 通过 MCP 来接入/管理/开发 LGUI 界面，并且启动游戏，替代 FGUI**。M1 的 Cocos 后端是这一切的地基（界面要能在 Cocos 里跑起来）。

## 工具面草案（M2）

定位：`lgui-cocos-mcp/mcp` 下的 MCP server，包装 lgui CLI 能力 + Cocos 工程同步，宿主形态按 Q5 定。工具分组对应四个动词：

| 动词 | 工具草案 | 底层 |
|---|---|---|
| 接入 | 工程 init（在 CC 工程里建 `.lgui/`、boot 组件、配置 backend:'cocos'）；包同步（`ui/` → generate → Cocos assets） | 新 CLI 能力或 MCP 内实现，按 Q5 |
| 管理/开发 | new view/module（--pattern）、改控件属性（参考 h5 编辑器 `editor props` 的中转思路）、i18n extract、art split/cut、`ui list` | lgui 现有命令 |
| 验证 | check、test（headless）、verify 截图；Cocos 实机截图（Web 目标先走浏览器预览） | lgui 命令 + 新增 |
| 启动 | M3：拉起 Cocos Creator、进入 Play、回传日志/截图 | 按 Q4 |

「替代 FGUI」的落点：整个流程不经过 FGUI 编辑器——界面源是 LGUI 的 `ui/`（FairyGUI 格式 XML），开发、检查、验证全部命令化/MCP 化。FGUI 格式兼容性由 OpenFairyGUI 生成链保证。

## 启动游戏（M3）

- Cocos Creator 有 CLI（打开工程、构建），Play 模式与运行时状态控制大概率需要自研 Creator 扩展（extension）暴露 HTTP/WS 接口。
- 参考：build-editor 的 agent-session/project-reload 补丁思路（实时会话中转、每次打开强制重读）；fairygui-cocos fork 的实时会话经验。
- 先决条件：M1 testbed 稳定；Q4 的调研结论。

## 顺序依赖

M2 的「验证」依赖 M1 的后端在 Cocos 里渲染成功；M3 依赖 Q4。M2 与 T009（CLI 面）可以一起设计，避免 MCP 与 CLI 两套口令漂移。
