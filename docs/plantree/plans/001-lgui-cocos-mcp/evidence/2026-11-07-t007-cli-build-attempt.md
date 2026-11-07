# 证据：T007 无头构建尝试（2026-11-07）

## 尝试

`/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/MacOS/CocosCreator --project <testbed> --build "platform=web-mobile;debug=true"`

结果：10 秒即败，`execute-task buildScriptCommand failed with code -1`（随后一条遥测 TypeError 是噪音）。

判读：工程从未被 Creator 打开过——`temp/tsconfig.cocos.json`、`temp/declarations/`（引擎类型）、library 导入都不存在，构建子进程起不来。**首次导入必须 Creator GUI 打开一次**，之后 CLI 构建可用于迭代验证。

## 顺带落定

- 本机 Creator 版本是 **3.8.8**（Dashboard 里还有 3.6.0/3.8.0，没有 3.8.2）——版本锚定从 3.8.2 修正为 3.8.8（仍在 decisions/002 的 3.8.x 内）；testbed package.json 已改。
- Boot.ts 增加**不依赖场景挂件**的自动启动：`director.once(EVENT_AFTER_SCENE_LAUNCH)` 顶层钩子跑冒烟——为无头验证铺路。
- 场景：fork demo 的 `demo.scene`（纯 cc.* 组件，无自定义脚本引用）拷入为 `assets/main.scene`。
- `assets/lgui-ui.meta` 预写为 bundle（isBundle + bundleName lgui-ui），CC 导入时接受或重写。

## 下一步（等一次 GUI 打开）

1. Dashboard 用 3.8.8 打开 testbed → 自动导入（生成 temp/、library/、全部 meta）。
2. 之后同一台机器的 CLI 构建应可用 → 产物起静态服务 → 用随插件的 playwright-core 读控制台 `lgui_smoke`，无头清校准清单。


## 第二次构建（修掉 h5 vendor 与 Boot 语法后）：拿到决定性校准结论

- 已修：testbed 框架副本不再含 h5 后端（其 vendor `.js` 被 CC 当 CJS 报错）；Boot.ts 语法修复。
- 新错误（精确）：`fairygui.mjs:9914 TypeError: Class extends value undefined` —— assets 里的 `.mjs`（内部 `import ... from 'cc'`）在 CC 的 SystemJS 执行器下拿不到 cc 绑定。**T005 的 vendored-进-assets 路线不成立**。
- 结论与下一步：改走 demo 验证过的 **node_modules 依赖**路线——`backends/cocos` 改 `import * as fgui from 'fairygui-cc'`；类型声明改为 ambient `declare module 'fairygui-cc'`；plugin 里不再带 fairygui.mjs；testbed 提交自含的 `testbed/vendor/fairygui-cc/`（dist 拷贝 + package.json），依赖写 `file:./vendor/fairygui-cc`（机器无关）。另：demo.scene 里残留 DemoEntry 脚本引用报 missing，后续清场景。
- 这是 T007 校准清单的正式产出之一（运行时验证的意义就在这）。


## 第三～八轮构建（CJS 路线）

- 已修：vendor package.json main 指向 fairygui.cjs；`cc/env` 用 esbuild alias 打进 shim（EDITOR=false）；恢复原始 demo.scene（我此前的场景手术破坏了 __id__ 索引——教训：CC 场景数组按 __id__ 定位，不能删元素）。
- 现状：ESM 与 CJS 两种格式都在 `Class extends value undefined` 上失败（CJS 走 CC 的 cjs-loader，`require('cc')` 无映射）。**官方 npm fairygui-cc 1.2.2 的 main 也是同一个 ESM**——问题不在我们的产物，在「node_modules 包引用 cc 外部」在 CLI 无头构建链上的解析。
- 下一步（基线对比法）：`npm i fairygui-cc@latest`（官方 registry 包）+ 直接无头构建 fork 自带的 `sdk/demo` 工程。demo 绿 → 对比它与我们工程的装载差异；demo 也红 → CLI 构建链对这类包有环境级问题，Creator GUI 预览（packer-driver 的 editor 目标）是真正裁决场，无头验证改走「构建产物 + 全局 cc」或其他路。
- 本机 ~/.CocosCreator/editor/layout.json、window.json 有 JSON 截断（Unexpected end of JSON input），疑似多次无头启动竞态，建议 GUI 打开一次顺便修复。


## 2026-11-08：lgui_smoke 全绿（桥接打通）

`init → create（Common/Button）→ portrait → language（en）→ done` 全部通过，无头链：CLI 构建 → 静态服务 → playwright 读控制台。

本轮排掉的四颗雷（全部是「官方包 + CC 工具链」的真实校准产出）：

1. **fork dist 类顺序损坏**：rollup 重排后 `GTextInput`(9914) extends 定义在 22245 行的 `GTextField`——任何运行时都加载不了。换官方 npm `fairygui-cc@1.2.2`（顺序正确）。
2. **.bytes 落兜底导入器**：CC 对 `.bytes` 的 meta importer 是 `*`，运行时 _nativeAsset 变 String（4844 < 4864 字节，UTF-8 损毁）→ parse 越界。demo 用的 `.bin` + importer "buffer" 才是二进制。generateCocos 改 fileExtension 'bin'（注意 'bin' 无 _fui 中缀：产物名 `<name>.bin`）；分组过滤器要同时认 `<name>.` 和 `<name>_`。
3. **官方 loadFromXML 直接收 XML 字符串**（内部 DOMParser），没有导出 XML 类——同 h5 的 `new fgui.XML` 写法不可移植。
4. **CC babel loose 模式把 `[...set]` 编译成 `[].concat(set)`**（整个 Set 变成一个元素）——框架里可迭代展开必须用 `Array.from`。cocos 后端已改 2 处；**剩余审计项：backends/cocos 7 处、mvc/core 19 处 `[...`，数组无害、Set/Map 全中招**——真 View 跑五层栈前必须清完。

其他修正：官方 loadPackage 的 bundle 路径 = `<包名>/<包名>.bin`（Raw Asset 带扩展名），两次尝试（带/不带扩展）全失败才报错；Handlers.emit 增加非函数诊断。


## 2026-11-08（续）：真 View 五层栈全绿

 跑通：MainView（page 层）→ ConfirmView（modal 层）→ setLanguage('en')（rebuildAll 重建）→ 快照确认 layer 栈。新增坑与修法：

- RuntimeConfig 字段名是 **designSize**（不是 design），sync 的 config 与框架 runtimeConfig（bundle.mjs）逐字段同构。
-  的运行时文本表走 boot 的 **texts 选项**（readTexts 同机制）——sync 现在从工程 i18n/*.json 生成 texts 一并传入。
- boot 不从框架 index 导出，直连 mvc/boot（生成的 h5 入口同样直连）。
- 教训重申：对生成文件/源码的 python replace 必须带 assert（两次静默 no-op 造成假信号）。
