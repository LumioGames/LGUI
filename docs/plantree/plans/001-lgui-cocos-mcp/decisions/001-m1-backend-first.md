# 001：M1 先做 Cocos 后端，MCP server 后置

日期：2026-11-07 · 状态：已定

用户在四个选项里选定「后端先行，MCP 后置」：目录先承载 Cocos 后端适配开发（CC 3.8 测试工程 + backends/cocos + conformance），MCP server 作为后续里程碑立项但不先动工。

同日用户给出终态目标：MCP 驱动 Cocos Creator 接入/管理/开发 LGUI 界面并启动游戏、替代 FGUI。两者不矛盾：后端是一切的地基（界面要能跑起来，MCP 的验证/启动才有意义），本决策只定开发顺序，不改变终态。

后果：M1 验收看 conformance 四方快照与 testbed 跑通，不看 MCP；MCP 工具面先写成 topics/mcp-server.md 的草案，等 M1 落地再细化。
