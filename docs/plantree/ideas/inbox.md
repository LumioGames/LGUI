# 想法池（未承诺）

- **XML 直载链进 LGUI 生成管线**：fairygui-cocos fork 能运行时直接解析 FairyGUI 工程 XML（addPackageFromXML）。LGUI 的 `ui/` 就是 XML——若 Cocos 端走 XML 直载，可能跳过 OpenFairyGUI 二进制编译环节。但该链粒度粗（整组件同步组装、无 child 级拆帧/pool），M1 先用二进制链，待 T013 评估。来源：fork kb/fairygui-load-pipeline.md。
- **Cocos 端 h5 复用**：LGUI h5 后端跑在 Cocos 的 Web 预览里理论可行（都是浏览器），或可作为 testbed 的快速冒烟通道——待验证与 M1 适配层的关系，避免两条路径混淆。
- **fork 的实时会话经验反哺 h5 编辑器**：fork 与 build-editor 补丁都做过「Agent 实时改属性」中转，M2 设计 editor props 工具时可两边对照。
