# Baseline

本目录只放 plan-tree 需要但 llmdoc 不拥有的项目级上下文。

**架构知识的一律去 llmdoc/**：`npx -y @tokenroll/llmdoc tree` 看全图，`search "<词>"` 按概念找，`context --files <路径>` 按文件找属主。不在 baseline 复制模块地图、运行流程、测试门——那些是 llmdoc 的职责（[release/integrity](../../llmdoc/release/integrity.mdx)、[testing/layers](../../llmdoc/testing/layers.mdx) 等）。

规划相关的事实速记：

- 仓库分区、发版校验、贡献流程：CONTRIBUTING.md；架构不变量在 llmdoc `release/integrity`。
- 本机执行计划（Owner 侧）：LumioNext 工作目录 `LGUI-EXECUTION-20261029.md` 系列；本 plan-tree 只管仓库内规划状态。

## 模块键

规划文件里的 Affected Modules 用 [module-map.md](module-map.md) 的稳定键。
