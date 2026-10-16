# OpenFairyGUI 固定版本复验

本目录只包含此次新建、无敏感信息的背包工程。脚本写入固定的本目录 `project/`、`published/`、`codegen-probe/`，不接受任意生产工程路径。重新创建会覆盖本目录的生成 fixture。

环境：Node 24.18.0、npm 11.16.0。五个 OpenFairyGUI 包固定为 0.7.0，依赖的实际解析版本及 integrity 在 package-lock.json。

```powershell
cd <本目录>
npm ci --ignore-scripts --no-audit --no-fund
node create-project.mjs
node verify-agent.mjs
node export-dom-images.mjs
node probe-codegen.mjs
node probe-mcp.mjs
node node_modules/@openfairygui/cli/bin/cli.cjs doctor project/Inventory.fairy --json
```

`create-project.mjs` 使用正式 Document/UAM 写入 API；`verify-agent.mjs` 是正式 Backend 的实际消费者，覆盖完整事务/负向/逆操作恢复/保存/再打开/再发布。必须先 create 再 verify，确保基线一致。日志与结构化结果输出到相邻 `evidence/toolchain-*`。脚本断言失败会停止，不把 PowerShell 最后一条显示命令的退出码当成 Node 成功。

`probe-old-editor-sdk.mjs` 需要 `../repos/editor-online` 的 `npm ci --ignore-scripts` 依赖，用于把网页编辑失败缩小到 Inspector 生成了非法混合载荷。它在 Node 中运行同一 0.2.4 包及 checked-in browser bundle，不冒充网页同会话操作。

`published/layabox`、`published/unity` 是正式发布物。`published/dom` 是此次新增的窄适配输出：正式 Laya 二进制复制为 DOM 固定加载名 package.xml，同时通过 Backend revision 检查读取图片，导出 `manifest.json` 和散图。DOM 消费端须在 createObject 前应用 image ID 到散图 URL 的映射；本目录没有宣称原生 DOM 发布 lane 已存在。

工程：包 Inventory(invtest1)，Main(main0001)、ItemRow(itemrow1)、Reward(reward01)、Btn(button01)、icon(icon0001)。Main.enter 为 30fps/12帧 alpha 动效；ItemRow.state 有 locked/ready/claimed 页和 text/look gears。

网页编辑器复验：在 `../repos/editor-online` 执行 `npm ci --ignore-scripts --no-audit --no-fund`、`npm run dev -- --port 5199`，从“文件→从 ZIP 导入”导入本目录 Inventory.zip。双击 Main，选择 title，修改 Inspector 文本并失焦，固定版本会报 uam_snapshot_apply_failed；按方向键移动则可成功。浏览器保存进入 OPFS/IndexedDB，导入 ZIP 的源磁盘不会自动写回。停止服务器可在其终端按 Ctrl+C。

本次临时诊断仅扩展错误显示，已恢复；两个 clone 的 Git 工作区最终均无已跟踪文件改动。没有部署、登录、远程 fork、PR 或持久化扩展/MCP 安装。此次5199测试进程已停止，测试浏览器页已关闭。
