# 更新记录

## 0.3.0（未发布）

和 0.2.0 不兼容：目录结构、命令行、框架都是新的。0.2.0 的全部内容在 tag `v0.2.0-final` 里。

**安装和工程**

- 发布面只有 `plugin/`；Claude Code、Codex 用仓库里的 marketplace 安装，其他客户端直接用 `plugin/` 目录。
- 用户机器上只需要 Node 24 或更高和 Chrome / Edge；TypeScript、esbuild、OpenFairyGUI 0.7.0、sharp、playwright-core 随插件提供（macOS arm64 / x64、Linux x64、Windows x64）。
- 用户工程：`ui/`（FairyGUI 格式，界面的唯一来源）、`src/`、`tests/`、`i18n/`、`.lgui/`（工程配置、框架副本、生成物）。

**命令行（`node <插件目录>/tools/lgui.mjs`）**

- `init`、`doctor`、`dev`（改动后自动刷新）、`check`（TypeScript + UI / MVC / 多语言规则）、`test`（headless 后端、假时钟；测试文件没跑起来也算失败）、`verify`（6 组尺寸 × 横竖，`--lang`、伪翻译）、`ui list`、`new module`、`new view`（四种排布模式）、`i18n extract`、`art split`、`upgrade`、`editor`、`editor props`、`unity export --to <Unity 工程>`。
- 所有命令支持 `--json`；错误都带错误码（`LGUI-CLI-xxx`、`LGUI-RT-xxx`、`LGUI-UI-xxx`、`LGUI-MVC-xxx`），见 `references/error-codes.md`。

**框架**

- MVC：`lgui.Model` + `pick`、View / ItemView / PartView 和绑定表、Controller、Service、`lgui.request`。
- UIManager：hud、page、popup、modal（队列）、toast 五层，激活和遮挡，`onClose` 交回结果，资源引用计数和关闭界面缓存。
- 横竖屏：按方向自动换 `@portrait` 版本，View 实例保留。
- 输入：手势（点击、双击、长按、拖拽、滑动、双指缩放、滚轮、悬停）、按键动作、返回键、操作提示栏、输入类型。
- H5 手势保留 DOM 输入实际发生的时间，避免主线程延迟把慢拖误成快滑；浏览器一致性测试按指定坐标和真实间隔派发触摸，不逐步等待驱动应答，不让应答迟到拉长动作。
- 多语言：`lgui.t`、复数、格式化、运行时切换语言、带字图片、伪翻译。
- 定时器（跟着界面暂停和取消；回调出错时照常报错，不影响别的定时器和以后的帧）、广播站、红点、按钮音效、图片占位、通用弹窗（提示、确认、加载中）、ArtText 美术字、`lgui.time.wait`。
- 后端：h5（FairyGUI-dom，带补丁）、headless（测试用）、Unity（FairyGUI-unity + PuerTS）；共享一致性用例和快照捕获器。

**Unity**

- Unity 6000.6.x + PuerTS Core/V8 3.0.3 本地包。`unity export` 核对固定文件摘要，应用四处 Unity 6.6 兼容补丁，安装 Unity 包并生成启动场景；已有场景保留。
- 同一份 `ui/`、`src/`、`i18n/` 生成 Unity 界面包、图集、翻译和 `game.js.txt`，放入 `Assets/LGUI/Resources/`；同时导出 `Assets/LGUI/link.xml` 保留动态调用。`upgrade` 同步已配置的 Unity 包。
- Unity 适配层连接控件、列表、控制器、动效、原始输入和平台服务；图片请求共享和释放跟随宿主、控件生命周期。WebSocket 暂未实现，明确报告 `LGUI-RT-001`。
- 生成 UI 图集由包内 Editor 导入器关闭 mipmap，范围限定为有对应界面包的 LGUI 图集。
- 修复 ArtText 改字后旧字符图片未释放、Unity 父界面递归销毁后子容器仍被记录；列表写入不同滚动目标时同步提交，避免旧惯性覆盖重建前的位置；普通 modal 并发申请按 FIFO 排队，前项失败或取消不会阻塞后项。
- Unity HTTP 启动的同步失败明确结束 Fetch、图片和音频请求；宿主关闭后的旧回调隔离。背包示例的领奖图标通过真实 PartView 组件声明图片包依赖，确认弹窗保留文本键与参数以随语言重建。
- IL2CPP 使用 PuerTS Reflection Mode 生成必需原生桥，不依赖类型静态 wrapper。Unity 接入文档和技能包含本地安装、导出、Release 打包、横竖屏检查及错误处理。

**编辑器**

- `plugin/editor/`：FairyGUI Editor Online 编译版，换成 LGUI 品牌；`lgui editor` 打开它并提供实时会话中转，每次打开都从 `ui/` 重新读取；`lgui editor props` 在编辑器开着时改控件属性。

**规范和技能**

- `references/`：UI 开发规范、MVC 开发规范、用户工程目录、错误码、接入 Unity。
- 技能：`lgui-setup`、`lgui-ui`、`lgui-code`、`lgui-verify`、`lgui-unity`。

**示例**

- `examples/inventory/`：用新框架重写的背包示例（营地、背包、商店、领奖），用到框架的每一项功能。
