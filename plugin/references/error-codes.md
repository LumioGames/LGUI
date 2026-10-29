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
| `LGUI-CLI-030` | `lgui dev` 的端口已经被占用 | 在 `.lgui/project.json` 里改 `devPort`，或者加 `--port <端口>` |
| `LGUI-CLI-031` | 缺少某种语言的文本表，或者文本表不是合法的 JSON | 新建或修好 `i18n/<语言>.json` |
| `LGUI-CLI-032` | 打包 `src/` 失败（语法错误、找不到 import 的文件等），带文件和行号 | 按提示改代码 |
| `LGUI-CLI-040` | `tests/` 里没有测试文件（`*.test.ts`） | 在 `tests/` 下写测试，写法见 mvc-spec.md 第 12 节 |
| `LGUI-CLI-041` | 测试没通过（报错里附上测试结束时的界面状态快照） | 看测试输出，按断言改代码或测试 |
| `LGUI-CLI-050` | `lgui check` 读不了 `tsconfig.json` | 用 `lgui init` 生成的 `tsconfig.json`，不要改它 |
| `TSxxxx` | `lgui check` 报的 TypeScript 类型错误（错误码是 TypeScript 自己的） | 按提示改；控件名和类型以 `lgui ui list` 为准 |
| `LGUI-CLI-060` | `lgui verify` 没找到 Chrome 或 Edge | 装一个 Chrome 或 Edge |
| `LGUI-CLI-061` | `--size` 写的验证尺寸不存在 | 用工程配置 `verifySizes` 里的名字 |
| `LGUI-CLI-062` | `--lang` 写的语言工程不支持 | 用 `languages` 里的语言，或者 `pseudo` |
| `LGUI-CLI-063` | `--view` 写的 View 在 `src/modules/` 里没有导出 | 写 View 的类名 |
| `LGUI-CLI-064` | 截图时页面报错 | 按报错改代码；`lgui dev` 里能看到同样的错误 |
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
| `LGUI-RT-090` | 文本表里没有这个键（界面上显示键名） | 在每种语言的 `i18n/<语言>.json` 里加上它 |
| `LGUI-RT-100` | `lgui.request` 超时（工程配置 `requestTimeoutMs`，默认 10 秒） | 检查网络；需要更长时间就改配置 |
| `LGUI-RT-101` | `lgui.request` 里的请求失败了（报错里带原因） | 看 Service 返回的错误 |
| `LGUI-RT-102` | 用了没有注册的服务 | 在 `main.ts` 的 `lgui.app({ services })` 里注册；测试里用 `lgui.testing.start(app, { services })` |
| `LGUI-RT-110` | 在 `lgui test` 以外用了 `lgui.testing` | 用 `lgui test` 跑测试 |
| `LGUI-RT-111` | 测试里的控件路径找不到（界面没打开、控件名不对、列表没有这一项） | 用 `lgui ui list` 查看真实路径；路径写成 `包/组件.控件路径`，列表子项写 `list[序号]` |
| `LGUI-RT-112` | 测试结束时（`t.end()`）关掉所有界面后，还有界面或包没清理 | 检查是不是有界面没走 `lgui.ui` 关闭 |
| `LGUI-RT-120` | 红点路径写法不对 | 写成用「.」分隔的英文名，比如 `bag.newItem` |
| `LGUI-RT-130` | ArtText 要显示的字符没有对应的图片（报错里写明是哪个字符） | 在字体目录下加上这个字符的图片，登记进 `package.xml` 并导出 |
| `LGUI-RT-140` | 切换到工程不支持的语言 | 在 `.lgui/project.json` 的 `languages` 里加上它，并新建 `i18n/<语言>.json` |
| `LGUI-RT-141` | 网页端读不到这种语言的翻译文件 | 重新运行 `lgui dev` 生成翻译文件 |
| `LGUI-RT-027` | 后端还没启动就开始用 | 先调用 `backend.init(config)`（框架启动时会自动调用） |
