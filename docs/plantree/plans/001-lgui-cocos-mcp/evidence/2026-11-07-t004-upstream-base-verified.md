# 证据：T004 上游基座验证（2026-11-07）

结论：**fork 基点即上游 HEAD，T004 无需升级（no-op）**。此前「基点落后上游 149 commits」的调查结论有误，已在 plan 文件中更正。

核查命令与输出（`gh api`，2026-11-07）：

1. `repos/fairygui/FairyGUI-cocoscreator/commits/ccc3.0` →
   HEAD = `cd19b7049079550c3b184e94f0437dc9c11da623`（2024-05-21 "update lib"）
   —— 与 fork `docs/kb/fairygui-load-pipeline.md` 记录的基点**完全一致**。
2. `repos/fairygui/FairyGUI-cocoscreator/compare/cd19b70...ccc3.0` →
   `ahead: 0, files: 0` —— 基点之后上游 ccc3.0 无新提交。
3. 分支清单：`ccc2.0` / `ccc2.1-2.3` / `ccc3.0-3.4`(ff4f20b1) / `ccc3.0` / `master`。
4. `compare/cd19b70...ff4f20b1`（ccc3.0-3.4）→ `ahead: 0` —— 该分支不领先于 ccc3.0。

推论：

- fork 的 `sdk/`（48 个自身补丁提交压成的基座）直接坐在上游最新上，验证门禁（pack 坐标 479/479、往返 159/159）的结论继续有效。
- 上游 3.x 线自 2024-05 起未再更新，短期内不存在「追上游」的维护负担；若官方恢复更新再评估（本次未立项）。
- M1 直接以现行基座开工（T005）。
