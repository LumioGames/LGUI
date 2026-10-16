# 网页编辑器与 Agent 共用会话

本轮完成于2026-10-16。文本错误已修复，Agent入口复用网页正在使用的 EditorProjectSession、Backend、操作队列、revision、撤销历史和浏览器工作区保存。仍使用同一个 Inventory 源工程及组件/资源ID，网页依赖保持 OpenFairyGUI 0.2.4。

详细结果见“报告.md”，自动浏览器流程见“acceptance-plan.md”。独立游戏预览：http://127.0.0.1:4181 。网页编辑器：http://127.0.0.1:5199/?agent=1 。在新的个人浏览器环境中，可从“文件→从ZIP导入”导入 `roundtrip-final/project` 对应的原始导出ZIP：`evidence/2026-10-16T07-57-12-927Z-chrome/Inventory-browser-export.zip`。浏览器工作区按浏览器profile与origin保存；自动测试使用独立profile，没有更改个人浏览器数据。

## 启动

从“验证”目录执行，已有Node和依赖即可：

```powershell
Push-Location repos/editor-online
$env:FAIRY_AGENT_CONNECTION=(Join-Path (Resolve-Path '../../闭环验证').Path 'agent-connection.local.json')
npm run dev -- --port 5199 --strictPort
# 另一个终端，从“验证”目录启动已发布游戏：
node 闭环验证/serve-roundtrip.mjs
```

开发桥只支持127.0.0.1；必须同时设置连接文件环境变量并在编辑器URL加入 `?agent=1`。普通URL不挂载Agent入口，生产build不启用这条Vite传输。连接文件每次启动生成新token，属于本机临时连接资料，不作为可分享证据。无需安装MCP、扩展或登录。

## 独立 Agent CLI

从“验证”目录：

```powershell
node 闭环验证/agent-cli.mjs clients
node 闭环验证/agent-cli.mjs call <上一步明确选择的clientId> 闭环验证/examples/state.json
```

clients只列当前启用桥的浏览器页；多页时必须明确clientId，写入不会广播。CLI和验收脚本都通过带本机token的HTTP请求调用浏览器，不读取私有shell对象，也不另开磁盘Backend作并发写者。

state返回 `data.identity={sessionId,generation,revision}`，以及editor/backend状态。query省略selector读取当前未保存的完整UAM，也可指定稳定ID。将实际返回的identity放入请求文件，再调用CLI：

```json
{
  "method": "transact",
  "requestId": "inventory-edit-unique-001",
  "identity": { "sessionId": "填入刚查询到的值", "generation": 1, "revision": 0 },
  "operations": [{
    "kind": "setDisplayNodeProps",
    "selector": { "packageId": "invtest1", "componentResourceId": "main0001", "displayNodeId": "title" },
    "props": { "text": "旅者背包 · 共用会话", "position": { "x": 46, "y": 29 }, "color": "#8df0c4" }
  }]
}
```

完整textProperties与独立text/font/fontSize/color不能混用；Inspector已改为只提交完整textProperties。请求可先用 `method:"preflight"` 预检；提交时仍会重验真实会话和revision。每次成功修改后应查询新identity；网页人工修改也会推进同一个revision。

| method | 参数及结果 |
|---|---|
| state | 不需identity；返回当前identity、editor/backend/工作区状态 |
| query | 可传selector；返回 `data.entity` 副本，能读未保存UI改动 |
| preflight | identity+operations；只在同一UAM副本上执行正式预检，不改revision/dirty/history |
| transact | identity+requestId+1–50个setDisplayNodeProps；通过同一个UI操作队列和history |
| undo / redo | identity+requestId；和网页Ctrl+Z/Ctrl+Shift+Z使用同一历史 |
| save | identity+requestId+selector；selector建议指定Main/title，必须读回verified才ok |
| export | identity，要求dirty=false；返回已保存工作区ZIP的base64，CLI需给明确输出路径 |

保存请求示意：`{"method":"save","requestId":"save-unique-001","identity":实际identity,"selector":{"packageId":"invtest1","componentResourceId":"main0001","displayNodeId":"title"}}`。以上“实际identity”需替换为JSON对象。

导出时把请求保存为JSON，再执行：

```powershell
node 闭环验证/agent-cli.mjs call <clientId> <export请求.json> <目标ZIP绝对路径>
```

保存位置是当前浏览器工作区OPFS/IndexedDB；ZIP导入不会静默写回原磁盘ZIP。显式export把同一已保存状态交给本地发布器。浏览器刷新/重启会有新的sessionId，revision不承诺跨session全局递增；旧identity必须重新查询。

写入如超时返回result_unknown，可能已执行。应原封不动重试同requestId与payload；相同ID同载荷在当前浏览器实例中重放原结果、不再执行，相同ID不同载荷拒绝。缓存上限512个写请求，不静默淘汰；达到上限后先保存重开。不要通过生成新ID盲目重试未知结果。

## 复验

```powershell
Push-Location repos/editor-online
node --test ../../闭环验证/text-fix/inspector-text-regression.test.mjs
node scripts/internal/verify-inspector-host-layouts.mjs
node scripts/internal/verify-agent-session.mjs
node --test scripts/internal/verify-agent-relay.test.mjs
node scripts/internal/verify-command-history.mjs
npm run typecheck
npm run build
Pop-Location
node 闭环验证/browser-acceptance.mjs
$env:BROWSER='edge'
node 闭环验证/browser-acceptance.mjs
$env:BROWSER='chrome'
node 闭环验证/browser-acceptance.mjs --persistent
node 闭环验证/dom-roundtrip-acceptance.mjs
```

浏览器脚本创建新证据目录；persistent使用该目录下独立测试profile，关闭整个浏览器进程后重启。DOM测试需要4181服务已运行。运行会更新本轮同名日志时应先备份原始证据。

若重做发布，使用实际browser export ZIP作为输入。发布器要求新输出目录，避免覆盖已审查快照：

```powershell
node 闭环验证/publish-browser-export.mjs <实际导出ZIP绝对路径> <新的输出目录名>
```

默认已验证输出为roundtrip-final。新输出如需预览，应调整serve-roundtrip.mjs的根目录；该脚本只监听127.0.0.1:4181。发布用已锁定Node SDK 0.7.0读取显式导出快照，沿用单包PNG散图适配；它不与浏览器建立第二份共享实时会话。

停止本轮5199与4181服务可运行“停止本轮服务.ps1”；脚本核对命令行后只停止本轮两个服务，原4179预览不由它管理。
