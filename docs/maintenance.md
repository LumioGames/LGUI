# 维护规则（AGENTS / CLAUDE 共用）

LGUI 独立于 LumioEngine、LumioGameNext 和私有兄弟工程。共享业务保持 pure TypeScript；布局复用，字体/加载/事件/存储/生命周期留平台层。保留稳定 FairyGUI IDs；正式源先校验、保存读回，再发布和验证。

人和 Agent 继续共用 EditorProjectSession、Backend、队列、revision 和 undo。unknown-result 只能原 requestId/载荷精确重试。不要并行写磁盘伪装共用会话。关闭 UI 不关闭应用 runtime；宿主退出才 dispose。

行为改动先做针对性失败测试。UI 几何/美术改动要看实际截图。保留旧失败证据；分开记录源码、编译、运行、视觉和用户接受，不升级未经测试的结果。共享输入变化要更新 build/setup 身份并验证宿主实际加载字节。

bootstrap 先 --dry-run，明确安装才 --install；Unity 可选。保留三个依赖根及 PuerTS 3.0.3 四处 unbox 补丁。未知源码、HEAD 或用户修改应停止，不能 reset/clean。缓存只读，工程必须显式 --workspace；不提交依赖、安装器、浏览器 profile、凭据、Unity 缓存、Player 或本机 license。

根 MIT 只覆盖原创工作。保留第三方许可、素材来源、补丁摘要与 .meta。生成物有选择地保留，不全局忽略 dist 或二进制。目录变化要审计 imports、Unity 相对包路径及链接；不做无关批量格式化。

plugin.json 是插件版本唯一来源；改完运行 generate，再 validate/check。两端兼容入口不可分别手改。功能分支通过受影响检查后提交 PR；尊重远程 branch protections 与 required checks，不能绕过。维护流程见 [贡献](../CONTRIBUTING.md) 与 [发布](release.md)。
