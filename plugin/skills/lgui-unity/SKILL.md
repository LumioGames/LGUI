---
name: lgui-unity
description: "将已有 LGUI 工程导出到 Unity 6000.6/PuerTS 3.0.3，检查本地包并生成启动场景和资源。"
license: MIT
---

# lgui-unity：接 Unity

先读 [unity.md](../../references/unity.md)，确认目标是 Unity 6000.6 工程，官方 PuerTS Core/V8 3.0.3 已解压为工程内的 embedded 本地包。运行 `node <插件目录>/tools/lgui.mjs unity export --to <Unity 工程路径>`，打开生成的 `Assets/LGUI/LGUIBoot.unity` 并点 Play。

已有启动场景不覆盖。界面、翻译和脚本由 LGUI 源工程重新导出；保留 `Assets/LGUI/link.xml`。按报错修复缺项，不安装 Unity/PuerTS、不改包缓存、不拿导出文件存在当作原生运行验收。

Windows 验收使用实际 Release IL2CPP Player，构建前按参考文档生成 Reflection Mode 原生桥。普通运行保持 `LGUIBoot.debugPort=-1`；Inspector 仅在明确的专门验证中启用。

图集导入范围、列表拖动与位置恢复、modal 顺序及网络策略见参考文档的「当前运行约定」。区分正常运行与预期失败用例；Editor、Node 边界测试、图片 URL 或一次构建成功，均不能替代 Player 的实际操作、像素和内存证据。
