# 一致性测试

同一个用例在 headless（Node）和 h5（浏览器）上各跑一遍，最后各取一份快照，两份必须完全一样。快照里有：用例返回的数据（一般是 Model）、每个打开的组件里每个控件的文字 / 可见 / 可用、滑动条和下拉框的值、序列帧动画在不在播放、控制器的当前页、列表和树的项数和每项的文字，以及 `lgui.debug.snapshot()`（界面栈、方向、语言、输入类型……）。可见用的是 `t.visible`，也就是「真的显示」：被齿轮（gearDisplay、gearDisplay2）或组藏起来的控件算不显示。

- `runner.mjs`：建测试工程（`lgui init` 的模板，加上 `lgui new module` 生成的 split、tabs、dialog 三种界面，再放进 `ui/Controls` 包），打包、在两个后端上跑。
- `ui/Controls/`：新控件和齿轮的测试界面（输入框、滑动条、下拉框、标签、序列帧动画、树、两个控制器、带齿轮的组）；`controls.mjs` 把它写进工程（单元测试也用它）。
- `harness.ts`：用例的类型和取快照的代码，两个后端打包的是同一份。
- `cases/*.ts`：用例。用 `lgui.testing` 的操作写（`t.click`、`t.hold`、`t.swipe`、`t.wheel`、`t.key`、`t.type`、`t.setValue`、`t.choose`、`t.setScreen`、`t.setLanguage`……）。h5 上这些操作换算成页面坐标后用真实的鼠标、触摸、键盘发出去：打字是点一下、全选再用键盘输入，拖滑动条是按住滑块拖一次，选下拉框是点开再点弹出列表里的项。

**加用例：** 在 `cases/` 里加一个文件，默认导出 `{ screen, run(t) }`，`run` 返回要比对的数据。界面从 `../src/modules/...` 引入，也可以在用例里写一个只给这个用例用的 View。运行：`node --test tests/conformance/`（需要 Chrome 或 Edge，没有时跳过）。

**用例里不要碰的已知差异**（headless 不模拟，写进用例会两边不一样）：布局（关联、自动排布，控件位置是 `ui/` 里的初始值）；命中测试（被同级控件挡住的按钮 headless 照样点得到）；虚拟列表的回收（headless 里列表每一项都有对象）；改属性的齿轮（gearXY、gearText 等）；按钮直接绑控制器；悬停时按钮的 over 页；点不可用或被藏起来的控件（headless 报 `LGUI-RT-032`，h5 上点击落到下面的控件，用例里用 try/catch 包住，只比对结果）。

Unity 在 S3-04 接进来。
