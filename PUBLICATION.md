# 公开快照说明

LGUI 来自一次隔离的 FairyGUI 浏览器优先与 Unity/PuerTS 验证。仓库根保留原“验证”目录的相对层级，便于恢复脚本依赖；不包含 LumioEngine、LumioGameNext 或其他私有项目。

- 共享业务、布局、FairyGUI 源工程、生成美术、正式发布图集和宿主源码纳入版本控制。
- 编辑器改动以固定上游提交上的完整 patch 提供；bootstrap 在本地恢复依赖。没有重新分发整个品牌化网页编辑器。
- 调研时抓取的第三方网页、文档和源码快照不随包发布；报告中的固定上游链接保留作查证入口。第三方许可文本与实际分发的 runtime 署名继续保留。
- 原报告保留历史判定。公开副本把原机绝对路径替换为 `[LGUI_ROOT]`、`[LOCAL_WORKSPACE]` 或 `[LOCAL_HOME]`；变换记录见 `publication-manifest.json`。原报告内的 SHA 描述原机记录；路径归一化后的公开副本可能有不同 SHA。
- HTML 已针对仓库布局重新生成，截图内嵌。本机 Windows Player 二进制、安装包、Unity 许可证、缓存、浏览器 profile 和临时连接凭据不随源码发布。
- HTML 中本机 Player 输出路径仅作记录。可通过文档中的固定版本流程自行构建；此前尚未生成分发 ZIP。
- 用户验收通过与自动化结果分别记录。最后的原生说明补丁已构建，但没有补丁后运行复验报告；开源整理不把该状态提升为完整自动化通过。

原创代码许可见 `LICENSE`；第三方和素材范围见 `THIRD_PARTY_NOTICES.md`。
