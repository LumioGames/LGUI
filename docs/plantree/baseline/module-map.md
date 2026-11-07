# 模块键

稳定键只登记名字与一句话职责；详细架构事实路由到 llmdoc，不复制。

| 键 | 职责 | 架构知识 |
|---|---|---|
| `plugin/framework` | 随插件下发的运行时框架（core/mvc/backends） | llmdoc `runtime/framework.mdx` |
| `plugin/framework/backends/cocos`（规划中） | Cocos Creator 后端适配层，P001 的产出之一 | llmdoc `runtime/framework.mdx`（Backend/Platform 契约） |
| `plugin/tools` | lgui 命令行（dev/check/test/verify/unity export…） | llmdoc `cli/commands.mdx` |
| `plugin/tools/lib/generate` | 界面单源 → 各后端产物 | llmdoc `runtime/framework.mdx` |
| `lgui-cocos-mcp` | Cocos 开发工作区（testbed + 未来 MCP server），纯开发面，不下发 | P001 |
| `tests` | unit/e2e/conformance/check/unity 五层测试 | llmdoc `testing/layers.mdx` |
| `release` | 发布完整性（清单/校验/CI） | llmdoc `release/integrity.mdx` |
