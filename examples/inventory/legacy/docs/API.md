# Unity/PuerTS 原型 TS 桥合同

入口：`ts/dist/inventory-app.js.txt`，普通 IIFE，目标 ES2020。由现成 Vite 8.1.5/rolldown 打包，未安装新依赖。`scripts/build-ts.mjs` 实际解析并打包 `../../prototype/shared/model.ts` 的 import，未复制/修改原业务源。源文件 SHA256 与打包输入在 `evidence/ts-build.json`，独立 source map 与 IIFE 同目录。

每个 JS 环境有一个 `globalThis.inventoryApp`。首次 Eval 前可选设置 `globalThis.inventoryInitialCount = 300` 或 `3000`；默认30。bundle 重复 Eval 在 app 已存在时不重建状态。没有 reset 命令；重建独立 JS 环境才会重置业务。

```javascript
inventoryApp.dispatch('open', '{}')
inventoryApp.dispatch('query', '{"query":"药水"}')
inventoryApp.dispatch('progress', '{}')
inventoryApp.dispatch('claim', '{"id":"item-1"}')
inventoryApp.dispatch('close', '{}')
inventoryApp.snapshot()
```

`dispatch(op: string, argsJson = '{}'): string` 与 `snapshot(): string` 都返回 JSON 字符串，供 C# DTO 反序列化。`snapshot` 也可作为 dispatch 的 op。参数必须为 JSON object，格式错误/缺必需字段/未知命令都会明确失败且不改业务。

```json
{
  "ok": true,
  "op": "claim",
  "result": {"ok": true, "message": "原 Inventory 的奖励提示，含中文/换行"},
  "view": {
    "items": [{"id":"item-1","name":"旅行宝石 2","state":"claimed","description":"…"}],
    "visible": [], "coins":10, "query":"药水"
  },
  "session": {
    "open":true, "listenerCount":1, "notifications":1,
    "opens":1, "closes":0, "closedCallbacks":0,
    "modelRevision":1, "count":30
  }
}
```

上例数组为结构示意，实际响应保留全部 items 与当前筛选 visible。C# 的 FairyGUI port 只读 view，用稳定 item.id 绑定点击；所有奖励判断、幂等领取、中文筛选与进度规则都由原 `Inventory` 执行。它不需要实现另一份业务，也不把 DOM、CS 或 FairyGUI 类型传入共享模型。

claim 业务拒绝时，顶层 `ok=false`，`result` 仍保留原模型 `{ok:false,message}`，并含 `error:{code:'claim_rejected',message}`。其余协议错误有 `invalid_json/invalid_args/unknown_operation`，result=null。业务拒绝与协议错误均不会增加 modelRevision。

open/close 幂等：首次 open 注册一个 Inventory listener，重复 open 不再注册；close 调原 disposer 并清除引用，重复 close 无效。关闭只移除 UI 会话，不销毁 Inventory；金币、领取状态、搜索词及关闭期间合法业务操作都保留。

notifications 是本桥的业务订阅回调次数，closedCallbacks 统计错误地发生在关闭后的该订阅回调；它不是 C# UI 事件数、原生内存或所有异步任务的释放证明。modelRevision 表示包装层已执行的合法 query/progress/成功 claim 次数，不是模型自带 revision。没有全局 timer、rAF、Tick 或 JS→C# 委托；C# 可在事件返回后拉取 view，保持自己的全局 ScriptEnv/Tick 生命周期。

验证：先得到7条缺少桥工厂的断言失败，再实现后7条通过；IIFE集成测试先因缺输出失败，构建后在无 document/CS 的隔离 Node VM 通过。最终8条通过，含250次重复开关、300/3000真实模型及重复 Eval 保留奖励。原始红/绿输出在 `evidence/ts-*.json`。Node VM 不是 Unity/PuerTS；Editor、Windows IL2CPP 与跨语言调用实测由独立 Unity 项目记录。
