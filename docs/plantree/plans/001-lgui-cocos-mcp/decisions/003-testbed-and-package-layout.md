# 003：testbed 来源与包加载布局（Q1、Q2 收口）

日期：2026-11-07 · 状态：已定（用户授权按推荐执行，可否决重开）

## Q1 → 新建最小 CC 3.8.2 工程

- 不整体移植 fork 的 `sdk/demo`（16 包是 FGUI 自身的冒烟场，不是 LGUI 的回归场）；只**抄它的工程配置**里可复用的项（`preserveSymlinks`、fairygui-cc 本地依赖方式、构建设置）。
- LGUI 侧的测试界面用 `tests/helpers/fixture.mjs` 生成的同一套 fixture UI——conformance 用例与 testbed 同源，快照对比才有意义。

## Q2 → 产物布局与 bundle 约定

- generate/cocos 产物写固定目录 **`assets/lgui-ui/<包名>/`**（`<包名>_fui.bin` + 图集；扩展名用 .bin 不用 .bytes——CC 对 .bytes 落兜底导入器变文本载入（demo 实测 2026-11-08，importer 'buffer' 只认 .bin），整目录替换、只碰 LGUI 归属目录（对齐 unity export 的 owned-path 精神，见 llmdoc `unity/export-pipeline.mdx`）。
- 加载走 **AssetManager bundle**：`lgui-ui` 目录配置为 bundle，fork 的 `UIPackage.loadPackage(bundle, path)` 原生支持（`UIPackage.ts:313-360`）——bundle 是 CC 对 UI 资源的官方建议粒度，也给 M2 的包同步命令一个稳定句柄。
- M1 不使用 `resources/` 特殊路径。
- 遗留窄问题：bundle 内是否需要 lgui 元数据清单（供 M2 接入工具枚举包/组件），M2 设计 CLI 面时定，记在 topics/mcp-server.md。
