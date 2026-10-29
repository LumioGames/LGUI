# 错误码

LGUI 的每条报错都带错误码，并写明：哪个文件哪一行（如果有）、出了什么问题、下一步怎么改。

| 前缀 | 来自 | 说明 |
|---|---|---|
| `LGUI-CLI-xxx` | 命令行 | 见下表 |
| `LGUI-RT-xxx` | 运行时 | 见下表 |
| `LGUI-UI-xxx` | UI 开发规范的检查规则 | 见 [ui-spec.md](ui-spec.md) 第 13 节 |
| `LGUI-MVC-xxx` | MVC 开发规范的检查规则 | 见 [mvc-spec.md](mvc-spec.md) 第 13 节 |

## LGUI-CLI-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
| `LGUI-CLI-000` | 这条命令还没实现（开发中的功能） | 换一条已经实现的命令，或者等新版本 |
| `LGUI-CLI-001` | 没有这条命令 | 看报错里列出的全部命令，或者运行不带参数的 `lgui` |
| `LGUI-CLI-002` | 当前目录往上都找不到 `.lgui/project.json`，不在 LGUI 工程里 | 先运行 `lgui init`，或者 cd 到工程目录里 |
| `LGUI-CLI-003` | 工程里的框架版本（`lguiVersion`）和插件版本不一致 | 运行 `lgui upgrade` |
| `LGUI-CLI-004` | `.lgui/project.json` 读不了，或者字段缺了、类型不对、多了不认识的字段 | 按 `project-layout.md` 的字段表改 |
| `LGUI-CLI-005` | 当前平台不受支持。随插件带的 esbuild 和 sharp 只有 macOS arm64、macOS x64、Linux x64（glibc）、Windows x64 这 4 个平台的版本；Linux musl、Linux arm64、Windows arm64 都不支持 | 换到上面 4 个平台之一运行 |
| `LGUI-CLI-006` | 命令的参数不对：不认识的参数、开关带了值、要值的参数没给值 | 看报错里列出的能用的参数 |
| `LGUI-CLI-010` | `lgui init` 的目标目录已经存在而且不是空的（不会覆盖） | 换一个新目录，或者先清空 |
| `LGUI-CLI-011` | 插件里缺少要复制进工程的框架文件 | 插件不完整，重新安装 LGUI 插件 |
| `LGUI-CLI-020` | `ui/UI.fairy` 找不到，或者 OpenFairyGUI 校验界面工程没通过（报错里逐条列出 OpenFairyGUI 给的问题） | 按提示改 `ui/` 里对应的文件 |
| `LGUI-CLI-021` | 生成界面包时缺文件：OpenFairyGUI 没生成某个包，或者 `package.xml` 里登记的图片文件不存在 | 把图片放回 `package.xml` 写的位置，或者删掉这条资源 |
| `LGUI-CLI-999` | 命令行内部错误（LGUI 自己的缺陷） | 把输出报告给维护者 |

## LGUI-RT-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
| `LGUI-RT-001` | 当前后端或框架还没实现这项功能（开发中） | 换到已经实现的后端，或者先不用这项功能 |
| `LGUI-RT-002` | 创建界面时它所在的界面包还没加载 | 先加载这个包（UIManager 打开界面时会自动加载） |
| `LGUI-RT-003` | 界面包里没有这个组件 | 用 `lgui ui list` 查看有哪些组件 |
| `LGUI-RT-010` | 网页端的散图映射 `manifest.json` 格式不对，或者里面没有某个包、某张图片 | 重新运行 `lgui dev` 生成界面包 |
| `LGUI-RT-011` | 网页端加载界面包失败（地址不对或文件不存在） | 确认包名对，并重新运行 `lgui dev` |
| `LGUI-RT-020` | 颜色的格式不对 | 写成 `#rrggbb` |
| `LGUI-RT-021` | 列表设成虚拟列表以后又想改回去 | 在第一次给数据之前决定要不要虚拟列表 |
| `LGUI-RT-022` | 控制器没有这个页名 | 看报错里列出的页名 |
| `LGUI-RT-023` | 把一个不是组件的控件当成组件用 | 检查 `ui/` 里这个控件的类型 |
| `LGUI-RT-024` | 混用了不同后端创建的对象 | 不要混用 |
| `LGUI-RT-025` | 图片加载失败 | 确认地址对、文件存在 |
| `LGUI-RT-026` | 音效加载失败 | 确认地址对、文件存在 |
| `LGUI-RT-030` | 列表没有设置子项组件（`defaultItem`）就给了数据 | 在 `ui/` 里给列表设置 `defaultItem` |
| `LGUI-RT-031` | 子组件引用的组件不存在 | 在 `ui/` 里修好引用，再重新生成 |
| `LGUI-RT-032` | 测试里点了一个点不到的控件（自己或上级没显示、不可用或不接收输入） | 检查控件和它所在的界面是不是显示、可用、激活 |
| `LGUI-RT-040` | 同一个事件名声明了两次 | 换一个名字，或者 import 已经声明的那个 |
| `LGUI-RT-050` | 框架还没启动就用了需要后端的功能（时间、界面等） | 用 `lgui dev` 预览，或者在测试里先调用 `lgui.testing.start(app)` |
| `LGUI-RT-060` | View 缺少必填的 static（`component`、`layer`），或者值不对 | 照 mvc-spec.md 第 6.2 节写 |
| `LGUI-RT-061` | View 写了 7 项以外的 static（ItemView、PartView 只能写 `component`） | 删掉多出来的 |
| `LGUI-RT-062` | 绑定表的键在组件里找不到（不是控件、控制器，也不是点号路径） | 用 `lgui ui list` 查看真实的名字；改了 `ui/` 要重新生成 |
| `LGUI-RT-063` | 绑定表用了词表以外的词，或者这个词不能用在这种控件上 | 见 mvc-spec.md 第 6.4 节的词表 |
| `LGUI-RT-064` | 列表的 `item`、部件的 `view` 写得不对（缺少、或者对应的组件不一致） | 让 ItemView / PartView 的 `static component` 和 `ui/` 里的组件一致 |
| `LGUI-RT-065` | 界面还没打开或已经关闭时用了 `this.ui` | 只在生命周期钩子里用 `this.ui` |
| `LGUI-RT-070` | 图片加载失败，显示占位图 | 确认图片地址对、能访问 |
| `LGUI-RT-080` | 打开界面失败（界面包加载失败、组件不存在、绑定出错等），不会显示打开了一半的界面 | 按报错里的原因改 |
| `LGUI-RT-081` | 界面在打开的过程中（或在 modal 队列里排队时）被关闭了，这次打开已取消 | 一般不需要处理 |
| `LGUI-RT-082` | 关闭一个没有打开的界面（只记日志，不算错误） | 不需要处理 |
| `LGUI-RT-083` | `popTo` 的目标界面没有打开 | 先确认它已经打开 |
| `LGUI-RT-027` | 后端还没启动就开始用 | 先调用 `backend.init(config)`（框架启动时会自动调用） |
