# Unity 平台桥交接

当前状态：已实现，未启动 Unity、未执行 C# 编译，Editor 与 Player 均待实测。此处为隔离验证原型，先写验收契约与检查 JSON，再写仪器化平台桥；尚未完成 Unity 行为的红绿验证。不得将 Node 测试通过写成 PuerTS/Unity 已通过。

本轮新增实现仅 `InventoryUnity/Assets/Migration/InventoryHost.cs`，未修改 Packages、ProjectSettings、Editor 管线、既有仓库、最终 Fairy 源工程或共享 model.ts。未安装依赖，未新起进程。

宿主无 namespace，`public sealed class InventoryHost : MonoBehaviour`。接口为 `Instance`、`Ready`、`verificationDirectory`、`initialCount`、`metrics`、`SetVerificationDirectory(string)`、`SnapshotJson()`、`ExecuteVerification(string op,string argsJson="{}")`。

运行时依赖 Resources 的 `InventoryApp.txt`、`InventoryUI/Inventory_fui.bytes` 与 `InventoryUI/Inventory_atlas0.png`。采用 PuerTS 3.0.3 `new ScriptEnv(new BackendV8())`，同一环境在开关 UI 时保留，每个 Update 调用一次 Tick，Host 销毁才 Dispose。业务唯一来源为现有 TS；C# 中 Item/AppView 等只是 JSON 数据结构。未生成或声称存在 FairyGUI 到 PuerTS 的 TS 绑定，C# 直接调用 FairyGUI 原生 API，通过 Eval<string> 调用 JS 的纯 JSON 接口。

`-inventoryCount` 在首次 Eval 前设置数量；`-verificationDir` 覆盖场景序列化路径。没有证据目录时只 Debug.Log。系统 Microsoft YaHei 字体注册为 Arial 别名，不复制操作系统字体。

业务操作 `snapshot/open/close/query/progress/claim` 透传；平台操作 `reward/confirm/scroll({y})/resize({width,height})`。resize 仅向 Screen.SetResolution 请求真实分辨率，Editor Game View 由外部控制。最小请求 300×360，常用窄屏建议 480×720。奖励弹窗在成功 claim 后展示，使用发布资源；controller/state、虚拟行、enter transition 均来自同一包。宽屏标题坐标保留最终源的 46,29；窄屏做平台布局适配。

快照为 `{ready,response,rawTsResponse,ui,metrics,errors}`。response 是 TS 协议 DTO，rawTsResponse 保留原始 JSON。ui 包含屏幕/Stage/Root 尺寸、输入内容、标题/摘要、弹窗、滚动量、物理行数、实际运行对象的 packageItem ID/resourceURL、按钮屏幕矩形与状态。rect 原点左上角；unityRect 原点左下角。metrics 包括跨语言调用、布局、渲染/行绑定耗时、生命周期、一次 Tick/Update 计数、托管/Unity 内存、最近一次 Stage 的显示对象/图形数。Stage 图形数不是 GPU draw-call 测量，渲染耗时只量 C# 绑定工作，不包括 GPU。

每 0.25 秒写 latest-snapshot.json 与 snapshots.jsonl，初始/销毁时也写。每条包含完整 view 与原始 TS 响应，压力规模运行应控制采样时长，避免把日志写入成本误当 UI 固有开销。

已执行：`node --experimental-strip-types --test 验证/unity-migration/ts/app.test.mjs 验证/unity-migration/ts/bundle.test.mjs`，8/8 通过；完整日志 `host-shared-contract-check.log`。覆盖真实共享模型的三态、领取拒绝、中文筛选、250 次开关、关闭时保留状态、非法输入、300/3000 条与无平台全局的 IIFE。此处没有给 Unity 真实输入下结论。

`Inventory.fairy` SHA256 保持 `25c87f86ef704e473bcf963fef88fa5b7f96e4b01018454c14e64fc3823e1839`；共享 model.ts 保持 `e3162e7d648a61dd5817918a8e2a753b4899f97fde0a15c124ca2c9a28742cf6`。Unity 发布产物、组件映射与源 ZIP 哈希详见相邻 publish-report.json。
