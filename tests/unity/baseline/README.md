# Player 包体对照

`size-baseline.mjs` 准备专用开发工程，不更改普通背包构建工具的验收要求，不启动 Unity。所有路径使用绝对路径，工程目录必须不存在：

```text
node tests/unity/size-baseline.mjs prepare --mode A --project <新A工程>
node tests/unity/size-baseline.mjs prepare --mode B --project <新B工程> --puerts-core <官方Core3.0.3本地目录> --puerts-v8 <官方V8_3.0.3本地目录>
node tests/unity/size-baseline.mjs prepare --mode lgui --project <新C工程> --puerts-core <Core目录> --puerts-v8 <V8目录> --lgui-package <当前LGUI Unity包目录>
```

- A：只有 Camera 与 Unity 依赖，没有 PuerTS/LGUI。
- B：同样的 Camera，加官方本地 Core/V8、最小真实 `JsEnv` 宿主；指定 V8 后执行实际 Eval、Tick 和 Dispose。保留 Core/V8 两个程序集，不包含 LGUI。
- C（显式 `lgui`）：同样的 Camera，加 Core/V8 和真实 LGUI 包/`LGUIBoot`，合法空生命周期 JS，保留四个程序集，完全没有 `Assets/LGUI/Resources/UI`。包内默认 shader 等资源仍如实计入。
- D：普通导出的真实背包，由 `player-build.mjs` 构建，不放入此工具。

B/C 的本地 Core 必须已应用官方四处兼容补丁，工具核对原始字节 SHA256，不硬打未知源码。所有工程保留默认相对 Search.index。Editor 场景创建通过精确程序集名反射选择宿主，因此 A 的脚本不依赖 PuerTS/LGUI。C 不用假 UI 文件绕过普通构建检查。

由拥有原生执行队列的人显式构建，每次使用新的证据目录和空输出目录：

```text
node tests/unity/size-baseline.mjs build --editor <Unity.exe> --project <已准备工程> --evidence <新证据目录> --output <新输出目录/Baseline.exe>
```

Unity 6000.6.6f1、Windows x64、IL2CPP、C++ Release、managed Release、Low stripping、.NET Standard、`BuildOptions.None`、非 Development，默认 1280×720 Windowed/resizable。A 执行 Configure→Build；B/C 执行 Configure→官方 `GenV2WithoutWrapper`→Build。不生成类型 static wrapper。阶段之间分开 Editor 进程，记录真实配置、补丁和 Boot 摘要、BuildReport、警告和错误。构建后复用普通工具的实际分发/DontShip/V8 DLL统计与已编译桥核对，并从 Player Csc DAG 的真实响应文件验证 `/optimize+`。

B Player 可用 `-lguiBaselineResult <新的绝对JSON路径>` 明确执行自动探针。它创建原始 `JsEnv`、真实 V8 Eval 得 42、运行两次 Tick、Dispose 后写 JSON 并正常退出；不带该参数时保留普通窗口，销毁时释放环境。构建成功不能代替这项运行证据。

把 A/B/C 的 `acceptance.json` 和 D 的实际配置、分发统计传给 `compareBaselineMeasurements`；它拒绝不同配置，输出相邻对照的原始差值，保留负数。差值代表相同条件下的边际变化，包含裁剪、shader、资源和代码之间的影响。`GameAssembly.dll` 是聚合代码，不能把它全部归给 LGUI；packed assets、源码包大小和分发增量分别报告。
