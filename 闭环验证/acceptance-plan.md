# 同一浏览器会话闭环验收计划

本轮基于现有 Inventory fixture，所有证据新增到本目录 `evidence/<UTC时间>-<browser>/`，不覆盖 `验证/evidence` 的旧失败证据。仅访问 localhost；使用已有 Playwright 与本机 Chrome/Edge，不安装扩展、MCP 或新依赖。编辑器的 Laya 画布仅用于创作验收，最终游戏仍须单独在真正 FairyGUI-dom 页面验收。

## 已读基线与目标

- `../toolchain-test/README.md`：五个 OpenFairyGUI 包固定 0.7.0；旧 editor runtime SDK 是 0.2.4。旧 Inspector 文本错误为 textProperties 与独立 text 字段混合；方向键位置修改可成功。旧浏览器保存只进 OPFS/IndexedDB，源 ZIP 与磁盘 fixture 不会自动写回。
- 旧 `toolchain-editor-{error,unsaved}-state.json`、截图及 Inspector 原文；节点 `invtest1/main0001/title`，旧 dirty=true、旧 API mode=`openfairygui_browser_live_session`。
- 同源 fixture IDs：包 invtest1；Main main0001、ItemRow itemrow1、Reward reward01、Btn button01、icon icon0001；Main.enter 30fps、12帧 Alpha tween；ItemRow.state pages locked/ready/claimed，存在 text/look gears、icon 引用与 list defaultItem。
- 旧 `verify-agent.mjs` 是 Node 磁盘 backend，显式逆事务不等于原生历史；本轮必须验证浏览器正在用的同一 session/revision，以及网页实际 Undo/Redo 与保存。
- 旧 `../scripts/browser-acceptance.mjs` 可复用 installed Chromium executablePath、pageerror、请求/响应、HAR、截图、结构化断言与 finally 清理。不能直接把其中 DOM 游戏接口当作 Editor API。

## 真实浏览器顺序

| 顺序 | 操作 | 必须断言/证据 |
|---|---|---|
| 0 | 建立全新非持久化 context，访问明确带 dev-only RPC 开关的本地 editor | 浏览器版本、URL、网络仅 loopback，RPC 实际名称/合同版本、sessionId/revision/dirty 与网页状态，初始截图 |
| 1 | 通过画布“文件→从 ZIP 导入”选现有 Inventory.zip；打开 Main、选 title | 文件选择器真实选择；项目/组件/节点 ID 匹配；载入后 read API 与 UI 显示同一工程；基线完整语义摘要 |
| 2 | 点击 Inspector 真实文本输入，键盘替换文案并失焦 | 画布呈现新文案，read API 返回同文案；revision 增长；dirty=true；保留颜色/字号/位置等无关属性；没有旧 mixed-payload 错误 |
| 3 | 不保存，Agent 使用 UI 操作后读到的 sessionId/revision | 读到 UI 未保存文案；同 sessionId；RPC revision 与 UI command adapter/live bridge revision 一致；保存基线 lastSavedRevision 未前移 |
| 4 | Agent 以 expectedRevision 预检并应用三类修改：位置、样式、动效（或控制器） | 预检不变；实际 apply 同时更新 live UAM/工作副本/预览/Inspector；无第二个磁盘 backend；位置、颜色、enter duration 各有前后值和截图 |
| 5 | 发送旧 revision 的合法写与合法 revision 的 missing-node 写 | 明确 stale/missing 错误；sessionId/revision/dirty/完整语义摘要、历史栈与预览都不变；不是仅看返回 ok=false |
| 6 | 经网页快捷键或菜单执行 Undo，再 Redo | 每步 read 的完整语义恢复到预期，revision 合理前进；画布/Inspector 同步。若 Agent 操作不进入公共历史，明确记录断点，不能用另发逆事务冒充 |
| 7 | Agent 保存刚才 dirty 会话 | save 使用当前 expectedRevision；dirty=false，lastSavedRevision 匹配；UI dirty 也清除；磁盘源 fixture 哈希不变（ZIP导入没有写回授权） |
| 8 | UI 再改一个文案/位置并使用 Ctrl+S 或文件保存 | API 读到 dirty→clean 与最终数据；再次证明保存共享同一工作区；保留 Agent 改动 |
| 9 | 刷新页面，从同一浏览器工作区重开 | 会话 ID 可变化，持久化项目/资源 ID、最终文案/位置/颜色、enter tween、ItemRow controller+gears、resource refs 均保留；不可只比较文件数量 |
| 10 | 通过网页导出工作区 ZIP，保存下载 | ZIP 含 .fairy/package.xml/components/icon，逐项读回语义与最终 UAM一致，记录 ZIP/hash；重新导入该 ZIP 可再读回则额外留证 |
| 11 | 从导出源工程同源正式发布 Laya+散图 manifest 并在现有 DOM consumer 复验 | 明确窄适配路径；确认最终 Agent/UI 文案可见、位置/样式/动效保留、controller/resource refs与交互正常；DOM 网络无Laya/Cocos/Unity。此步可由主agent现有发布脚本执行，不能用editor Laya预览替代 |

数据比较忽略 sessionId、revision、时间戳等预期变化；不忽略真实项目字段。规范化同包引用空 packageId/undefined 时必须保留实际 effective package identity；保留原始 before/after JSON 供复查。

## RPC 合同需求与边界

