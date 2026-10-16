# 复杂背包接入路径（只读核查结果）

本文件是实施建议，不表示复杂版已实现或验收。未修改其他代码、启动 Unity/GUI 或安装依赖。固定源码：OpenFairyGUI `6e29ee2e8a4cf557579f3d374450f99d06152985`（已装 SDK 0.7.0），DOM `fade49fc33bdcd5673351e04637d4cc08d2297f3`，Unity `8cc8f214cca79685532eef13372d0a4f74acdf08`。

建议只建立一份复杂版 `complex-inventory/project/Inventory.fairy`：复制最终网页保存的 `验证/闭环验证/roundtrip-final/project/` 作为起点，保留旧快照与证据。DOM 和 Unity 都从这份新源发布，不分别维护两份 UI XML。不要重跑旧 `toolchain-test/create-project.mjs`，它会重建最初的简单 fixture。

## 资产到源工程

1. root 先保存参考图、图集原图及切片清单，如 `art/reference.png`、`art/ui-atlas.png`、`art/atlas-map.json`；清单记录每块图片的逻辑 key、源矩形、输出 PNG、尺寸、用途和 SHA256。整张参考图用于还原比对，实际控件仍用文本/组件构建，避免把界面截图当作可编辑 UI。
2. 将图集按清单切为独立透明 PNG（面板、边框、按钮、分类图标、物品图标等）。注册到包的是这些独立图片；Unity 正式 publisher 后续会重新打包自己的运行时图集。不要把美术 atlas 原图作为所有物品共同的单个 ImageResource。
3. 新建扩展脚本时复用 `toolchain-test/create-project.mjs` 的正式 Document/UAM 写入模式，但以 `NodeIO.readProject(复杂版路径)` 读取现有源。`getRoot().getPackageById('invtest1')`、`getResourceById('main0001')`、`getChildById('list')` 均为真实 API。图片通过 `createImageResource(...).setId(...).setFileName(...).setWidth(...).setHeight(...)` 注册，并用 `setSourceData(document.createBuffer().setURI(...).setMimeType('image/png').setData(bytes))` 提供源字节；最后 `liftDocumentToUamProject` + `writeProjectFromUam(new NodeIO(), uam, target)` 保存并重新读回。
4. 保留包 `invtest1` 及 Main=`main0001`、ItemRow=`itemrow1`、Reward=`reward01`、Btn=`button01`、原图 `icon0001`。新资源使用清单中分配的稳定唯一 ID。Main 原有 `title/search/list/update/reward/close/summary`，ItemRow 的 `icon/label/status/claim` 及 `state` 控制器可保留 ID/name；新增详情组件、筛选栏、容量/货币、排序、稀有度、选中框等。`state` 仍表示 locked/ready/claimed，稀有度/选中状态用独立 controller，避免改变旧状态含义。

动态图标建议保留 `icon` 节点 ID/name，把类型从固定 GImage 改成 GLoader；源默认 URL 和两端动态绑定均使用 `ui://invtest1<imageResourceID>`。业务只返回逻辑 iconKey，资源清单负责 key→ID/URL，不把平台文件路径放进共享状态。DOM 用 `row.getChild('icon').url=...`，Unity 用 `row.GetChild("icon").asLoader.url=...`。详情大图同理。两端 GLoader 均支持包内 image；Unity 自动取图集，DOM 从 manifest 修正后的 PackageItem.file 取散图。

## 网格的真实能力与当前适配冲突

SDK 的 `ListLayoutType.FlowHorizontal` 为 2，正式 XML 写作 `layout="flow_hz"`；使用 `setLayout(2)`、`setColumnCount(n)`、`setColumnGap(...)`、`setLineGap(...)`、`setDefaultItem('ui://invtest1itemrow1')` 和 Scroll overflow。两端都实现 FlowHorizontal 的虚拟列表；不要调用 SetVirtualAndLoop，源码明确不支持循环 Flow 网格。

