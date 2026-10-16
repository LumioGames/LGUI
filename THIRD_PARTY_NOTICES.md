# 第三方组件与素材通知

本仓库的 MIT 许可适用于 LumioGames 为本次验证新增的原创代码、平台桥、脚本和文档。它不重新许可第三方源码、编辑器 UI、品牌、原生库、字体或图片。固定版本、来源、补丁与完整性校验值见 [`dependencies.lock.json`](dependencies.lock.json)；原许可副本见 [`patches/licenses/`](patches/licenses/)。依赖在用户显式执行 bootstrap 时从上游获取，`repos/`、`node_modules/`、PuerTS 原生包及 Unity 安装程序不作为本仓库的源码文件发布。

## 运行时与编辑工具

| 组件 | 本次固定版本 | 许可与应保留的署名 |
| --- | --- | --- |
| [FairyGUI-dom](https://github.com/fairygui/FairyGUI-dom/tree/fade49fc33bdcd5673351e04637d4cc08d2297f3) | `fade49fc33bdcd5673351e04637d4cc08d2297f3` | MIT，Copyright © 2021 FairyGUI；保留根 LICENSE 与源码内通知 |
| [FairyGUI-unity](https://github.com/fairygui/FairyGUI-unity/tree/8cc8f214cca79685532eef13372d0a4f74acdf08) | `8cc8f214cca79685532eef13372d0a4f74acdf08` | 根 MIT，Copyright © 2015 fairygui.com；只复制 `Assets/Scripts`，同时复制原 LICENSE |
| [FairyGUI Editor Online](https://github.com/OpenFairyGUI/FairyGUI-Editor-Online/tree/45f0bef93bb16d507552b673ace6d5af417a8a0f) | `45f0bef93bb16d507552b673ace6d5af417a8a0f` + 本仓库 11 文件补丁 | 原创代码/文档 MIT，Copyright © 2026 FairyGUI Editor Online contributors；保留 LICENSE、THIRD_PARTY_NOTICES 与 TRADEMARKS |
| [OpenFairyGUI](https://github.com/OpenFairyGUI/OpenFairyGUI) | 工具链 core/functions/backend/cli/mcp `0.7.0`；网页编辑器自身 backend/cli/core/functions `0.2.4` | MIT，Copyright © 2026 OpenFairyGUI Contributors；两组隔离安装，不能混用版本 |
| Editor Online 内嵌 LayaAir | 冻结运行时 `3.3.10` | MIT，Copyright © 2022 layabox；路径 `assets/laya/`、`engine/types/`，属于编辑工具运行依赖 |
| Editor Online 内嵌 FairyGUI-Layabox | 编辑器提交所固定的版本 | MIT，Copyright © 2015 fairygui.com；保留内嵌 easing 与 zlib.js/imaya 通知 |

FairyGUI-dom 的 `src/tween/EaseManager.ts` 和 FairyGUI-unity 的 `Assets/Scripts/Tween/EaseManager.cs` 含 Daniele Giardini/DOTween 条款链接及 Robert Penner 的 BSD 声明。FairyGUI-unity 的 `Assets/Scripts/Core/Text/RTLSupport.cs` 另有 Copyright © 2018 Tadpole Studio、All rights reserved；本次只确认该声明存在，未单独取得其授权链证明。保留上游文件及通知，不能把这些嵌入部分称为 LGUI 原创 MIT 代码。

Editor Online 的官方 UI 工程、图标与生成包沿用上游资源。官方 README 声称 UI 工程可自由使用，但未见独立标准 LICENSE；上游提及的口头授权不自动延伸至 fork。更名 LGUI 不授予 FairyGUI 官方名称、Logo、品牌或官方背书。公开源码补丁和依赖下载步骤不代表已完成官方 UI/品牌再发行授权核查；若另行分发编辑器构建，需要保留上述通知并单独核实资源许可。

本仓库不包含官方桌面 FairyGUI 编辑器二进制，也不授予其专业版命令行许可。OpenFairyGUI 发布能力与 C# 代码生成不等同于通用 PuerTS TypeScript/AOT 委托绑定能力。网页编辑工具依赖 LayaAir；本次独立 DOM 游戏页面使用 FairyGUI-dom，不加载 LayaAir 游戏引擎。

## npm 与图像依赖

插件工程化新增根验证依赖：Ajv 8.20.0（MIT）、yaml 2.9.1（ISC）和 node-tar 7.5.22（BlueOak-1.0.0）；完整解析版本、传递依赖和 integrity 留在根 package-lock.json。它们仅在用户工作区或维护者 checkout 恢复，不随包携带 node_modules。

`tools/schemas/agent-plugin-1.0.0.schema.json` 来自 [Agent Plugins 官方 schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)，于 2026-10-16 获取，未修改内容。按[上游许可](https://github.com/agentplugins/agent-plugins-spec/blob/main/LICENSE.md)，schema 与软件采用 Apache-2.0，文档采用 CC BY 4.0；此 schema 的 Apache-2.0 副本保留在 [tools/schemas/Apache-2.0.txt](tools/schemas/Apache-2.0.txt)，不属于 LGUI 原创 MIT。

各目录的 `package-lock.json` 保留完整解析版本、下载地址和 integrity。bootstrap 使用 `npm ci --ignore-scripts --include=optional --no-audit --no-fund`，不执行依赖安装生命周期脚本，不自动下载浏览器二进制。以下是主要已核对依赖，不能替代全部传递依赖的通知集合：

| 组件 | 工具链已解析版本 | package 声明许可 |
| --- | --- | --- |
| fast-xml-parser / fast-xml-builder | 5.11.2 / 1.3.1 | MIT |
| strnum / @nodable/entities | 2.5.1 / 3.1.0 | MIT |
| jpeg-js | 0.4.4 | BSD-3-Clause |
| pako | 2.2.0 | MIT AND Zlib |
| property-graph | 4.1.0 | MIT |
| commander / jiti / tiny-pinyin | 14.0.3 / 2.7.0 / 1.3.2 | MIT |
| @modelcontextprotocol/sdk / zod | 1.32.1 / 4.6.7 | MIT |
| sharp | 0.34.5 | Apache-2.0 |
| @img/sharp-win32-x64 | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later（package 声明，涉及 libvips） |

网页编辑器自己的锁文件固定 OpenFairyGUI `0.2.4`、TypeScript `5.9.3`、Vite `8.1.5`、fflate `0.8.3`。其上游 THIRD_PARTY_NOTICES 中 OpenFairyGUI `0.2.1` 是历史记录，应以本仓库锁文件与实际目录为准。Playwright `1.64.1` 属于根目录验证工具，保留其 Apache-2.0 许可及下载浏览器各自的许可。

## PuerTS 与 Unity

可选下载固定为 [Tencent/PuerTS Unity_v3.0.3](https://github.com/Tencent/puerts/releases/tag/Unity_v3.0.3)，源码提交 `d8871238a3774fd10600995a5325e4b2ab4e39fb`。原始包为 `PuerTS_Core_3.0.3.tar.gz` 与 `PuerTS_V8_3.0.3.tar.gz`，原始 SHA256 与逐文件摘要见锁文件。Tencent 部分 BSD-3-Clause，Copyright © 2020 Tencent；包中 LICENSE 还含 doT 的 MIT 通知，Copyright © 2011 Laura Doktorova、© 2010 aefxx。

两份 PuerTS release LICENSE 未提供完整 V8、WebSocket++、Asio、EASTL 等原生第三方通知集合。本次没有把它视为完整再发行许可审计；公开分发原生 Player 或依赖二进制前，需要补齐其对应版本的通知。原始许可副本保留在 `patches/licenses/`，bootstrap 还保留每个提取包的 LICENSE 并复制到 `unity-migration/packages/notices/`。

`patches/puerts-3.0.3-unity-6.6-unbox.patch` 仅将固定 C++ 模板内四处 `Object::Unbox` 改为公开 `il2cpp_object_unbox`，用于本次 Unity 6000.6.6f1 实测兼容；它不改变原许可，也不声称适配所有 Unity/PuerTS 版本。bootstrap 同时校验原始与修改后摘要，遇到未知源码即停止。

Unity Editor、Windows IL2CPP 模块及其许可由用户自行获取；bootstrap 不下载、安装、激活或启动 Unity。

## 字体与验证美术

验证工程动态使用本机 Windows 系统字体（包括 SimSun、Microsoft YaHei 等可用字体）。系统字体文件不随 LGUI 分发；本机可用不代表取得字体文件再发行许可，其他设备的字体与排版需另行验证。

背包美术来自本次自制、图像生成、裁切、遮罩和透明素材提取流程，不是 FairyGUI 官方示例资产。提示词、源图摘要、切片 sourceRect、输出摘要见 `unity-migration/complex-inventory/art/prompts.json`、`published/art-manifest.json`、`fidelity/skin-manifest.json`、`fidelity/detail-icons.json`。这批素材按本仓库 LICENSE 的 MIT 条款提供，并保留生成/派生来源记录；这不表示生成结果具有排他性，也不重新许可任何第三方品牌。参考图的逐层裁切与透明重绘素材应区分，不能将视觉近似描述为全部像素恒等。

参考图 SHA256 `b93b3baa9ff13476edfff4c5c83206867540160a7b70d49009c37b4a8e653d7b`；早期道具图集 `14b30d48908669363919196c95401ed800c00c9b78bbc10537d69594a822e2f2`；透明详情图集 `6f66d7c29ef9cdd3543ede13bacd7ffc122424b1b64c93b3fae7436065a04fd4`。LGUI 原创许可不扩展至第三方软件、其附带示例资产或商标。
