# Topic：Cocos 后端（M1 解法图）

评估日期 2026-11-07。结论：**可行，比接 Unity 的起点更好**——LGUI 的 UI 管理不绑引擎（UIManager 五层栈等全部住在 mvc/，只依赖 Backend/Platform 两个接口），写完适配层整套白得；fairygui-cocos fork 已把「FairyGUI 控件树 ↔ cc Node 树」的桥搭完（GObject 1:1 持有 cc.Node，渲染/布局/命中/transition/gear/tween 落在 CC 3.8.2，带 16 包回归场）。架构契约细节见 llmdoc `runtime/framework.mdx`。

## 运行时基座

`/Users/jambo/Documents/workspace/fairygui-cocos`（= github.com/aloasut/fairygui-cocos）：官方 FairyGUI-cocoscreator `ccc3.0`（基点 `cd19b70`）+ 去编辑器化增量（XMLPackageReader/Builder，运行时 XML 直载）。MIT。上游口径 CC 3.4+，demo 实测 3.8.2。

## Backend 契约映射（全顺）

| Backend 接口 | fairygui-cocos 对应 | 判断 |
|---|---|---|
| init/root | GRoot（适配层自管挂载，绕开 `GRoot.ts:36` 的 `'Canvas'` 硬编码） | ✅ |
| loadPackage/releasePackage | `UIPackage.loadPackage(bundle,path)` 二进制链；LGUI unity 分支产物（`<包名>_fui.bytes`+图集）就是标准 FairyGUI 二进制包 | ✅ 格式直接复用 |
| create | `UIPackage.createObject` + 包装 UIComponent（照 h5 `index.ts:45-52`） | ✅ |
| setLanguage | TranslationHelper + 卸载重载包（搬 h5 `index.ts:53-63` 方案） | ✅ |
| has / imageSize / createImage / createContainer | getItemByName / item.width,height / GLoader / new GComponent | ✅ |

## Platform 契约：运行库缺、Cocos SDK 补

| 服务 | 现状 | 补法 |
|---|---|---|
| time/visibility | dt 有，前后台无 | cc.game EVENT_HIDE/SHOW + 自记单调时钟 |
| storage | 无 | `sys.localStorage` |
| input.onPointer | InputProcessor 已监听 touch/mouse/wheel | 同款事件源喂 LGUI 手势层，坐标过设计尺寸逆变换 |
| input.onKey | **无** | cc keyboard；Back 返回键留原生阶段 |
| textInput.isComposing | EditBox 有，IME 状态未暴露 | Web 端 DOM composition 事件（风险点） |
| screen.safeArea | 无 | `sys.getSafeAreaRect()` |
| audio | playOneShotSound 先例 | music 淡入淡出/解锁照 h5 搬 |
| locale/net/log | 无/无/无 | `sys.language`；XHR+WebSocket 全局可用；logger 直通 |

## 工作量与结构

参照体量：h5 后端 index 88 行 + objects/ + platform/；unity 适配层约 1200 行。cocos 后端 ≈ 800–1200 行：`plugin/framework/backends/cocos/{index,objects/,platform/}` + `plugin/tools/lib/generate/cocos.mjs`（大概率复用 unity 的 setProjectType(0) 产物，布局按 Q2）+ conformance 桥（Q3）。

## 已知坑

- fork 基点落后上游 149 commits，动手前 rebase（T004）
- `'Canvas'` 挂载硬编码、单 GRoot 假设 → 适配层自管
- dragonBones 私有 API（`GLoader3D.ts:280`）→ 封一层，按需加载
- XML 直载链粒度粗（整组件同步组装）→ 不影响 M1（走二进制链）
