# 从需求到版本发布

1. **需求与参考**：给出 UI 目标、交互、参考图、资源来源及目标视口。先运行 lgui-setup 初始化配置/目录。使用 lgui-author 分析可伸缩框架、文本与透明资源；保留来源/hash，背包数据不能变成通用约束。
2. **工程编辑**：启动 `editor` 并导入工作区 `toolchain-test/Inventory.zip` 作为会话协议示例；当前精细背包源工程在 `unity-migration/complex-inventory/project/`。使用其导出的 ZIP 打开精细 UI。编辑器和 fidelity 预览是不同页面，保存编辑器不会自动改手工组装 fidelity。
3. **预检提交**：运行 lgui-edit；clients → state/query → 真实 ID → preflight → transact。所有写请求经过同一队列。完整协议和 JSON 例子见 [会话参考](../skills/lgui-edit/references/session.md)。
4. **保存读回**：save 必须 verified，检查 dirty=false，重开查询；结果未知时原 requestId/载荷精确重试。不能绕过现场改磁盘冒充共享编辑。
5. **发布**：export 写入用户指定的新 ZIP。通用发布器支持任意有效 .fairy 包，使用锁定 SDK 0.7.0 校验后发布 unity 或 layabox；它不生成通用网页适配器或 PuerTS AOT 绑定。

```powershell
node $Lgui agent --workspace $Workspace clients
node $Lgui agent --workspace $Workspace call <clientId> <请求JSON绝对路径>
node $Lgui agent --workspace $Workspace call <clientId> <export请求JSON绝对路径> <新ZIP绝对路径>
node $Lgui publish --workspace $Workspace --input <已保存ZIP或fairy绝对路径> --output <工作区内新目录绝对路径> --target unity
```

6. **网页验证**：`build-web` → `serve` → `test` → `verify-browser -- --browser chrome`；Edge 同理。`verify-editor -- --persistent` 检验独立浏览器重启后的会话保存。自动化基于参考背包；新 UI 必须按自身控件适配测试。截图需人工检查，功能断言不等于视觉一致。
7. **原生验证**：`bootstrap --install --unity`、`build-web`、`unity-setup`，再 prepare/generate/build/editor-auto/player。命令与前置见 [Unity 参考](../skills/lgui-unity/references/native.md)。记录编译、运行、视觉和用户验收各自结果。
8. **版本发布**：维护者执行 [发布流程](release.md)，校验两端入口、独立包、测试及文档，再 PR 合并。插件包不含 Windows Player；原生二进制再发行须补齐相应第三方通知。

上述 CLI 除 init 外都要求已初始化的 `--workspace`。Shell cwd 可以是任意位置。运行脚本和读取模板来自插件缓存；可变工程和证据来自用户工作区。新增 UI 可复用诊断、会话、发布与包工具；当前初始化模板、网页构建和 native setup 明确属于背包示例。