主 agent 正在实现显式 dev-only RPC，本脚本不猜测最终全局名称/方法参数。接口收到后再完成主验收 adapter。需要：只读 state/project 或 query；sessionId、revision、dirty、lastSavedRevision；apply/preflight 的 expectedRevision；同公共 command history 的 undo/redo 或可用 UI 快捷键；save；可选 openDocument/select 与屏幕矩形查询（只为定位，不能代替 UI 输入）。Inspector 文本必须由真实点击/键盘/失焦触发，禁止用 RPC setter 伪装。

导入/导出优先真实 UI：利用 `fgui.GRoot.inst` 只读枚举命名控件、读取 localToGlobal 矩形后 Playwright 鼠标点击，文件选择器用 `setFiles`。读树不是调用事件处理器。源码确认 File 菜单项名 `workspaceMenuImportZip`、`workspaceMenuSave`、`workspaceMenuExport`；Inspector 文本面板名 `commandTextPanel`，子项 text 的原生输入由点击激活。截图和可见范围需确认，不能盲用旧坐标。

RPC 必须使用当前 browser live session。主脚本不得重新 createNodeBackendRuntime、读取磁盘修改后刷新来冒充同会话；导出 ZIP 回读和最终发布阶段才允许 Node 文件解析。

## 当前准备状态

RPC 已接入，Agent 的查询/预检/写入/Undo/Save/Export 经独立 Node HTTP 请求，浏览器 `page.evaluate` 只读 clientId 与 UI 树。接口显式挂在 `?agent=1` 的 `window.fairyEditorAgent`，连接文件 token 只用于 Authorization，未写入证据。服务器现在明确只支持 `http://127.0.0.1:5199`。脚本默认不自动启动/停止主 agent 的服务器，只负责自己的 browser/context。

完整验收命令：

```powershell
node 验证/闭环验证/browser-acceptance.mjs
$env:BROWSER = 'edge'
node 验证/闭环验证/browser-acceptance.mjs
# 独立测试 profile 的整个浏览器进程关闭后重启：
$env:BROWSER = 'chrome'
node 验证/闭环验证/browser-acceptance.mjs --persistent
```

`--probe` 只加载本地编辑器并记录现有 UI/全局可用性；`--import` 增加真实 File→ZIP 导入与基线截图，两者不会标为完整闭环通过。默认完整验收和 `--persistent` 使用独立证据目录。persistent profile 位于该 run 的 `isolated-browser-profile/`，没有使用用户默认 profile。

## 已执行结果（2026-10-16）

| 证据目录 | 结果与范围 |
|---|---|
| [07-57-12 Chrome](evidence/2026-10-16T07-57-12-927Z-chrome/report.json) | 完整浏览器闭环通过；独立 HTTP Agent 与 UI 同 session/revision；真实 Inspector、三类修改、负向不变、Undo/UI Redo、Agent/UI 两次保存、刷新重开及 ZIP 读回；23项断言、0页面/控制台错误 |
| [07-59-58 Edge](evidence/2026-10-16T07-59-58-225Z-edge/report.json) | 完整闭环通过，另包含 Inspector 与 Agent 修改的完整无关字段比较；控制器、动效与引用保留。标准十六进制颜色大小写按 backend 输出规范化比较 |
| [07-59-58 Chrome 进程重启](evidence/2026-10-16T07-59-58-237Z-chrome-persistent/report.json) | 独立 profile：改文案→save readback verified→关闭整个context/process→同profile同origin新进程重开；完整语义保留、新session、旧identity明确session_mismatch且不变；两次进程均已断连 |

安全/并发断言实际包括：无 token 401、错 clientId 409、同 expectedRevision 并发写仅一胜、requestId 精确重放不增 revision、同 ID 不同载荷拒绝、stale/missing write/missing save 明确失败且完整查询状态不变。保存必须 `checkpointSaved=true`、`browserWorkspaceSaved=true`、readback `verification.status=verified`，不能用 skipped 通过。

持久化第二个浏览器进程活跃时，还用 `execFile` 启动独立 `agent-cli.mjs clients` 和 `agent-cli.mjs call <本页clientId> state-request.json`，只读输出见该 run 的 `independent-cli-{clients,state}.json`；CLI 读到的 sessionId/revision 与浏览器工作会话一致，未记录 token。

首轮失败证据已保留：07-54-37 的 Ctrl+A 被编辑器全局快捷键截获、Tab没有触发预期失焦；改为 Playwright 原生 textarea.fill 后真实鼠标点击静态标签失焦。07-55-56 已通过刷新语义比较，随后因 Main 文档标签与资源按钮匹配重复而停；现已限定 library。07-59-16 Edge 的加强断言只因 `#8DF0C4` 与规范输出 `#8df0c4` 字符大小写不同失败，已在声明属性的预期值中做等价规范化。这些脚本问题没有改动 editor 源码，也不隐藏旧证据。

供主任务最终 DOM 同源发布使用的导出是 [Chrome 07-57-12 ZIP](evidence/2026-10-16T07-57-12-927Z-chrome/Inventory-browser-export.zip)：SHA256 `183e93d11990ef2a1adeb8a7329911db525463f55a3eac640c812c2245d0e702`，6134 bytes、10 文件，最终文案“旅者背包 · 网页保存闭环”、title位置(46,29)、颜色#8df0c4。该 ZIP 导出本身不等于最终 DOM 游戏通过；DOM 再发布及交互证据由主任务补充。本脚本未验证 Safari/Firefox、真机 IME 或 Unity。

所有失败都保留 partial report、截图、请求列表；非 loopback 请求会被拦截并计入失败。完成时退出自己启动的浏览器；仅进程重启用例保留独立测试 profile 文件，不接触用户默认 profile。
