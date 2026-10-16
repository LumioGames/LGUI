# 验证证据与历史状态

## 0.2.0 工程通用化复验

2026-10-16，以 `b8a17d7` 为基线。实际归档解压后验证默认空工程（32 个基础文件，无背包源码/素材）、显式 inventory、重复初始化和包闭包；新空工程恢复依赖、网页构建及 Chrome/Edge 各 5 项初始 smoke 通过。任务面板保留在仓库外，通过 `.lgui/project.json` 运行新的构建、服务、发布、网页与 Unity 入口：3 个业务/布局测试、Chrome/Edge 各 172 项、Windows IL2CPP 0 errors/0 warnings、原生 210 项与重启读回 5 项通过，截图已查看。项目源码、Player、存档与浏览器状态均未提交。

结构化摘要、测试归档 SHA256 与去敏原报告摘要见 [工程入口复验](verification/2026-10-16-project-workflows.json)。空工程不承诺生成完整原生应用；Unity 项目、平台适配器、构建方法和业务验收由各工程提供。没有重新声明用户视觉验收，也没有重复本轮任务面板的在线编辑会话测试。下文保留 0.1.0 的历史结果。

本轮日期 2026-10-16；基线 main `3c53360`。环境 Windows x64 / Node 24.18.0。下列结果来自实际运行，摘要、断言与原报告 SHA256 见 [2026-10-16.json](verification/2026-10-16.json)。原始日志、个人路径与隔离浏览器状态保存在仓库外；公开摘要不包含凭据或会话标识。

## 本轮实现与自动化

| 验证 | 实际结果 |
|---|---|
| 标准 manifest / 双宿主入口 / 5 个 skills / 路径 / 版本 / 文档链接 | 官方 Agent Plugins 1.0.0 schema 与本地一致性检查通过 |
| 核心测试 | 44 条通过；另完成已有 button-skins 与 narrow-layout 浏览器测试 |
| 工作区边界 | 无关 cwd 初始化、重复执行、已修改文件拒绝、路径逃逸与 junction 拒绝通过 |
| 发布包独立加载 | tar.gz 解压到仓库外，空工作区 init、固定依赖恢复、业务构建、网页服务通过；使用自带 CLI，无仓库上级依赖 |
| 共用会话 | 25 条通过：真实 UI/Agent 修改、预检、revision 冲突、精确重试、undo/redo、保存读回、导出 |
| 进程重启 | 12 条通过：保存、关闭浏览器进程、重开、读回、旧 session 拒绝、独立 CLI 查询 |
| 快照发布 | 实际导出的 ZIP 经 SDK 0.7.0 校验并发布 Unity 资源成功 |
| Chrome / Edge | 各 182 条控件交互 + 142 条完整窄窗/弹层断言通过；浏览器分别 155.0.8059.84 / 155.0.4283.45 |
| 上游编辑器补丁 | session 9、relay 2、文本回归 8、Inspector 4、history 14 检查通过；TypeScript 与 Vite 构建成功（存在体积提示） |

包测试还暴露了深路径下 Chromium IndexedDB backing store 打不开的问题。保留首次超时摘要；只将测试 profile 改为独立短临时路径后，归档工作区完成 25 条编辑闭环与 12 条进程重启验证。测试 profile 不随发布包分发。历史 windows tar 在此机器退出 3221225477，现使用固定 node-tar 打包。

## 实际客户端

Codex CLI **0.160.0** 和 Claude Code **2.1.283** 均通过本地 marketplace 添加、安装和列出插件，发现同一份 5 个 skills。Codex 从宿主管理的 `plugins/cache/lumio-lgui/lgui/0.1.0` 加载；Claude 的本地 marketplace 此版本直接引用包目录。两种路径均从 SKILL.md 解析工具，不依赖 cwd。真实安装与 schema 校验分别执行。

| 请求 | Codex | Claude Code |
|---|---|---|
| 显式 setup / 诊断工作区 | 读入已安装 skill 并执行 doctor | `/lgui:lgui-setup` 实际执行 doctor |
| 自然语言依赖诊断 | 选择 setup 并执行 doctor | 选择 setup 并执行 doctor |
| 初始化但未提供目录 | 询问目录，无写入 | 询问目录，无写入 |
| 无关算术 17×23 | 返回 391，无工具 | 返回 391，无工具 |

这些是小样本路由检查，不代表任意措辞都可靠触发。首次 Codex 间接提示过宽，转向浏览器探查而未完成，已终止该测试进程；限定任务为依赖诊断后通过。Claude 首次间接测试因测试允许工具不足耗尽轮次，补齐 Bash/PowerShell/Read/Glob/Skill 后通过；直接与缺输入用例曾有 Glob 权限拒绝，最终结果完成。Claude 使用用户已有的 `glm-5.3[1m]` 配置，没有换模型；不声称验证了 Anthropic 默认模型的行为。

