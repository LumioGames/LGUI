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
