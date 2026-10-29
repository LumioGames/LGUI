---
name: lgui-ui
description: "在 LGUI 工程里拼界面：按 UI 开发规范写 ui/ 里的 FairyGUI XML、用排布模式生成横竖两版、AI 出图后用 art split 拆图、加动效、在编辑器里和人一起改。要新做或修改界面的样子时用。"
license: MIT
---

# lgui-ui：拼界面

**什么时候用：** 新做一个界面，或者改界面的布局、图片、文字、动效。界面背后的功能（数据、操作）用 `lgui-code`。

**先读：** [UI 开发规范](../../references/ui-spec.md)。第 1 节是固定步骤，每次照做。

**输入：** 要做什么界面（参考图或描述）、放在哪个包、横竖屏要求。参考图和素材的来源不清楚时先问用户。

**命令：**

| 要做的事 | 命令 |
|---|---|
| 新界面：按排布模式一次生成横竖两版 | `lgui new view <包>/<组件> --pattern split\|tabs\|grid\|dialog`（模式见规范 7.4） |
| 连功能骨架一起生成 | `lgui new module <名字> --pattern <模式>` |
| 查现有组件和控件名 | `lgui ui list` |
| AI 出的网格大图拆成小图 | `lgui art split <大图> --grid 6x4 --size 128x128 --pkg <包> --names <名字>`（原图放进 `ui/art-src/`） |
| 检查规范 | `lgui check`（`LGUI-UI-xxx`） |
| 看效果 | `lgui dev`；截图 `lgui verify` |
| 和人一起在编辑器里改 | `lgui editor`；编辑器开着时改已有控件的属性：`lgui editor props <组件> <控件> <属性>=<值> ...` |

**要点：** 直接编辑 `ui/` 里的 XML；ID 和名字照规范第 3 节；横竖两版控件名和类型一致；文字都写 `autoSize`；图里不放字（带字图片按第 9 节，用装载器）；跨包引用只写 `pkg` + `src`，图片不跨包（第 2 节）。动效在静态界面做好以后再加，见 [motion.md](references/motion.md)。

**产出：** `ui/` 里的组件和图片、`lgui check` 没有错误、横竖两张截图（文字没被截断、两版排得对）。
