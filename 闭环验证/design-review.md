# 网页编辑器 Agent 共用会话：设计复核

复核日期：2026-10-16（America/Los_Angeles）。只读核查现有 `验证/repos/editor-online`，HEAD 为 `45f0bef93bb16d507552b673ace6d5af417a8a0f`。本文件是设计建议，没有实现或运行新 bridge，没有调用外部服务，没有改生产源码。本次适用项目根 AGENTS.md；仓库内未发现额外 AGENTS.md。

## 结论与最小边界

主 agent 已定方案可行：`BrowserAgentSession` 只连接当前页面已有的 `EditorProjectSession`，所有写入复用 `runExclusive`、`applyDisplayNodePropsNow`、`undoNow/redoNow`、`saveWorkspaceNow`，`notify=true` 走现有 snapshot/UI listeners。开放 `state/query/preflight/transact/undo/redo/save/export`，本轮只支持 `setDisplayNodeProps` 组合的文案、位置、颜色；不扩展结构删除、资源替换等操作。

明确 `window` 请求 API，加仅本地开发可用的 Vite HMR relay 与带临时 token 的 loopback RPC，使 CLI 请求到达**同一个浏览器 JavaScript 会话**。不得为 RPC 新建磁盘 BackendRuntime，也不得直接编辑 OPFS/XML 来绕过活会话。browser clientId、sessionId、generation、revision 都是目标识别的一部分。

## 已有源码提供什么，不能绕过什么

| 现有位置 | 核查事实 | 对新 bridge 的要求 |
|---|---|---|
| `modules/ProjectSessionModule.ts:48–61,166–227` | session 已持有 live bridge、command adapter 与操作队列；apply/undo/redo 后统一同步 snapshot | 在同一 queue 内调用 Now 方法。Now 方法本身不自动排队；不要再嵌套调用会等待同一队列的上层 UI wrapper，避免死锁 |
| `services/BrowserLiveSessionBridge.ts:297–311,439–535` | identity 含 generation/sessionId/revision；reset 失效在途 token；`runLifecycleOperation` 仅跟踪在途与生命周期 | 它不是互斥队列。RPC 与 UI 必须共用 ProjectSession 的串行队列，不能另设 RPC 私有队列冒充串行 |
| `commands/EditorCommandAdapter.ts:231–305,329–443` | adapter 负责验证、前后状态、逆操作、history、revision 与 snapshot 更新 | 不裸调 live bridge 的 applyTransaction，否则 backend 变更会绕过编辑器 history/dirty/undo/UI 同步 |
| 同文件 `591–645,731–771,857–868` | undo/redo 也是新的 backend transaction；revision 单调变化，stateId 回到历史状态；dirty 为 currentStateId 与 savedStateId 的比较 | 不把 undo 理解成 revision 回退；不要让 Agent 自己提供任意 inverse。复用 adapter 生成的可信逆操作 |
| `BrowserLiveSessionBridge.ts:975–1042` | 先在克隆 workingProject 上投影，backend 成功后才替换 active snapshot | 新 preflight 应只使用克隆投影/校验，不调用活 backend apply；本轮检查时尚无 public `previewUamTransaction`，这是拟新增入口，不是已测试能力 |
| `runtime/BrowserPluginHost.ts:150–180` | 插件 v1 只允许当前选择对象的有限 position.x/y | 不应假装原插件已有文案/颜色 API。新增 Agent 开发桥有明确方法范围，沿用同一底层 session，插件 v1 范围不必扩大 |
| `modules/ProjectSessionModule.ts:191–217` | 保存记录 checkpointStateId/revision，符合 checkpoint 才 markSaved | Agent save 必须沿用此路径，不手动清 dirty、不重置 history、不更新到一个“方便的新revision” |
| `BrowserLiveSessionBridge.ts:1324–1359` | 无 target 或缺 reader 时 reload 可以返回 `ok:true,status:skipped` | `ok` 不能独自代表保存后重读验证。必须在 RPC 结果中保留 reload.status，验收要求 verified 或实际刷新重开核对 |
| `services/BrowserSaveCoordinator.ts:464–534` | browser workspace 保存与 Folder writeback 是两步；Folder 冲突可在浏览器已保存后发生 | 分别返回保存、重读、checkpoint、writeback 状态。不要把 OPFS 保存说成本地源目录已更新 |

## RPC 最小可靠合同

每个请求包含 `requestId/clientId/method`。变更、undo、redo、save 请求必须带 `sessionId/generation/expectedRevision`；业务参数仅接受该方法的白名单 JSON。query 返回稳定 packageId/componentResourceId/displayNodeId，不按易变的当前选择或模糊名称替换目标。

