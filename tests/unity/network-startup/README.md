# 网络启动失败负向验证

已复现的红证据是 Windows IL2CPP Player 在 `PlayerSettings.insecureHttpOption=NotAllowed` 时，对 `http://[::1]:<本机端口>/` 调用 `Platform.Fetch`。`UnityWebRequest.SendWebRequest()` 在 coroutine 的第一次 MoveNext 同步抛 `InvalidOperationException: Insecure connection not allowed`；Unity 处理了 coroutine 异常，外层 Fetch 的 catch 没收到，JS Promise 也没有完成。

修复在非 iterator helper 中捕获启动异常；Send 的失败分支确认 owner/代际仍有效后，完成一次 status=0、空 text、LGUI-RT-161 响应，完整保留原异常与堆栈，再通过原有 finally 解除跟踪并 Dispose。原生分类实证 texture/audio 也同步抛同一异常后，两条 coroutine 复用该 helper：texture 走原失败回调并移除缓存项，audio 记录一次 LGUI-RT-161 原异常后结束。没有改 HTTP 安全策略、代理、URL、公开接口或重试行为。

原生队列所有者把 `NetworkStartupProbe.cs` 明确复制到专用测试工程的 `Assets/`，重建 Release IL2CPP。生产包内没有这段探针。保持 insecure HTTP 禁止，不为测试临时放开。

在真实 LGUIBoot 已启动的测试 VM 中，通过现有 Inspector 执行并保存返回 JSON：

```javascript
JSON.parse(CS.LGUI.Tests.NetworkStartupProbe.RunFetchCase('http://[::1]:<实际本机端口>/'))
```

目标：ok=true、callbacks=1、response.status=0、response.text为空、error含 LGUI-RT-161、原 InvalidOperationException 与 Insecure connection not allowed；trackedBefore=trackedAfter；staleCallbacks=0、staleYielded=false。真实 JS 的 Promise 还应直接复测原调用，确认其完成而非超时：

```javascript
await new Promise(resolve => CS.LGUI.Platform.Fetch('http://[::1]:<实际本机端口>/', 'GET', '{"items":[]}', null, resolve))
```

不要用 IPv4 的代理 502 响应代替这个同步启动失败案例。日志中的 Unity 自己的安全策略提示要原样保留；不得过滤运行时异常或把未执行当通过。

另一个独立诊断可核实 texture/audio 是否确实有相同启动风险，再决定是否改同模式代码：

```javascript
JSON.parse(CS.LGUI.Tests.NetworkStartupProbe.ClassifyOtherStarts('http://[::1]:<实际本机端口>/'))
```

它分别使用 Unity 的 buffer/texture/audio factory，直接调用 SendWebRequest 并局部捕获原异常、释放请求。Windows Release IL2CPP 的 `network/notallowed-run1/protocol.json` 已实证三项相同异常，之后才扩展到两个媒体 coroutine；源码相似本身不是已完成的原生验证。

媒体修复重建后运行：

```javascript
JSON.parse(CS.LGUI.Tests.NetworkStartupProbe.RunMediaCases('http://[::1]:<实际本机端口>/'))
```

目标是两次同 URL 图片各失败一次、没有成功回调，requests/cache/audio clip 数量回到各自基线；音频恰一条带 LGUI-RT-161 和原异常详情的 Error，unexpectedErrors 为空。这是明确负向用例，预期的带码音频 Error 要原样记录，不能用正向“所有 Error 都失败”的规则误判；也不能过滤掉它再称零错误。图片仍走原上层 RT070 路径，不在缓存重复写同一错误码；该探针验证原生失败事件，上层错误码由实际绑定用例验证。

另开一个新的负向 Player，最后单独运行生命周期探针，结束后关闭该进程：

```javascript
JSON.parse(CS.LGUI.Tests.NetworkStartupProbe.RunShutdownCase('explicit-native-shutdown-probe'))
```

它用反射构造两个原生缓存 waiter，以真实 `Failed` 派发隔离验证重入关闭：第一个回调调用 `Platform.Shutdown`，第二个必须不再执行；owner 关闭、requests/cache 归零。它明确改变该测试 Player 的生命周期，不恢复宿主，也不作为普通游戏操作。请求启动失败的真实网络证据与此派发隔离探针分别保存。
