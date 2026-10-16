# 故障排查

| 症状 | 检查与处理 |
|---|---|
| 技能看不见 | 核对客户端版本、marketplace、plugin list；安装后新开会话。Claude 用命名空间命令。只验证 JSON 不能证明已加载 |
| 没有工作区 | 安装后先调用 lgui-setup；给出绝对路径。插件缓存不能当工程目录 |
| init 报 differing/modified | 保留用户改动；选择新目录或手工比对，不提供 force 覆盖 |
| bootstrap hash/HEAD/patch 失败 | 检查固定版本与用户改动；不 reset/clean。不修改 hash 来掩盖未知来源 |
| node_modules 已存在 | bootstrap 只检查 required 版本和原生 sharp 加载，不是完整磁盘完整性审计。怀疑被改时手工移到备份目录后重装 |
| SDK 混装 | 根仅验证工具，toolchain-test 为 0.7.0，repos/editor-online 为 0.2.4；分别使用各自 lockfile |
| clients 为空 | editor 需保持运行，浏览器 URL 必须含 ?agent=1，连接文件来自这次启动，且浏览器打开了工程 |
| revision 冲突 | 重新 query 对齐用户改动，再重新预检；不可盲目用新 revision 覆盖 |
| result_unknown / timeout | 同 requestId + 完全相同 payload 精确重试；不生成新 ID。浏览器重开后先查新 identity |
| 保存后磁盘没变 | 保存写浏览器 OPFS/IndexedDB；显式 export 才得到 ZIP；发布读取这个已保存快照 |
| 网页编辑与 fidelity 不一致 | fidelity 是手工组件组装；源包和网页投影尚未全自动同步，需适配代码并验证 |
| 浏览器检查找不到 Chrome/Edge | 安装测试所需浏览器；现有参考脚本针对 Windows 标准位置，不会下载浏览器或读取个人 profile |
| Unity 找不到或 license/module 不全 | 设置 UNITY_EDITOR 或 -UnityEditor；核对 6000.6.6f1、Windows IL2CPP/C++ 工具与有效许可证。其他验证继续执行 |
| 构建成功但文本裁切 | 看实际运行截图与实际尺寸；不能以编译替代运行或视觉验收 |

报告问题时提供命令、版本、实际视口和去敏日志，保留失败证据。不要附带 connection.local.json、token、浏览器 profile、系统字体、许可证或个人机器配置。

## 深工作目录下浏览器保存或导入失败

若日志为 IndexedDB backing store 打不开，检查隔离浏览器 profile 的绝对路径长度。本轮在深 Windows 工作区复现；持久化测试已改用系统临时目录下的独立短路径，仍保存前后进程证据。不要清理用户浏览器 profile 来绕过测试。
