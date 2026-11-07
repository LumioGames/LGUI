# 证据：T005 backends/cocos 骨架落地（2026-11-07）

## 产出

`plugin/framework/backends/cocos/`（发布面，init.mjs frameworkParts 已加入随插件分发）：

- `vendor/fairygui.mjs`（875 KB，fairygui-cc 1.2.2 构建，上游基点 cd19b70）+ `vendor/fairygui.d.mts`（手写类型子集，同 h5 vendor 先例）+ `vendor/cc.d.ts`（引擎类型子集，ambient `declare module 'cc'`，只进本仓库工具链，不进用户工程 tsconfig）+ `VERSION.md`（来源与拷入日期）
- `screen.ts`（fitDesign 同 h5；toWorld 假设根节点贴屏幕左上角）、`pointer.ts`（FGUI 事件 → PointerInput；事件池化复用故不做按对象缓存）、`ime.ts`（Web 组字跟踪）
- `objects/index.ts`（h5 429 行全量移植；差异：事件常量 `fui_*`、`_finalVisible` 替代 internalVisible2、`promptText` 属性、Controller 继承 cc.EventTarget、滚轮只有纵向量）
- `platform/`（time 挂 FrameDriver 组件、storage=sys.localStorage、resource=bundle `lgui-ui`、input=根节点冒泡事件、screen=fitDesign+sys.getSafeAreaRect、audio=AudioSourceComponent 常驻通道、locale=sys.language、net/clipboard=Web API、log=console）
- `index.ts`（createCocosBackend；根节点自管挂载，绕开 GRoot.create 的 'Canvas' 硬编码）
- 契约打通：`core/backend.ts` 与 `mvc/lgui.ts` 的 backend 联合类型加 `'cocos'`；`tools/lib/commands/init.mjs` frameworkParts 加 `backends/cocos`

## 验证

- 严格 TS 类型检查（tests/helpers/ts.mjs 的 typecheck，lib 含 dom）：**11 个文件 0 错误**
- `tests/unit/init.test.mjs` 3/3、`tests/unit/upgrade.test.mjs` 通过（copyFramework 覆盖新目录）
- `npm run check` 通过（plugin/ 177.07 MB / 1402 文件 / 27 个 md 链接）

## 遗留给 T007 的运行时校准清单（骨架是「类型正确 + 语义移植」，未在引擎里跑过）

1. 包加载路径细节：`loadPackage(bundle, name)` 对 `<包名>/<包名>_fui.bytes` 的解析约定
2. `toWorld()` 的根节点挂载假设（贴屏幕左上角、y 向上换算）与 hitTest 坐标空间
3. 滑动条/下拉框/控制器是否都派发 `fui_status_changed`；GList click_item 的 `initiator` 形状
4. GRoot.setScale + setSize 与 fork 自带 UIContentScaler 是否双缩放
5. Web Audio 自动播放解锁在 cc AudioSourceComponent 上的实际行为；音乐淡入淡出时长
6. `fgui.Event.data`（C# 对齐的 data 字段）在本运行库的确切形状
