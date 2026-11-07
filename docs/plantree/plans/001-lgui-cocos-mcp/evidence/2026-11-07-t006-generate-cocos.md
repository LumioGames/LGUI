# 证据：T006 generate/cocos 分支落地（2026-11-07）

## 产出

- `plugin/tools/lib/generate/cocos.mjs`：与 Unity 同一条 OpenFairyGUI 管线（setProjectType(0)，标准二进制包），按 decisions/003 布局输出 `<out>/<包名>/<包名>_fui.bytes`（图集、声音跟着包目录）；不属于任何包的产物直接报 LGUI-CLI-021，不悄悄丢文件。由 `generate/index.mjs` 再导出；不是 CLI 命令——包同步由 T007 的 testbed dev 脚本（进而 M2 的 MCP 工具）调用，CLI 面按计划归 T009/M2。
- `tests/unit/cocos/generate.test.mjs`（4 用例）：template+inventory 的分组布局、FGUI 头、背包示例五包目录 + 图集 + 声音（Common_click001.mp3 跟包目录走）+ 根目录无散文件、旧产物清理。

## 验证

- cocos generate 测试 4/4；回归批次（generate/init/upgrade 单测）21/21。
- i18n 翻译文件由既有 `generateTranslations` 产出到 `<out>/i18n/<语言>.xml`（同步脚本组装，T007 接通）；翻译在 CC 运行时怎么加载（fetch 还是 TextAsset）已列入 T007 校准清单的延伸项。

## 遗留

- T007 校准清单新增第 7 项：cocos 后端 `setLanguage` 目前用 fetch 读 i18n XML——CC 的 bundle 资源在 Web 预览里 fetch 不到，要改成 bundle.load TextAsset（生成侧不变）。
