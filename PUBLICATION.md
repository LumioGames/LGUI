# 开源发布边界

LGUI 从独立跨端验证快照整理为 Agent UI 插件。源码与历史证据保留；安装包通过 tools/pack.mjs 的明确清单产生，仅包含工具、技能、文档、许可和运行模板。旧记录中的路径归一化仍见源码 publication-manifest.json；原机 SHA 与公开归一化文本 SHA 可能不同。

- 原始业务、适配层、正式 FairyGUI 工程、美术及选定发布资源在仓库中维护单一来源。
- 兼容入口由根 plugin.json 生成；包不得依赖根外文件或个人机器路径。
- 上游编辑器通过固定提交与 patch 恢复，不重新分发品牌化编辑器构建。三套 npm 依赖及可选 PuerTS 在用户工作区恢复。
- 插件包排除历史日志、浏览器状态、安装器、node_modules、上游检出、Unity 缓存、凭据和原生 Player。包根 SHA 清单可独立验证。
- 历史失败保留在源码中；用户接受、编译、运行与视觉通过分别记录。末版原生说明补丁历史上只有成功构建，没有补丁后运行报告。
- 公开 GitHub 源码、可安装插件包和官方公共目录收录分别交付；本次不自动申请目录上架。

使用 [安装指南](docs/install.md)，维护者遵循 [发布流程](docs/release.md)。原创许可见 [LICENSE](LICENSE)，第三方、素材与二进制再发行限制见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
