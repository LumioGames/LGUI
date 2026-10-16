# LGUI

面向 Agent 创作、浏览器优先并可迁移 Unity 的 UI 原型。

这是一个独立的 FairyGUI 跨端验证工程，不是 LumioEngine 或 LumioGameNext，也不依赖这两个工程。它验证了 Agent 与网页编辑器共享编辑会话、纯 TypeScript 业务、独立浏览器 UI，以及 Unity 原生 UI 的迁移路径。

完整方案、踩坑和最佳实践见 [HTML 文档](交付/FairyGUI-跨端UI方案与最佳实践.html)。原始报告和证据保留各自阶段的结果；最新网页入口是 `/fidelity/`，旧 `/web/` 页面用于历史对照。

## 结构与复用边界

- `unity-migration/complex-inventory/shared/`：装备、消耗、出售、奖励、查询和 JSON 存档规则；直接组合 `prototype/shared/model.ts` 的奖励逻辑，共享层不依赖 DOM、Unity 或文件系统。
- `unity-migration/complex-inventory/fidelity/`：当前网页、皮肤和透明详情图、fixture、验收脚本；`layout-shared.js` 提供跨端几何及展示函数。
- `unity-migration/complex-inventory/project/`：正式 FairyGUI 源工程；`published/fidelity/` 为对应发布物，Unity 使用四页图集。
- `unity-migration/InventoryUnity/`：Unity 原生适配、场景和构建入口。
- `闭环验证/`：本地 Agent 会话桥、请求示例与编辑闭环记录。

网页使用 FairyGUI-dom 的真实 DOM 控件，当前 fidelity 页面在运行时分层组装；Unity 使用正式 ComplexMain / ItemSlot 包与 FairyGUI-unity 原生渲染，**不使用 WebView 或 Unity WebGL**。两端执行同一份业务 IIFE 与布局字节；原生使用共享 presentation，网页仍保留既有展示投影。控件、事件、字体测量、存储和释放由平台适配负责。

网页和 Unity 是独立会话与存储，共享存档 schema，不是在线状态同步。当前 fidelity 展示真实 24 个物品组件，`virtualList=false`；不要将旧压力测试结果视为此页面的规模性能结论。

## 准备依赖

本次基线为 Node.js 24.18.0、Unity **6000.6.6f1**、PuerTS Core / V8 **3.0.3**。Unity Windows IL2CPP 构建还需要对应模块及本机 C++ 工具链。

在仓库根目录先预检：

```sh
node scripts/bootstrap.mjs --dry-run
```

预检不等于安装完成。首次构建或验收前，显式恢复依赖：

```sh
node scripts/bootstrap.mjs --install
# 需要 Unity 本地 PuerTS 包时：
node scripts/bootstrap.mjs --install --unity
```

npm 依赖分属仓库根、`toolchain-test/` 和 `repos/editor-online/`，使用各自锁文件安装；SDK 0.7.0 与编辑器使用的 Core/backend/functions 0.2.4 不应混装。第三方检出、node_modules 和 Unity 本地包不入库，由 bootstrap 按固定来源恢复。`--unity` 不等于安装或激活 Unity 编辑器。

仓库保留原验证目录的相对层级。不要单独移动 complex-inventory：构建脚本仍引用奖励模型、编辑器构建依赖、FairyGUI-dom 及工具链目录。

## 运行当前网页

完成依赖恢复后，在仓库根执行：

```sh
node unity-migration/complex-inventory/scripts/build-app.mjs
node unity-migration/complex-inventory/fidelity/build-fidelity.mjs
node unity-migration/complex-inventory/scripts/serve.mjs
```

打开 **http://127.0.0.1:4182/fidelity/**。服务会占用当前终端；后续检查另开终端执行。

页面按窗口尺寸重排。固定设计为 1586×992；754/794 宽窗口为四列，486 为三列，390 为两列。图片保持主体比例，文字、数量、按钮和业务状态可交互。自适应不表示与设计稿逐像素相同。

## Unity 原生路径

依赖恢复后先同步正式资源：

```sh
node unity-migration/complex-inventory/scripts/setup-fidelity-unity.mjs
```

然后使用 Unity 6000.6.6f1 打开 `unity-migration/InventoryUnity/`。自动准备、生成互通代码、构建和测试入口为 `unity-migration/complex-inventory/scripts/run-fidelity.ps1`，顺序及参数见 HTML 文档。

保留 `Packages/manifest.json` 的相对路径、资源 `.meta` 与 PuerTS 兼容补丁。关闭 UI 仅释放视图和监听，业务 VM 保留；宿主退出才关闭应用并释放 VM。默认发行配置不开启文件命令测试泵，只有显式验证目录才启用。

## 验收状态

用户已明确表示**验收通过**。这与分阶段自动化结果分别记录：

- 网页 Chrome / Edge 控件专项各 182 条断言通过；窄窗与弹层专项各 74 条通过。它们不是物理输入法或手机验收，也不是逐像素视觉证明。
- 最近完整 Editor 运行的 28 条业务及生命周期断言通过；请求 794×727，实际 GameView 仍为 390×844，整体保留 `partial`。
- 最近完整 Windows IL2CPP Player 运行的 46 条业务及生命周期断言通过，但 canonical 说明第三行裁切，故当轮整体为 `failed`。
- 原生说明高度补丁随后已实施；末版 Windows x64 IL2CPP **Release 构建成功**。尚无补丁后 Player 运行复验报告，不能沿用旧 46 条宣称末版完整通过。当前未生成 ZIP。

历史 Development、旧页面和旧压力结果不并入新版通过数。源码、发布、编译、运行、视觉和用户接受是不同证据层级。

## 许可

仓库原创代码采用 [MIT](LICENSE)，Copyright © 2026 LumioGames。第三方代码、资源、品牌和依赖保留各自许可及来源记录；根 MIT 不改变其授权。Unity 编辑器、许可证和系统字体不随仓库分发。
