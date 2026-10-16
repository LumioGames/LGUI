# 架构、目录与迁移边界

LGUI 把 Agent 的需求与参考转换为可编辑、可保存、可验证的 FairyGUI UI。浏览器先迭代，Unity/PuerTS 迁移沿用业务与布局。它目前是带可复用工具的参考工作流，不是任意截图到全平台 UI 的自动转换器。

## 目录审计与渐进整理

| 范围 | 当前唯一来源 | 边界 |
|---|---|---|
| 可安装插件 | 根 plugin.json、skills/、tools/ | 工具从自身安装位置找资源；所有项目命令显式指定工作区 |
| 宿主适配 | .claude-plugin/、.codex-plugin/、.agents/plugins/ | generate 从根 manifest 生成，禁止分叉手改 |
| 工程模板与路由 | templates/blank/、templates/inventory/、tools/workflows.mjs | 默认空工程；项目清单配置网页与 Unity；不隐式选择示例 |
| 业务与布局 | unity-migration/complex-inventory/shared/、fidelity/layout-shared.js | pure TS；shared 引用 prototype/shared/model.ts 奖励规则 |
| 网页适配 | complex-inventory/fidelity/ | FairyGUI-dom DOM 组件手工组装；存储、字体、事件在平台层 |
| 原生适配 | unity-migration/InventoryUnity/Assets/ | FairyGUI-unity 正式包、PuerTS；无 WebView/WebGL |
| 示例资产与源工程 | complex-inventory/art/、project/、published/、fidelity/skin/ | 背包的 ID、24 格及画布只属于示例 |
| 依赖与补丁 | dependencies.lock.json、patches/、scripts/bootstrap.mjs | 根验证工具、SDK 0.7.0、编辑器 0.2.4 三个独立根 |
| 当前文档 | README、docs/、skills/*/references/ | README 导航；具体流程只维护一个来源 |
| 历史证据 | evidence/、闭环验证/、交付/、各示例 evidence/ | 保留失败和原报告；发布包只取运行所需内容 |

这次先把可复用入口提到 tools/，把安装、发布、校验与技能从历史报告中分离。没有整体搬动 complex-inventory：它向上两级引用奖励模型与依赖，Unity manifest 使用 `file:../../packages/...`；构建、fixture 与历史报告也依赖该层级。模板保留这些路径，避免一次目录重排改变未经复验的跨端合同。以后迁移必须同时修改 import、构建、Unity 包路径和文档，并复验字节身份。

## 会话与发布

人类 Inspector 和 Agent HTTP relay → 同一个 BrowserAgentSession → EditorProjectSession / Backend → 操作队列、revision、撤销历史 → 浏览器 OPFS/IndexedDB 保存与读回。Agent CLI 是传输客户端，**不是 MCP server**。没有重复实现协议、空 MCP 配置或 hooks。

发布只读明确导出的已保存 ZIP 或离线 .fairy 快照；不会作为第二个写者并发修改现场。网页和 Unity 是不同会话、不同存储，共享存档 schema，不是在线同步。

共享业务不导入 DOM、UnityEngine、CS 或文件系统。关闭 view 只卸载监听，应用 runtime 保持；宿主退出才 dispose。共享布局在平台外可执行，但字体测量、资源加载、事件、持久化与生命周期由适配层处理。Unity 采用正式 ComplexMain/ItemSlot 包；网页 fidelity 仍是手工组装，展示投影尚未全部去重。

## 三个目录

插件缓存只读；用户工程由 `init --workspace` 复制允许清单，默认 blank，inventory 显式选择；临时验证目录独立。`.lgui/workspace.json` 记录模板/版本/端口，`.lgui/project.json` 记录实际工程脚本、网页根和 Unity 构建方法。参见 [工程配置](projects.md)。脚本由自身位置或工作区定位，不依赖启动 cwd。路径检查包含符号链接/Windows junction，禁止缓存与工程重叠。重跑 init 在写入前检查全部文件，用户修改会中止；它不是升级覆盖工具。

包不包含恢复的上游仓库、node_modules、浏览器状态、Unity 安装器和 Player。依赖恢复后产生的数据都在工作区。插件运行期需要 Node 和用户显式安装的固定依赖；“自包含”指分发的代码/模板/引用不逃出包根，不代表捆绑操作系统、浏览器和 Unity。
