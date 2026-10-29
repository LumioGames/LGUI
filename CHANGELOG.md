# 更新记录

## 0.3.0（未发布）

和 0.2.0 不兼容：目录结构、命令行、框架都是新的。0.2.0 的全部内容在 tag `v0.2.0-final` 里。

**安装和工程**

- 发布面只有 `plugin/`；Claude Code、Codex 用仓库里的 marketplace 安装，其他客户端直接用 `plugin/` 目录。
- 用户机器上只需要 Node 24 或更高和 Chrome / Edge；TypeScript、esbuild、OpenFairyGUI 0.7.0、sharp、playwright-core 随插件提供（macOS arm64 / x64、Linux x64、Windows x64）。
- 用户工程：`ui/`（FairyGUI 格式，界面的唯一来源）、`src/`、`tests/`、`i18n/`、`.lgui/`（工程配置、框架副本、生成物）。

**命令行（`node <插件目录>/tools/lgui.mjs`）**

- `init`、`doctor`、`dev`（改动后自动刷新）、`check`（TypeScript + UI / MVC / 多语言规则）、`test`（headless 后端、假时钟；测试文件没跑起来也算失败）、`verify`（6 组尺寸 × 横竖，`--lang`、伪翻译）、`ui list`、`new module`、`new view`（四种排布模式）、`i18n extract`、`art split`、`upgrade`、`editor`、`editor props`。`unity export` 在阶段 3 实现。
- 所有命令支持 `--json`；错误都带错误码（`LGUI-CLI-xxx`、`LGUI-RT-xxx`、`LGUI-UI-xxx`、`LGUI-MVC-xxx`），见 `references/error-codes.md`。报错里的文件一律写相对工程根目录、用 `/` 的路径。
- `check` 的规则：MVC-001 不再误报工程里自己声明的 `location`、`window` 这类同名变量和参数；只有 View 的 `keys` 表里的 `hint` 算文本键；没写 `fontSize` 的文字按默认 12 号查 UI-011；UI-017 也查装载器的 `url` 和按钮的 `icon`；UI-020 同包引用不再警告。新规则：gearText 里写了用户能看到的文字（UI-060）、按钮直接绑控制器（UI-061）、翻译和原文一字不差（UI-062，警告）、横竖两版的固定文字不一样（UI-063，警告）、全屏界面没有 `safe`（UI-064）、音效不存在、没登记或不是 mp3（UI-065）、View 里直接改控件属性（MVC-020，警告）。
- `verify`：同一个画面只截一次（默认 8 张）；按尺寸的 `safeArea` 模拟刘海。
- `new module`：Model 和子项的代码里不写死文字，用文本键并补进文本表；全屏排布模式的骨架带 `safe`，贴边的控件关联到它。

**框架**

- MVC：`lgui.Model` + `pick`、View / ItemView / PartView 和绑定表、Controller、Service、`lgui.request`。
- UIManager：hud、page、popup、modal（队列）、toast 五层，激活和遮挡，`onClose` 交回结果，资源引用计数和关闭界面缓存。
- 横竖屏：按方向自动换 `@portrait` 版本，View 实例保留。
- UIManager 的边界情况：modal 按打开的先后排队，前一个打开失败或被取消时照常放出下一个，loading 不参与排队；`lgui.confirm` 一次显示一个，总会有结果（被取消当 `false`）；`popTo`、`closeAll` 最后只重算一次激活；返回键不关 `hud` 层；对打开着的界面再登记 `onClose` 报 `LGUI-RT-084`。
- 旋转、换语言重建时 PartView 实例保留，通用弹窗的文字换成新语言；安全区：全屏界面的 `safe` 子控件摆进安全区，弹窗放在安全区正中，测试用 `t.setSafeArea`。
- 输入：手势（点击、双击、长按、拖拽、滑动、双指缩放、滚轮、悬停）、按键动作、返回键、操作提示栏、输入类型。
- 动效：动效名当绑定表的键（`playing`、`play`、`done`），`ui/` 里的自动播放照旧；被全屏界面盖住时暂停，界面关闭时停掉；headless 按 `ui/` 里写的时长走假时钟。
- 拖放（游戏式）：`dragData`、`dragIcon`、`drop`；拖起时有跟手的临时图标，松在 `drop` 上才调用 Controller；测试用 `t.dragTo(从哪, 到哪)`。
- 多语言：`lgui.t`、复数、格式化、运行时切换语言、带字图片、伪翻译。
- 定时器（跟着界面暂停和取消；回调出错时照常报错，不影响别的定时器和以后的帧）、广播站、红点、按钮音效、图片占位、通用弹窗（提示、确认、加载中）、ArtText 美术字、`lgui.time.wait`。
- 后端：h5（FairyGUI-dom，带补丁）和 headless（测试用）；两者用一致性测试保证行为一样。
- 控件：标签、滑动条（`value` + `change`）、下拉框（`items` / `selected` / `select`）、序列帧动画（`playing`）、树（和列表同样的词）；输入框加 `input`（输入法选字时不触发）；测试加 `t.type`、`t.setValue`、`t.choose`、`t.value`、`t.playing`。
- headless 模拟显示齿轮（`gearDisplay`、`gearDisplay2`）和组，`t.visible` 在两个后端上都是「真的显示」；`wheel` 只认落在这个控件上的滚动；网页端不可用的控件在 FairyGUI 重新挂元素以后仍然点不到。

**编辑器**

- `plugin/editor/`：FairyGUI Editor Online 编译版，换成 LGUI 品牌；`lgui editor` 打开它并提供实时会话中转，每次打开都从 `ui/` 重新读取（不含 `art-src/`）；`lgui editor props` 在编辑器开着时改控件属性。
- `lgui editor` 用固定端口（工程配置 `editorPort`，默认 4174，被占用时报 `LGUI-CLI-110`），浏览器记得住授权过的 `ui/` 文件夹；中转只转发 `query` 和 `transact`；中转和 `lgui dev` 的服务都只认 Host 是 `127.0.0.1:<端口>` 的请求。

**规范和技能**

- `references/`：UI 开发规范、MVC 开发规范、用户工程目录、错误码、接入 Unity（阶段 3）。
- 技能：`lgui-setup`、`lgui-ui`、`lgui-code`、`lgui-verify`、`lgui-unity`（阶段 3）。

**示例**

- `examples/inventory/`：用新框架重写的背包示例（营地、背包、商店、领奖），用到框架的每一项功能。