**校验时机必须在 queue callback 真正开始时。** 若入队时 revision=N、UI 在前面已提交至 N+1，就返回 stale 与当前 identity，不能替换 expectedRevision 后偷偷重试。generation/sessionId 不匹配时也要失败，即使新工程碰巧又是 revision=0。人改与 Agent 改互相可见、互相冲突的依据是这个合同。

state/query 也排同一队列，或使用等价的“读取前后 identity 相同”约束；避免读到 backend 已提交而 adapter/snapshot/history 尚未同步的中间态。公共响应返回克隆或序列化数据，不将 currentProjectSnapshot 的可变引用暴露给 window 调用者。

HTTP relay 多 tab 必须明确 clientId，实际派发至唯一已注册 client；零个或多个匹配都明确失败。页面重载/HMR 重建后，旧 client 请求不可悄悄落到新 session。开发桥仅 `?agent=1`、本机开发入口启用；临时 token 绑定本次 relay/连接，停用时撤销 API 和待处理请求。无需持久扩展或外部服务。

传输超时表示**结果未知**，不能等价为“未执行”。至少在当前会话以 requestId+请求内容 hash 缓存执行中/最终响应；同 ID 同参数重试回原结果，同 ID 不同参数失败。否则 CLI 超时重试可能连续改两次或把一次 undo 执行两次。重载导致去重记录失效时，新的 identity 应迫使调用者先查询核对。

## 投影、失败和保存的易踩坑

1. **预检与提交共用同一标准化。** 旧文本 Inspector 的已知错误正是 `textProperties` 与 `text/fontSize/color` 混用。Agent 请求应选一种合法表示，preflight 与 transact 用同一转换、同一 selector、同一字段验证；不要预检精简版，提交时再增加混用字段。
2. **不要只验证事务第一项。** 组合中的后续 missing selector/非法字段必须使整组失败；失败后 live workingProject、编辑器 snapshot、revision、history depth、dirty 和实际文本/位置/颜色均保持原值。
3. **成功定义要覆盖同步。** backend 变更成功但 snapshot/UI listener 抛异常，是已提交后的同步错误，不能报告为“安全失败且未改动”。响应应附实际 revision/同步状态并阻止自动重试。现有 high-risk adapter 有 snapshot_sync_missing 边界；本轮低风险同样应检查同步状态。
4. **UI dirty 与 backend dirty 不一定同义。** undo 回 savedStateId 可以使 UI dirty=false，但 backend 已执行一个新逆事务，可能仍 dirty=true。不能硬要求两字段每一步相等；结果分别列出，并用 checkpoint 和存储重读判断保存。
5. **保存成功与重开成功分别留证。** save 需要明确 target/验证对象；重读 skipped 不算 verified。完成后同 origin、同 browser storage 的实际刷新/关闭重开，确认新 identity、保存语义、稳定 ID、资源/控制器/动效均保留。普通临时新 browser context 没有旧 OPFS，不应用它代表恢复同一工作区。
6. **export 的边界明确。** 若导出读取持久 workspace，则必须先显式 save 或返回 dirty 阻止导出；不能把旧磁盘/OPFS ZIP 当作当前未保存 live state。Folder writeback冲突和ZIP导出必须如实分别报告。
7. **错误后队列仍能工作。** 一个请求 reject 不能污染 Promise tail；现有 runExclusive 已把 tail 的成功/失败都归并为 fulfilled。RPC 不应另包一条会永久 reject 的队列。

## 此切片足够的验收轨迹

不需要扩大生产范围，以下轨迹可证明本轮合同：

- 人工先做一个未保存位置修改；Agent state/query 能看到同一值、同一 session/revision、dirty=true。
- Agent preflight 文案+位置+颜色三类修改；对前后状态/语义 hash、revision、history depth、dirty 做相等检查，证明确实未提交。
- transact 一组成功，revision 前进一次，页面真实显示对应文本/位置/颜色，history 增加一个 group；人工 UI Undo 能还原 Agent 整组，Agent Redo 能重做。
- missing selector 和 stale revision分别失败；含第二项 missing 的组合也失败，前后语义/history/dirty不变。失败后正常请求仍成功。
- 两个并发请求都带同一个 expectedRevision，只能一个成功；另一个 stale。不能通过强制重取 revision 使两者都默默执行。
- 同 requestId 重复提交只改一次；relay 超时/重复返回不再次执行。clientId 不存在、错 session/generation 的请求不能触及当前工程。
- save 返回 checkpointSaved 与明确的 reload status；实际刷新重开恢复三类修改与既有资源/控制器/动效。若再导出 ZIP，读回应与已保存浏览器状态对应。

上述是建议验收项，尚不是本子任务测试通过记录。最终实现和证据到位后应再次短审，尤其核对 transport 的未知结果、queue 内 identity 判断、save skipped 与真实重开是否分开。
