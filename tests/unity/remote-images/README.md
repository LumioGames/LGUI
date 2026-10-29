# Unity 图片与 HTTP 原生回归

使用实际 MVC `applyIcon`、Unity 适配层、PuerTS 与 FairyGUI `GLoader`。检验纹理状态和真实 HTTP 请求次数；不把它当成画面验收。

由 `../runner.mjs` 准备一个独立开发 Unity 工程，安装本地 PuerTS 和当前 Unity 包，并生成 `Common` 界面包、测试桥和编辑器运行器。每轮使用一个新 HTTP fixture 和证据目录，避免沿用 one-shot 状态。

```text
node tests/unity/remote-images/server.mjs --out <证据目录>/server
node tests/unity/remote-images/prepare.mjs --project <Unity工程> --evidence <证据目录> --base-url <server.json里的base>
<Unity> -batchmode -projectPath <Unity工程> -executeMethod LGUI.Tests.LGUIConformanceEditor.Run -lguiResult <证据目录>/result.json -lguiTimeout 120 -logFile <证据目录>/unity.log
node tests/unity/remote-images/checker.mjs <证据目录>/result.json
```

Node 调用方也可使用 `startImageFixture({outDir})`、`prepareRemoteImageProbe({project,evidenceDir,baseURL})` 和 `checkRemoteImageResult(report)`；结束时调用 fixture 的 `close()`。

`/one-shot.png` 首次返回图片、之后返回 404，因此能发现“预载成功，显示时又下载一次”。`/slow.png` 延迟 350 毫秒，`/missing.png` 固定 404。计数保存在 `requests.json`。用例覆盖预载占位、并发共享、关闭一个消费者、无人消费的预载、URL 改空或改为包图、关闭前下载和 Shutdown。图片加载完毕后无消费者的纹理只保留固定两帧交接窗口。

同轮还检验实际 GET、带请求头与 UTF-8 请求体的 POST、404 响应和连接被断开时的带码拒绝。`text()` 与 `json()` 的内容都要正确。只有刻意制造的 `/missing.png` 的 `LGUI-RT-070` 被单独捕获；其余错误仍交给严格的 Unity 错误收集器，断言也会拒绝非预期错误。

还包含两种原生回调重入：缓存命中 A 的同步 `onLoad` 里改 B，以及共享失败 A 的第一个 `onError` 里把第二个加载器改为 B。确认服务器收到各自的 B 请求后关闭最后一个加载器；`rawURL` 区分两例，`closed` 必须早于 `scheduledWrite`，且不能出现 `writeStarted`。这验证取消句柄确实归属于 B，不能只靠“迟到的纹理最终释放”判定成功。
