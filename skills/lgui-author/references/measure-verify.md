# 参考图测量与实际画面对照

先确定用户提供的是标注图、干净效果图还是运行截图。标注图用于字体/颜色/素材规格，干净图用于位置对照；精确匹配界面与状态，不凭相似文件名选图。记录图片尺寸、来源及 SHA256。

尺寸依据依次考虑真实素材、目标工程同类界面的数值、对齐/等分关系，目测只作初稿。先确定区块基准线，再做块内排列。素材尺寸较小不代表测量错误：九宫格背景可拉伸，图标则需关注比例与采样质量。

先做可审阅草稿，再逐块迭代，不把测量变成无限前置阶段。适当的叠图/区域对照能发现错位，但字体、透明度、九宫格与平台缩放应以真实渲染为准；人工贴图合成不能替代编辑器、浏览器或 Player 的截图。

LGUI 参考工程已有实际命令，不依赖原技能假定的 Python 2/3 安装或私人 scratchpad：

```text
node <installed-plugin>/tools/lgui.mjs build-web --workspace <absolute-workspace>
node <installed-plugin>/tools/lgui.mjs serve --workspace <absolute-workspace>
node <installed-plugin>/tools/lgui.mjs verify-browser --workspace <absolute-workspace> -- --browser chrome
```

它们验证背包参考的网页投影。新 UI 需要按自己的控件和视口适配验证脚本，不应把背包通过数套到新设计。在线 FairyGUI 编辑器的保存与进程重启见 [会话验证](../../lgui-edit/references/session.md)。

交付时记录请求/实际视口、真实截图路径、文字溢出、拉伸边缘、空态、混合状态、遮罩和交互反馈。无法渲染的部分明确标未测；不承诺“零重影即逐像素一致”。图像生成/编辑使用当前宿主提供的合适工具，脚本仅承担已有确定性切片或数据校验。
