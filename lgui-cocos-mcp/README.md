# lgui-cocos-mcp

Cocos Creator × LGUI 的开发工作区。终态目标（P001 北极星）：**通过 MCP 给 Cocos Creator 接入/管理/开发 LGUI 界面，并启动游戏，替代 FGUI 工作流**。

规划与状态在 [docs/plantree/plans/001-lgui-cocos-mcp](../docs/plantree/plans/001-lgui-cocos-mcp/README.md)（里程碑、决策、未决问题都那里），本 README 只讲目录怎么用。

## 目录

| 路径 | 内容 | 阶段 |
|---|---|---|
| `testbed/` | CC 3.8.2 测试工程：跑通 LGUI 五层栈/横竖屏/换语言，conformance 第四方 | M1（来源未定，见 Q1） |
| `mcp/` | MCP server：接入、包同步、界面开发、验证、启动 Cocos Creator | M2/M3，未动工 |

## 代码归属约定

- **适配层源码最终进 `plugin/framework/backends/cocos/`**（发布面，随插件下发），`plugin/tools/lib/generate/cocos.mjs` 同理——本目录不放会随插件发布的代码。
- 本目录是纯开发面（同 `examples/`、`tests/`），`npm run check` 的发布面规则不受影响。
- `.gitignore` 已排除 Cocos 工程产物（`library/`、`temp/` 等），testbed 工程本体进 git 的范围随 Q1 一起定。

## 运行时基座

[fairygui-cocos](https://github.com/aloasut/fairygui-cocos)（本机 `/Users/jambo/Documents/workspace/fairygui-cocos`）：官方 ccc3.0 运行库 fork + XML 直载增量，MIT。基座决策与版本锚定见 plan decisions/002。
