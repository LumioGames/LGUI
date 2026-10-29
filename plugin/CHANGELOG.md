# 更新记录

## 0.3.0（未发布）

和 0.2.0 不兼容：目录结构、命令行、框架都是新的。0.2.0 的全部内容在 tag `v0.2.0-final` 里。

**安装和工程**

- 发布面只有 `plugin/`；Claude Code、Codex 用仓库里的 marketplace 安装，其他客户端直接用 `plugin/` 目录。
- 用户机器上只需要 Node 24 或更高和 Chrome / Edge；TypeScript、esbuild、OpenFairyGUI 0.7.0、sharp、playwright-core 随插件提供（macOS arm64 / x64、Linux x64、Windows x64）。
- 用户工程：`ui/`（FairyGUI 格式，界面的唯一来源）、`src/`、`tests/`、`i18n/`、`.lgui/`（工程配置、框架副本、生成物）。

**命令行（`node <插件目录>/tools/lgui.mjs`）**

- `init`、`doctor`、`dev`（改动后自动刷新）、`check`（TypeScript + UI / MVC / 多语言规则）、`test`（headless 后端、假时钟；测试文件没跑起来也算失败）、`verify`（6 组尺寸 × 横竖，`--lang`、伪翻译）、`ui list`、`new module`、`new view`（四种排布模式）、`i18n extract`、`art split`、`upgrade`、`editor`、`editor props`。`unity export` 在阶段 3 实现。
- 所有命令支持 `--json`；错误都带错误码（`LGUI-CLI-xxx`、`LGUI-RT-xxx`、`LGUI-UI-xxx`、`LGUI-MVC-xxx`），见 `references/error-codes.md`。

**框架**

- MVC：`lgui.Model` + `pick`、View / ItemView / PartView 和绑定表、Controller、Service、`lgui.request`。
- UIManager：hud、page、popup、modal（队列）、toast 五层，激活和遮挡，`onClose` 交回结果，资源引用计数和关闭界面缓存。
- 横竖屏：按方向自动换 `@portrait` 版本，View 实例保留。
- 输入：手势（点击、双击、长按、拖拽、滑动、双指缩放、滚轮、悬停）、按键动作、返回键、操作提示栏、输入类型。
- 多语言：`lgui.t`、复数、格式化、运行时切换语言、带字图片、伪翻译。
- 定时器（跟着界面暂停和取消；回调出错时照常报错，不影响别的定时器和以后的帧）、广播站、红点、按钮音效、图片占位、通用弹窗（提示、确认、加载中）、ArtText 美术字、`lgui.time.wait`。
- 后端：h5（FairyGUI-dom，带补丁）和 headless（测试用）；两者用一致性测试保证行为一样。

**编辑器**

- `plugin/editor/`：FairyGUI Editor Online 编译版，换成 LGUI 品牌；`lgui editor` 打开它并提供实时会话中转，每次打开都从 `ui/` 重新读取；`lgui editor props` 在编辑器开着时改控件属性。

**规范和技能**

- `references/`：UI 开发规范、MVC 开发规范、用户工程目录、错误码、接入 Unity（阶段 3）。
- 技能：`lgui-setup`、`lgui-ui`、`lgui-code`、`lgui-verify`、`lgui-unity`（阶段 3）。

**示例**

- `examples/inventory/`：用新框架重写的背包示例（营地、背包、商店、领奖），用到框架的每一项功能。
