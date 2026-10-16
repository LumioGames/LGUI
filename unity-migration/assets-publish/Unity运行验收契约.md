# Unity 原生平台桥验收契约

写于平台桥实现之前。此文件定义待执行的验收，不代表已通过。Unity 尚在安装，因此本阶段先交可仪器化原型；真实 Editor/Player 验证由主执行者随后运行，不能用静态检查替代。

- 原始资源只读：同一个 roundtrip-final/Inventory.fairy 发布的 Unity bytes 与图集。标题保留“旅者背包 · 网页保存闭环”，组件 ID、控制器和 enter 动画不重新制作。
- 业务唯一来源：Resources/InventoryApp.txt，来自共享 TS 编译产物。C# 不实现筛选、三态迁移、发奖和监听计数；仅调用 `globalThis.inventoryApp.dispatch(op,argsJson)` 并绑定返回的 view。
- `-inventoryCount 30/300/3000` 在第一次 Eval 前设置全局初始数据量。每种规模启动新进程，不通过销毁重建业务实例变更数量。中文字体直接使用本机 Microsoft YaHei，Arial 别名指向该系统字体，不复制字体进入分发包。
- 宿主：全局无 namespace 的 `InventoryHost`，提供 Instance、Ready、verificationDirectory、SetVerificationDirectory、SnapshotJson、ExecuteVerification。
- 快照形状：`{ready,response,rawTsResponse,ui,metrics,errors}`。response 完整映射 TS 的 ok/op/result/error/view/session；rawTsResponse 保留原 JSON。ui 包含屏幕、Stage、Root 尺寸、弹窗、列表 scrollY/物理行、控件屏幕 rect；屏幕 rect 以左上角为原点，另列 Unity 左下角 rect。
- `open/close/query/progress/claim/snapshot` 转发 TS；`reward/confirm/scroll/resize` 是平台操作。resize 仅请求真实 Screen.SetResolution；Editor Game View 尺寸由外部验收器控制，不能把布局覆盖值算成真实窗口大小。
- 关闭时销毁 Main、行监听和弹窗，保留 ScriptEnv；每个 Update 最多且仅 Tick 一次；OnDestroy 才 Dispose。反复开关后 TS listenerCount 应在开时为 1、关时为 0，closedCallbacks 为 0，runtimeInstances 为 1。
- list 为虚拟列表，物理行复用时 claim 从 row.data 读取当前 ID，不能捕获旧 index。Controller.state 三页 locked/ready/claimed；领取按钮的可点状态来自 TS 返回 state。
- 搜索使用原生 GTextInput.onChanged；中文输入、滚轮、拖拽、真实点击和不同窗口尺寸另作实机证据，直接 ExecuteVerification 不能冒充真实输入。
- 已领取奖励显示 Reward，confirm 关闭；说明弹窗支持拖拽；布局同时覆盖宽窄屏，enter 使用发布资源内动画。
- 仅指定 -verificationDir 或 SetVerificationDirectory 时每 0.25 秒写 latest-snapshot.json 和 snapshots.jsonl；否则仅 Debug.Log。记录错误、TS 响应、渲染耗时、帧/Tick 数、物理行数与内存，时间仅代表本次桌面运行。

自动验收顺序及预期值见 Unity运行检查.json。先执行共享 TS 检查只能证明业务协议成立；Editor、Player 和真实输入分别独立判定。
