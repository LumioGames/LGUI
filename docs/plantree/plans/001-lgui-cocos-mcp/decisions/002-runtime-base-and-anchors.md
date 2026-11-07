# 002：运行时基座与版本锚定

日期：2026-11-07 · 状态：已定

- **基座**：aloasut/fairygui-cocos（官方 FairyGUI-cocoscreator `ccc3.0` 基点 `cd19b70` + XML 直载增量），MIT。不用它写 LGUI 的 MVC（LGUI 自带），只用它的控件运行时桥。
- **版本锚定**：Cocos Creator 3.8.x（本机实测锚定 **3.8.8**，2026-11-07 修正；fork demo 3.8.2，上游口径 3.4+），对齐 Unity 侧「锚死版本再适配」的先例（PuerTS 3.0.3）。
- **目标平台**：M1 仅 Web 目标；原生壳（剪贴板/IME/返回键）deferred（T012）。
- **包格式**：二进制链——LGUI unity 分支的产物（`<包名>_fui.bytes` + 图集）即标准 FairyGUI 二进制包，generate/cocos 优先复用；fork 的 XML 直载链仅作评估（T013）。
- **动手前置**：无——2026-11-07 核查确认 fork 基点 `cd19b70` 即上游 `ccc3.0` HEAD（[证据](../evidence/2026-11-07-t004-upstream-base-verified.md)），早期调查的「落后 149 commits」结论有误，已更正。

后果：CC 升级 = 版本锚定迁移（重新适配），不是配置改动；文档与错误码里写清锚定版本。
