# UI skill 来源与去重

2026-10-16，维护者提供 `fairygui-ui-skill.rar`，并明确确认“团队原创，可随 LGUI 按 MIT 发布”。原包 SHA256：`e0ac8457ea7214d34a74f3297b570d5cff7096a87e06cb383a94b4504d25a858`。原文件为 fairygui-ui/SKILL.md 及 references 下 component-instancing、measure-verify、pitfalls、transition、xml-format 五份 Markdown。原包没有独立许可文件；本次授权记录覆盖导入内容，原创 MIT 入口保持不变。

不新增重复触发的第六个技能。原有 [lgui-author](../skills/lgui-author/SKILL.md) 承接其设计与结构知识，五份 references 在该技能下维护唯一版本。压缩包/个人下载路径不随插件分发。

| 原内容 | 与现有内容关系 | 整合方式 |
|---|---|---|
| 参考图、素材来源、响应式布局 | 与 author/verify 重复 | 保留原入口；补充测量依据与实际渲染限制 |
| 稳定 ID、最小改动、来源和证据 | 与维护规则重复 | 引用共同规则，不复制第二套 |
| 编辑、刷新、保存 | 与 edit 重复且直接磁盘写有冲突 | 在线继续共用会话；离线快照才允许文件编辑 |
| 组件实例、属性、控制器、relation | 新增细节 | 独立设计分册，结合当前编辑器能力边界 |
| 九宫格、动效初值/重播、设计排错 | 新增细节 | 分册按任务读取，不全量灌入主技能 |
| 固定产品路径、绑定前缀、背景包、业务 key | 来自来源工程，不是 LGUI 约束 | 改为目标工程查证项；不保留固定产品名或私人规则路径 |
| 全部示例“已验证” | 没有附可迁移的运行证据 | 改为语法/设计参考；不得沿用其原工程通过结论 |

已核对固定编辑器的 ComponentCustomPropertyDefinition 与 DisplayNodePropsLogic：当前命令只接受 propertyId 0/1，不能把原文更广的原生属性枚举写成在线客户端已支持。原文“尺寸超过素材就量错”“统一宽 inset”“固定弹窗遮罩框架”等也已改为有适用条件的设计判断。

本次导入不改动示例 UI，不宣称五份文档示意都经过跨端渲染验证。包/链接检查与两客户端技能调用检查见 [证据](evidence.md)。
