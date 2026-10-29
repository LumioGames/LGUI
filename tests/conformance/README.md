# 一致性测试

同一个用例在 headless（Node）和 h5（浏览器）上各跑一遍，最后各取一份快照，两份必须完全一样。快照里有：用例返回的数据（一般是 Model）、每个打开的组件里每个控件的文字 / 可见 / 可用、控制器的当前页、列表项数和每项的文字，以及 `lgui.debug.snapshot()`（界面栈、方向、语言、输入类型……）。

- `runner.mjs`：建测试工程（`lgui init` 的模板，加上 `lgui new module` 生成的 split、tabs、dialog 三种界面），打包、在两个后端上跑。
- `harness.ts`：用例的类型和取快照的代码，两个后端打包的是同一份。
- `cases/*.ts`：用例。用 `lgui.testing` 的操作写（`t.click`、`t.hold`、`t.swipe`、`t.key`、`t.setScreen`、`t.setLanguage`……）。h5 上这些操作换算成页面坐标后用真实的鼠标、触摸、按键发出去。

h5 的按压时长由 Chromium 原生手势输入执行，驱动响应迟到不会把指定的 50 毫秒点击拖成长按。`input-timing.test.mjs` 对首次输入完成后的响应注入 400 毫秒延迟，记录真实 DOM 指针时间和帧序号，再比较完整快照；不改手势阈值或事件时间。

**加用例：** 在 `cases/` 里加一个文件，默认导出 `{ screen, run(t) }`，`run` 返回要比对的数据。界面从 `../src/modules/...` 引入，也可以在用例里写一个只给这个用例用的 View。运行：`node --test tests/conformance/`（需要 Chrome 或 Edge，没有时跳过）。

Unity 在 S3-04 接进来。
