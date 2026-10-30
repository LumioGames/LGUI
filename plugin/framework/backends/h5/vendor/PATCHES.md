# FairyGUI-dom 补丁

在上游提交 `fade49fc33bdcd5673351e04637d4cc08d2297f3` 的 `fairygui.module.js` 上直接改，每处改动都加了注释 `// LGUI patch: <编号>`。行号以本仓库现在的文件为准。验证见仓库的 `tests/e2e/dom-patches.test.mjs`（用 Chrome 或 Edge）；第 5 处要在 Safari 里看。

| 编号 | 位置 | 原因 | 改法 | 怎么验证 |
|---|---|---|---|---|
| 1 | `Image` 的 fill 属性（第 16739 行起） | `fillMethod`、`fillOrigin`、`fillClockwise`、`fillAmount` 原来是空实现，进度条和长按进度显示不出来 | 存下 4 个值，变化时调用 `updateFill()`：水平、垂直用 CSS `clip-path: inset(…)`；径向 90/180/360 度用 `conic-gradient` 做 `mask-image` | XML 里写的水平 50% → `inset(0px 50% 0px 0px)`；代码改成 0、1 时分别是 `inset(0px 100% …)`、`inset(0px 0% …)`；径向 360 度的起点、顺逆时针；改回 None 时清掉 |
| 2 | `UIPackage.setImageManifest` / `loadImageManifest`（第 4752 行起），`loadPackage` 读完包之后（第 4784 行起） | 生成的网页界面包里，图片是按资源 ID 命名的散图，要按 `manifest.json` 找到文件（原来写在背包示例的 `dom.ts` 里） | 设置映射后，`loadPackage` 把每张图片的 `file` 改成「包目录 + 散图文件名」；包或图片不在映射里报 `LGUI-RT-010` | 两张图片的地址都指向 `ui/Test/<资源ID>.png` 且能加载，尺寸正确；包不在映射里时报 `LGUI-RT-010` |
| 2（附带） | `UIPackage.loadPackage`（第 4768 行起） | 原来请求失败时 Promise 永远不结束，读包出错时异常抛在事件回调里 | 请求失败 reject 并报 `LGUI-RT-011`；读包出错时 reject | 地址错误的包报 `LGUI-RT-011` |
| 3 | 文字颜色 | 方案里说「文字颜色有问题」 | **未复现，未改。** 在 tag `v0.2.0-final` 里只找到编辑器属性面板的文字颜色修复（`闭环验证/text-fix`），和运行时无关；最小样例里包中写 `color="#ff0000"` 的文字，网页上算出来的颜色就是 `rgb(255, 0, 0)` | 测试里保留这一项检查，以后出现问题能马上发现 |
| 4 | `TextField.applyFormat`（第 16327 行） | 阴影的 `shadowColor`、`shadowOffset` 读进来了但从来不用 | 偏移不为 0 时设置 `textShadow = <x>px <y>px 0 <颜色>` | `shadowColor="#ff0000" shadowOffset="2,3"` → `rgb(255, 0, 0) 2px 3px 0px` |
| 5 | `UIElement`（第 15763 行）、`createUIElement`（第 17797 行起）、舞台样式表（第 17169 行起） | 上游用扩展内置元素（`customElements.define(…, {extends: "div"})` 加 `document.createElement("div", {is})`），Safari 的 WebKit 一直不支持。iPhone 上所有浏览器（包括微信）和 Mac 上的 Safari 打开就报 `ele.init is not a function` | `UIElement` 改成继承 `HTMLElement`，七种元素改成独立自定义元素（`<fgui-div>` 等），用 `document.createElement(tagName)` 创建；样式表里按 `div` 写的定位规则加上这七个元素名，并设 `display: block` | iPhone 模拟器的 Safari 打开背包示例的静态构建（`scripts/build-demo.mjs`），营地和背包正常显示、能点；Chrome 里 `npm test` 全部通过 |
