# 当前还原版与 Unity 的同步断点

状态更新（2026-10-16 10:40 UTC）：同源回写、保存重开、正式发布已通过，见 `../published/fidelity/publish-report.json` 和 `source-audit.json`；当前 Unity 运行适配与实际构建验收仍在进行。下列步骤保留为实施计划，不能全部当作已完成。

当前 `fidelity.ts` 手动创建 FairyGUI-dom 的组件，没有加载发布包的 `ComplexMain`。结构与美术已回写 `../project/Inventory.fairy`，响应式布局已提取为 `layout-shared.js` 供两端执行。旧复杂背包的 Editor/Player、跨端业务一致性证据不覆盖当前外观。

## 后续实施顺序

1. 拆分 `scripts/create-publish.mjs` 的工程生成和发布。它当前会从旧 roundtrip 工程重新复制并构造 1280×800 布局，直接重跑会覆盖后续修改；图片数 26 的硬编码也需移除。
2. 增量读取现有 Inventory 工程、按固定 ID 更新。保留包 `invtest1`、原五个资源、`cxmain01/cxslot01/cxdetl01/cxbtn001`、24 个 `icx` 图片以及 `cxback01`，新增美术使用稳定 ID 映射。
3. 导入页面实际引用的 skin 与 `detail-icons.json` 指向的裁边图，记录输入哈希；生成来源原图不作为运行资源全部打包。
4. 将 canonical 1586×992 的真实控件层级、独立属性文字、数量与选中框、菜单、按钮资源写入工程。动态列表使用引用 `ItemSlot` 的 `GList`；不能以当前普通容器冒充虚拟列表。
5. SDK 0.7.0 图片九宫需同时设置 `setScaleOption(1)` 与 `setScale9Grid([left, top, width-left-right, height-top-bottom])`。例如 370×65 的 primaryBg 四边 `[10,14,10,14]` 转为 `[14,10,342,45]`。CSS 四边数值不能原样传入。
6. 把响应式计算抽成无平台依赖的布局函数，浏览器和 PuerTS 使用相同产物。DOM 保留散图适配；Unity Host 替换旧布局重排、槽位与按钮的 DrawRect，`ItemStats` DTO 补齐 `crit/durability`。
7. 从保存后的正式工程纯发布并读回，浏览器改为加载包的 `ComplexMain`；再编译并实测 Editor 与 Windows x64 IL2CPP Player。验证资源引用、九宫、布局、文本和同一业务操作序列。

## 已确认的边界

- SDK 的 XML 与二进制写出均支持图片九宫；不是 SDK 缺少基础能力。
- 固定 FairyGUI-dom 版本仍需要散图映射，发布图片 `file=null` 的旧问题不会被九宫参数自动解决。
- 带固定透明孔的 canonical 面板不能直接用于响应式重排；重排继续使用空底和独立边框。
- 字体与换行须在 Unity 重新目视核对；透明装饰为生成提取结果，不能称为原图逐像素分层。
- 当前网页还原功能和较早 Unity 结果要分别标注，不能合并成“同一版已在两端通过”。
