# 规范与客户端兼容

核查：2026-10-16，目标 Node 24.18.0、Codex CLI 0.160.0、Claude Code 2.1.283。官方文档是持续更新页面，下面是本次核查范围；本机实际结果另见 [证据](evidence.md)。

| 依据 | 本实现采用的规则 |
|---|---|
| [Agent Skills](https://agentskills.io/specification) | SKILL.md 的 name/description、目录同名、渐进读取 references；无宿主工具白名单依赖 |
| [Agent Plugins 1.0.0](https://agent-plugins.org/specification) | 根 plugin.json + skills/；资源的实际路径留在包根；MCP 可缺省 |
| [Codex 打包](https://developers.openai.com/plugins/build/plugins) | com.openai 扩展；生成 fallback manifest 和 .agents marketplace；onboardingSkill 初始化入口 |
| [Claude manifest](https://code.claude.com/docs/en/plugins-reference) | .claude-plugin/plugin.json + 根 skills；生成独立兼容入口，不复用 OpenAI 扩展语义 |

| 能力 | Codex 0.160.0 | Claude Code 2.1.283 |
|---|---|---|
| 根标准 manifest | 官方文档支持；安装结果单独记录 | 不依赖其识别；使用 Claude manifest |
| 技能文件 | 同一 skills/；显式 `$lgui-setup` | 同一 skills/；`/lgui:lgui-setup` |
| 安装后第一步 | OpenAI onboardingSkill 指向 setup；CLI 可手动调用 | 手动运行 setup；不虚构自动 onboarding 字段 |
| 缓存定位 | 从加载的 skill 路径解析；不依赖 cwd | 同样从 skill 路径解析；无需假定 Markdown 自动展开 CLAUDE_PLUGIN_ROOT |
| 编辑器调用 | Node CLI → localhost HTTP relay | 同一 Node CLI；无 MCP/hook 适配 |
| 工作区 | 必须显式给出绝对路径 | 同样 |

根 plugin.json 是身份/版本唯一来源。generate 生成两端 manifest、marketplace 与模板摘要；validate 检查一致性、官方 JSON Schema、skill YAML、路径和文档链接。标准 schema 验证与真实客户端安装分开记录；本机 CLI 验证不代表所有桌面/云端版本都通过。

官方 schema 副本位于 tools/schemas/agent-plugin-1.0.0.schema.json，来源为 [标准 schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)。它只用于维护者校验；加载插件时无需联网下载 schema。公开 GitHub、本地 marketplace 和官方公共目录不是同一个发布状态。