先把 ItemRow 源尺寸改为实际格子尺寸（如 128×160，最终以参考图为准），再 SetVirtual，否则池内首个样板尺寸仍是旧 820×72。宽窄屏列数、格子间距和详情区折叠规则由两端同一布局规格计算；renderer 使用布局得到的格子宽度，不再强制撑满整张表。当前两个 adapter 都会覆盖设计：`prototype/dom.ts` 和 `InventoryHost.RenderRow` 写死 row.width=list.width、height=72，Layout 也写死列表与按钮位置；只改 Fairy 源并不能获得复杂网格。

复用行的事件仍需在点击时读取 row.data 当前 ID，不能捕获初次 index。renderer 每次必须覆盖图片 URL、数量、稀有度、选中、按钮状态等全部可复用属性，防止滚动后显示旧物品。先用新源加载少量格子确认尺寸，再启用完整虚拟网格与压力数据。

九宫格可用 ImageResource.setScale9Grid([x,y,width,height])，旧 DOM 的 Image.refresh 有 CSS borderImage 路径，但要实际对照视觉结果。**图片 fillMethod/fillAmount 在旧 DOM 的 Image.ts 中是空 setter**；进度/冷却条应使用已验证的图形宽度变化，或单独实现并验收 DOM 适配，不能仅凭 Unity 图片填充正常算双端通过。

## 发布、路径及独立网页启动

建议新增脚本输出到复杂版目录；以下名字是待实现建议，不是已有可直接运行的入口：

| 文件 | 建议职责 | 可复用的实际旧脚本 |
| --- | --- | --- |
| `complex-inventory/expand-source.mjs` | 从最终源副本增加图片、网格和详情，保存/读回/验证，输出 ID 与源哈希清单 | `toolchain-test/create-project.mjs` 的 Document API 用法 |
| `complex-inventory/publish-complex.mjs` | 同一源分别发布 Laya profile 与 Unity，输出源/发布/图片映射证据 | `unity-migration/scripts/publish-unity-assets.mjs`、`闭环验证/publish-browser-export.mjs` |
| `complex-inventory/build-web.mjs` | 编译新 DOM adapter 与同一复杂业务 IIFE，拷 vendor/license、图片及 manifest | `验证/scripts/build.mjs`、`unity-migration/scripts/build-ts.mjs` |
| `complex-inventory/serve-complex.mjs` | 仅监听127.0.0.1，静态服务复杂版 web 目录，使用独立空闲端口 | `验证/scripts/serve.mjs` 的 MIME、路径边界、no-store |

实际已有独立浏览器入口：`prototype/web/index.html`→`dom.js`→本地 `vendor/fairygui.module.js`，无 Unity/Laya/Cocos 运行时。构建 `node 验证/scripts/build.mjs`，预览 `node 验证/scripts/serve.mjs`，默认 4179；这是旧 prototype。最终网页闭环版本位于 `闭环验证/roundtrip-final/web/`，`node 验证/闭环验证/serve-roundtrip.mjs` 固定服务该目录、端口 4181。**两条旧入口均不会自动指向 complex-inventory**，不要用旧页面截图验新源。复杂版应有独立新入口并记录其根目录/端口；用 HTTP 打开，不能 file://。本轮未启动服务。

DOM 发布资源链已实测的原理：

`源独立 PNG → 源 ImageResource → 正式 publishNode(Laya profile=4, compressed:false, fui) → Inventory.fui 复制到 web/assets/Inventory/package.xml；源独立 PNG 通过正式 Backend.readResourceBytes 导出到同目录 <resourceID>.png → manifest.json → await UIPackage.loadPackage 后，createObject 前按 ID 将 pkg.getItemById(id).file 设为散图绝对 URL`。

`package.xml` 在这里是 DOM 固定请求名，内容仍是 FGUI 二进制；不是 XML，也不是原生 DOM 发布 lane。其 compressed 标志不能打开，旧 DOM 只读取该位没有解压。图集也不能直接冒充散图：旧 GImage/GLoader 使用 PackageItem.file，不取 Unity/Laya sprite atlas 矩形。现有正式读取图片的范例是 `toolchain-test/export-dom-images.mjs`（Backend session+expectedRevision）及 `闭环验证/publish-browser-export.mjs`。复杂版保持单 Inventory 包、PNG 源图即可复用该窄适配；多包需要每包独立目录，不能循环覆盖同一个 package.xml。只拷 vendor/入口到新 web，避免旧 assets 残留掩盖缺失资源。