Claude manifest 校验通过，并提示仓库 CLAUDE.md 不是插件自动上下文；因此技能不依赖该文件被自动加载。桌面安装后 onboarding 自动展示、云端客户端、其他系统及广泛触发率未测。

最终本地包重新安装后，两端诊断实际读出 16 个固定依赖版本匹配和自定义端口 4284/5300。Claude 的总结曾把空 Unity 环境覆盖值误述为“未安装”，但本机 Unity 实际存在；已明确 doctor 字段与技能说明：空覆盖值不是安装/许可检测。宿主生成的总结不能替代原始诊断数据。

团队 UI skill 去重后重新打包、解压验证、两端重新安装，仍发现 5 个技能。两端实际调用 lgui-author 并读取组件分册：都正确说明“新组件结构创建不属于当前事务 API”“propertyId=2 不被固定编辑器命令接受”“不能绕过在线会话改磁盘”，并列出缺少的工程/参考输入；没有写文件或启动服务。此用例验证安装后的技能阅读与边界理解，不宣称执行了新 UI 的结构修改。

远程 Linux CI 在提交 `323ad62` 上通过，运行包/链接/schema、44 条核心测试、归档解压与独立初始化；[运行记录](https://github.com/LumioGames/LGUI/actions/runs/38902171610)。CLI 登录、浏览器和 Unity 的本机验证不由该 CI 替代。

## 本轮原生结果

Unity **6000.6.6f1**、PuerTS Core/V8 **3.0.3**、已记录的四处 unbox 兼容补丁。实际执行资源准备、Prepare、GeneratePuerTS 和 Windows x64 IL2CPP Release 构建，退出码均为 0。共享 bundle SHA256 `0f8ecf3fe279bd836a2bb968a8da9434116f7dac867987fd78e4e1a748b14f04`，布局 SHA256 `ac1090b293125478680778e4760507917cd176ab419a629993e89de2ace0ccf1`。资源同步改为验证本次 build/publish 摘要及共享源身份，避免继续绑定旧工作目录产生的 bundle 字节。

官方 Unity CLI **1.0.0-beta.13** 也实际调用同一 C# 入口构建成功；Unity BuildReport 为 Succeeded、0 errors/0 warnings。CLI 另列出启动时 license-client validation 信息，随后日志显示许可证更新成功；这不是“无任何日志警告”。具体命令与调研见 [Unity CLI](unity-cli.md)。

CLI 构建产物重新运行 Player，**52 条业务/生命周期断言、16 条文本边界检查通过**，20 次开关循环通过。请求与实际四组尺寸一致：1280×800、794×727、486×727、390×844。测试退出并恢复既有存档。

首次隐藏 Player 的功能检查通过，但截图全黑，视觉不通过验证。取得显示窗口授权后，原启动器与官方 CLI 构建产物分别重跑，截图可见。模型查看说明和弹层截图，说明第三行在 canonical 画面可见，窄窗换行完整；原报告的 `pending-human-review` 原值保留。这是本轮模型视觉检查，不新增用户验收结论，也不是逐像素验收。截图：[1280](verification/player-1280x800-sword.png)、[794](verification/player-794x727-sword.png)、[486](verification/player-486x727-sword.png)、[390](verification/player-390x844-sword.png)、[奖励弹层](verification/player-390x844-rewards-modal.png)、[出售弹层](verification/player-390x844-sale-modal.png)。

本轮未重新运行 Unity Editor Play Mode、物理 IME、移动设备、macOS/Linux 原生构建；未安装 Pipeline、未测试官方 CLI 的在线 Editor/MCP 或 Unity Test Runner。原生 Player 与第三方二进制不随插件包发布。

## 历史事实（保持）

- 用户已明确验收通过；与自动化状态独立。
- Chrome/Edge 控件各 182 条、窄窗与弹层各 74 条历史断言通过。不是物理 IME、手机或逐像素视觉验收。
- 原 Editor 最近完整运行 28 条业务/生命周期通过，但请求 794×727，实际仍 390×844，整体 partial。
- 原 Windows IL2CPP Player 46 条业务/生命周期通过，canonical 说明第三行裁切，整体 failed。
- 说明高度补丁后来已实施，末版 Windows x64 IL2CPP Release 构建成功；当时无补丁后 Player 运行报告，不能沿用旧 46 条称末版通过。

历史源码与失败报告保留在 [仓库原证据](https://github.com/LumioGames/LGUI/tree/main/unity-migration/complex-inventory/fidelity/evidence)、[共用会话记录](https://github.com/LumioGames/LGUI/tree/main/%E9%97%AD%E7%8E%AF%E9%AA%8C%E8%AF%81)、[HTML 交付记录](https://github.com/LumioGames/LGUI/tree/main/%E4%BA%A4%E4%BB%98)。历史固定视口、旧网页和旧压力结果不会并入当前包的通过数。插件发布包不携带历史浏览器状态或日志。
