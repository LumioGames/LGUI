# 复杂背包本地复验

先看 [报告](报告.md) 的最新状态。本目录为隔离测试：同一 Inventory 包新增复杂页面，保留旧组件和奖励模型。复杂版正在补视觉和 Unity 运行验收，不能把已有构建或早期绿报告当最终全通过。

本机依赖已经准备：Node 24.18.0、锁定的 OpenFairyGUI 0.7.0、已有 sharp/Vite/Playwright、Chrome/Edge，以及 Unity 6000.6.6f1、PuerTS Core/V8 3.0.3 和 Windows IL2CPP 工具链。以下步骤不需要安装新依赖。运行前让其他验收任务完成，避免同时重生成资源或对同一 Unity 项目并发打开 Editor。

在 PowerShell 进入本目录：

```powershell
Set-Location '[LGUI_ROOT]\unity-migration\complex-inventory'
```

## 生成与网页

已有 art/reference.png、items-atlas.png、backdrop.png 及 prompts.json。下述步骤会更新本目录生成物/证据；需要保留某轮审查结果时先复制其报告和截图。create-publish 只对 atlas 作精确 256×256 等格切片，不重新生成美术。

```powershell
node --test shared/complex-inventory.test.mjs
node --test scripts/layout.test.mjs
node scripts/build-app.mjs
node scripts/create-publish.mjs
node scripts/build-web.mjs
node scripts/serve.mjs
```

最后一条持续提供本地 HTTP；若 4182 已有本任务服务，直接访问 [复杂背包](http://127.0.0.1:4182/web/)，不要重复启动。不要用 file://。结束该前台服务用其终端 Ctrl+C。该服务根是整个 complex-inventory，页面是 `/web/`；旧 4179/4181 页面不是本复杂版。

create-publish 从 `../../闭环验证/roundtrip-final/project/` 读取原始基线，在本目录 project/ 生成副本。原始 10 个文件不变；副本保留原 9 文件字节，只追加 package.xml 资源条目。它会重新生成本目录 project/published，请勿在并行验收时运行。发布成功以 `published/publish-report.json.status=passed` 为准。

DOM 资源最终结构为 `published/dom/{package.xml,manifest.json,26PNG}`，平铺，没有额外 Inventory 子目录。build-web 将其复制到 `web/assets/Inventory/`；旧 runtime 读取 package.xml，其内容是未压缩 FGUI 二进制，随后由 manifest 修正图像散图 URL。Unity 正式输出位于 published/unity，勿用 DOM 散图替代原生图集。

服务运行后，可在另一终端执行浏览器自动验收：

```powershell
node scripts/accept-browser.mjs chrome
node scripts/accept-browser.mjs edge
```

脚本在 evidence/ 新建带时间戳的 JSON，并更新同名 wide/narrow/detail 截图。它检查真实 DOM 控件操作、资源与错误、颜色、宽窄屏、CDP composition、完整业务序列和 200 次开关。headless 操作及 CDP composition 不证明物理中文输入法；视觉仍需审图。报告按最新时间与新增断言判定，保留旧红报告。

人工查看可依次选择装备并装备/卸下、切到消耗品并使用、出售确认、保存后改变状态再恢复、筛选排序、滚动、关闭/重开。奖励按钮连接原 Inventory 的推进/一次领取流程，以界面提示为准。保存使用本浏览器 localStorage，键为 `lumio-complex-inventory-schema-1`；它不是云同步或防作弊存档。

## Unity Editor 与 Windows Player

资源和同一业务 bundle 进入现有隔离项目 `../InventoryUnity`。先复制：

```powershell
node scripts/setup-unity.mjs
```

该步骤只写 ComplexInventoryUI、ComplexInventoryApp 和 ComplexInventoryLayout 的 Resources 输出，并核对哈希，不覆盖旧基线 Host/场景/资源或 Packages/ProjectSettings。

本机 PuerTS 生成模板已经应用四处 Object::Unbox→公开 C API 的兼容修补。若重装了原始 3.0.3，先阅读 `../evidence/compatibility/README.txt`，再运行下列带哈希检查的幂等修补；不要凭版本名假定已经修过：

```powershell
pwsh -File ../evidence/compatibility/apply-unbox-compat.ps1
```

Editor 关闭时准备复杂场景、重新生成桥并构建：

```powershell
pwsh -File scripts/run-complex.ps1 -Action prepare -EvidenceName prepare-replay
pwsh -File scripts/run-complex.ps1 -Action generate -EvidenceName generate-replay
pwsh -File scripts/run-complex.ps1 -Action build -EvidenceName build-replay
```

prepare 使用 `Assets/ComplexInventoryValidation.unity` 与 ComplexInventoryHost，不是旧 InventoryHost。它也将构建场景与相关 Player 设置切到复杂版，因此不要在另一个 Unity 进程持有项目时执行。最新构建判定见 evidence/player-build.json；stdout 返回成功还不足以证明 Player 功能通过。

启动已有构建并执行统一业务契约：

```powershell
pwsh -File scripts/run-complex.ps1 -Action player -EvidenceName player-replay
node scripts/accept-unity.mjs evidence/player-replay player
```

Player 路径为 `../build/complex-windows-il2cpp/ComplexInventory.exe`。启动脚本会显示真实窗口，并传入 1280×800、-verificationDir 与日志路径。accept-unity 使用主线程文件命令验证共享业务、200 次开关和截图；它不替代实际点击/输入测试。

要在 Editor 手动 Play：

```powershell
pwsh -File scripts/run-complex.ps1 -Action editor -EvidenceName editor-replay
```

等待 Editor 完成打开 `Assets/ComplexInventoryValidation.unity`，由用户手动点击 Play。需要自动协议检查时在另一终端运行 `node scripts/accept-unity.mjs evidence/editor-replay editor`。Editor 中 Screen.SetResolution 不一定改变 Game View，宽窄屏应从真实 Game View 尺寸菜单设置；不要把请求值当实际视口。

Unity 存档为 `Application.persistentDataPath/ComplexInventory-v1.json`，实际路径在运行快照 ui.savePath；关闭 UI 保留 VM/业务，退出程序后的恢复需显式读取本地存档。-verificationDir 仅指定证据目录，快照含 TS 响应、UI、错误和计数，可能包含完整物品数组。结束窗口后应核对退出快照的 runtimeDisposals、listenerCount、closedCallbacks 和错误列表；本 README 不替代主执行者的最终进程清单。

## 文件入口

| 位置 | 内容 |
| --- | --- |
| art/ | 三张生成图、完整提示词；图像本身不是成品界面 |
| shared/、dist/ | 复杂业务/19 tests/API，以及供两端运行的同一 IIFE 和来源哈希 |
| project/Inventory.fairy | 同包、保留旧资源 ID 的正式源工程 |
| published/layout.json、art-manifest.json | 静态控件契约、24 图标 kind/index/ID/URL/切片与哈希 |
| scripts/layout.js | 两端执行同字节的响应式几何，宽屏六列、窄屏四列 |
| published/publish-report.json、source-diff-manifest.json | 保存/重读/双发布检查及原始源未改证明 |
| web/dom.ts、../InventoryUnity/Assets/Migration/ComplexInventoryHost.cs | DOM 与 Unity 平台层；共享业务不引用这两个平台 |
| evidence/ | 浏览器、Unity 准备/生成/构建、后续运行与失败证据 |

只在此隔离验证目录内复验；不修改同步 sources、生产业务库或提交推送。复杂版最新结果、视觉差异、存档和性能边界见报告。