Unity 资源链：

`同一源 PNG → 正式 publishNode(ProjectType.Unity=0, compressed:false, bytes, plugins:[], codeGeneration:false) → Inventory_fui.bytes + Inventory_atlas*.png → Assets/Resources/InventoryUI/ → UIPackage.AddPackage("InventoryUI/Inventory") → sprite ID → NTexture(图集rect/旋转/offset)`。

旧 Unity publisher 硬编码旧 ZIP 哈希、旧标题、恰好 5 个资源与恰好 2 个输出；复杂版须按新的资源契约/manifest 核验，保留旧测试证据，不直接取消所有校验。多页图集必须全部拷贝。旧 setup-project.mjs 只列 atlas0，且复制 force:false，复杂版还需显式刷新 JS 与全部图集，避免旧 Resources 假通过；只更新明确的验证资源文件，不重写 Packages/ProjectSettings。PNG 导入设置与字体仍由 root 现有 Unity 管线负责。

## 两端业务与验收接线

建议复杂版 DOM 也消费业务 agent 提供的同一个 IIFE/global dispatch 协议，停止实例化旧 `prototype/shared/model.ts` 的简单 Inventory；Unity 对应 Eval 同一字节产物的 Resources/InventoryApp.txt。两端共享复杂业务规则、操作名、DTO 和 iconKey 清单；仅 UI 事件/布局/资源装载分别适配。Host 需更新 AppView/Item DTO、Render、RenderRow、Layout、ShowReward/详情绑定；仍保持全局 env 跨开关、每帧一次 Tick、OnDestroy 才 Dispose。UI-only 选中效果与业务 selectedId 的归属需先约定，避免两端各维护一套选择状态。

交付前核对新源 hash、旧组件/节点 ID 保留、新资源完整性与图集页；浏览器等待所有散图 decode 后截宽窄屏，与参考图对照。再验证网格选择、筛选排序、详情、物品操作、滚动复用、弹窗、关闭重开与两端同一操作序列状态一致。真实点击/滚轮/输入与直接 dispatch 分开。原简单版 Unity native 拖拽未通过，不能在复杂版沿用“已通过”。虚拟格子数量与总数据量、JSON payload 和日志开销分别记录，不能把视觉复杂度或虚拟化等同于性能通过。

## 固定源码定位

- [SDK Document 创建入口](https://github.com/OpenFairyGUI/OpenFairyGUI/blob/6e29ee2e8a4cf557579f3d374450f99d06152985/packages/core/src/document.ts#L173)、[网格 XML 写入](https://github.com/OpenFairyGUI/OpenFairyGUI/blob/6e29ee2e8a4cf557579f3d374450f99d06152985/packages/core/src/io/display-object-xml-list-writer.ts#L20)。
- [DOM 包固定请求与装载](https://github.com/fairygui/FairyGUI-dom/blob/fade49fc33bdcd5673351e04637d4cc08d2297f3/src/ui/UIPackage.ts#L74)、[GImage 散图路径](https://github.com/fairygui/FairyGUI-dom/blob/fade49fc33bdcd5673351e04637d4cc08d2297f3/src/ui/GImage.ts#L78)、[Image 九宫格/空 fill 实现](https://github.com/fairygui/FairyGUI-dom/blob/fade49fc33bdcd5673351e04637d4cc08d2297f3/src/core/Image.ts#L103)、[虚拟网格限制](https://github.com/fairygui/FairyGUI-dom/blob/fade49fc33bdcd5673351e04637d4cc08d2297f3/src/ui/GList.ts#L1091)。
- [Unity 图集 sprite 装载](https://github.com/fairygui/FairyGUI-unity/blob/8cc8f214cca79685532eef13372d0a4f74acdf08/Assets/Scripts/UI/UIPackage.cs#L1350)、[虚拟网格](https://github.com/fairygui/FairyGUI-unity/blob/8cc8f214cca79685532eef13372d0a4f74acdf08/Assets/Scripts/UI/GList.cs#L1450)。
