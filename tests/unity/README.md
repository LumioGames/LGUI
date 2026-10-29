# Unity 开发验证

这里是仓库开发用的 Unity 测试工程模板和运行器，不放进 `plugin/`。运行器直接复用 `tests/conformance/cases/`、`harness.ts` 与框架启动流程，在 Unity 中创建真实的 FairyGUI 控件，通过原生 Stage 输入操作它们，再比较 Unity、headless 和 h5 的完整快照。

先准备 Unity 6000.6.6f1、PuerTS 3.0.3 的 Core/V8 本地包和已实现的 LGUI Unity 包，然后运行：

```text
node tests/unity/runner.mjs --editor <Unity可执行文件绝对路径> --project <新的Unity开发工程目录> --package <LGUI的Unity包目录> --puerts-core <PuerTS_Core解压目录> --puerts-v8 <PuerTS_V8解压目录> --evidence <新的证据目录> --case binding-language
```

不会下载 Unity 或 PuerTS；它把明确提供的本地包复制进专用测试工程。已存在包或结果文件时明确失败，避免混入旧工程或旧证据。后续用例可复用 `prepareConformanceCase` 和 `runUnityConformance`，重新生成游戏脚本并选择新的结果文件。

模板保留 Unity 6000.6 默认的相对 `UserSettings/Search.index` 配置，搜索范围仍为 `Assets`、`Packages`。这避免手工创建开发工程时漏掉索引配置、首次进入 Play 被 Editor 的索引初始化异常打断；没有关闭索引或过滤运行时错误。

`Assets/LGUIConformanceBridge.cs` 只在测试工程中提供原生指针、按键、滚轮、窗口尺寸和结果写回。Editor 中的窗口尺寸通过当前 Unity 的 GameView 设置；Player 中使用 `Screen.SetResolution`，`SizeMatches` 读取真实 `Screen.width/height`。不伪造后端的屏幕读数。

指针输入先等待真实 Stage 完成布局，按下/抬起各用请求序号确认已经被 Stage 消费。点击、长按的持续时间从原生按下消费之后开始计算，避免把排队延迟算成实际按住时间。框架仍使用真实单调时钟与原有手势阈值。

`Assets/Editor/LGUIConformanceEditor.cs` 负责创建场景、进入 Play、跨脚本域重载等待结果、收集运行时错误和正常退出。调用时不带 `-quit`，完成或失败由运行器退出。超时、编译、Play 与销毁错误都应保留日志；编译成功单独不能算运行验收。

`runUnityConformance({trace: true, ...})` 可启用最多 12,000 条输入与帧轨迹，供定位事件时序。默认关闭轨迹，避免把诊断字符串的存储计入 200 次开关的内存观察；原生 `RenderedFrame` 完成计数始终启用。

默认验证 `binding-language`；Windows IL2CPP Player、全部一致性用例、200 次开关、内存、包体和人工视觉验收在 S3-04 单独记录。
