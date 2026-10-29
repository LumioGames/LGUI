# 接入 Unity

`lgui unity export` 将同一份 `ui/`、`src/` 和 `i18n/` 导出给 Unity，不需要改游戏代码。

**什么时候做：** 先在网页端把全部功能做完，Unity 放在最后。

**前提：** 用户自己安装 Unity 6000.6（即 Unity 6.6），创建工程，并将官方 `PuerTS_Core_3.0.3.tar.gz`、`PuerTS_V8_3.0.3.tar.gz` 分别解压到工程的 `Packages/com.tencent.puerts.core/`、`Packages/com.tencent.puerts.v8/`。两个目录内的 `package.json` 都必须是 3.0.3。LGUI 不替用户装 Unity 和 PuerTS，也不修改 `Library/PackageCache/`。

**步骤**

1. 在 LGUI 工程里执行：`lgui unity export --to <Unity 工程路径>`。
   - **第一次导出：**
     - 把 Unity 包复制到 Unity 工程的 `Packages/com.lumiogames.lgui/`；
     - 检查 PuerTS 是否已安装、版本对不对；
     - 打上 Unity 6.6 的 4 处兼容补丁；
     - 生成一个启动场景。
     - 缺什么就明确报错，不跳过。
   - **每次导出：**
     - 比对 Unity 包的版本，和插件不一致就报错，提示运行 `lgui upgrade`；
     - 从 `ui/` 生成 Unity 用的界面包；
     - 把 `src/` 加上 Unity 适配层编译成一个 JS 文件；
     - 两者分别放进 `Assets/LGUI/Resources/UI/` 和 `Assets/LGUI/Resources/Game/`。Unity 打出来的游戏包，运行时只能按路径读取 `Resources` 文件夹里的东西；脚本存成 `game.js.txt`，因为 Unity 只把 `.txt`、`.bytes` 这类文件当文本资源。
     - 翻译文件放进 `Resources/UI/i18n/`；两个生成物目录各有 `README.txt`。先在 LGUI 的构建目录完成生成和打包，成功后才替换 Unity 产物并记录 `unityProject`。
     - 将包里的裁剪保留模板复制到 `Assets/LGUI/link.xml`。Unity 不处理 UPM 包内部的 `link.xml`，因此导出的这份文件必须保留。
2. 在 Unity 里打开启动场景，点 Play。

**导出后的 Unity 工程**

```
MyUnityGame/
├── Packages/
│   └── com.lumiogames.lgui/   # LGUI 的 Unity 包：C# 衔接代码 + FairyGUI-unity。第一次导出时装入，lgui upgrade 时替换
└── Assets/
    └── LGUI/
        ├── Resources/
        │   ├── UI/            # 由 ui/ 生成的界面包（.bytes + 图集），每次导出覆盖
        │   └── Game/          # 由 src/ 编译出的游戏代码（game.js.txt），每次导出覆盖
        ├── link.xml           # 导出时复制的动态调用裁剪保留声明
        └── LGUIBoot.unity     # 启动场景，第一次导出时生成，之后不覆盖
```

**规则**

- `Assets/LGUI/Resources/UI/` 和 `Assets/LGUI/Resources/Game/` 是生成物，不要在 Unity 里改。要改就回到 LGUI 工程的 `ui/`、`src/` 里改，然后重新导出。
- 用户自己的 Unity 代码（C#、平台 SDK 等）放在 `Assets/LGUI/` 以外的地方。游戏代码要用这些能力，就通过框架的平台服务接口去调。
- `ui/` 和 `src/` 不需要为 Unity 改任何一行。
- PuerTS 补丁只应用到上面的 embedded 本地包。导出会核对官方原文件和已补文件的 SHA256：原文件精确修改四处；已补文件明确跳过；其他内容报错，不会硬打。
- `game.js.txt` 在 Unity 中的资源名是 `game.js`，宿主使用 `Resources.Load<TextAsset>("Game/game.js")` 读取。

**常见报错：** `LGUI-CLI-052` 表示 Unity 版本、管理路径或文件/目录类型不对；管理路径不能使用链接重定向到其他用户资源。`LGUI-CLI-051` 表示本地 PuerTS 或补丁目标不对；`LGUI-CLI-003` 表示 LGUI 包版本不一致，运行 `lgui upgrade` 后再导出。`LGUI-CLI-050` 继续用于 `lgui check` 的 tsconfig 错误。

**IL2CPP 构建前：** 在 Unity 执行 `Tools/PuerTS/Generate il2cpp/Reflection Mode`（`GenV2WithoutWrapper()`）。它生成反射模式必需的原生桥与 metadata，不生成类型静态 wrapper。`lgui unity export` 只导出文件，不启动 Unity 或代替这个生成步骤。保留 PuerTS 生成目录里的 `link.xml` 和 `Assets/LGUI/link.xml`；前者不替代后者。

**接入后要看的三件事**

1. **文字：** Unity 和浏览器测量文字的方式不同，要实际看一遍有没有被截断。
2. **平台服务：** 存档位置、网络连接方式在 Unity 上有自己的实现，由框架提供，用户代码不用管。
3. **格式化：** PuerTS 的 V8 里有没有 `Intl`；没有的话由框架自己实现格式化。

**当前运行约定**

- Unity 包的 Editor 导入器只关闭 `Assets/LGUI/Resources/UI/<包名>_atlas<数字>.png` 的 mipmap，且要求同目录存在对应 `<包名>_fui.bytes`；不会更改用户的其他贴图设置。重新导出后让 Unity 完成正常导入。
- 艺术字每次改字释放上一批字符图片，关闭父界面也会递归释放。列表写入不同滚动目标会同步提交位置；横竖屏或语言重建保留滚动位置和选中项。相同位置赋值沿用 FairyGUI 的无操作语义，不承诺停止正在运行的惯性。
- 同时申请的普通 modal 按申请顺序显示；前项加载失败、取消或打开失败后，后项继续排队显示。
- 背包示例使用 `scrollBar="hidden"`。FairyGUI 的这一配置也会禁用滚轮滚动，列表可按住拖动；不要为了通过验证而改动滚轮输入的方向或数值。
- HTTP 请求遵守 Unity 工程的网络策略。启动请求被策略拒绝时，原生失败原因包含 `LGUI-RT-161`，公开 JS 网络层按既有 `LGUI-RT-101` 拒绝 Promise；外链图片走现有失败回调，音频记录 `LGUI-RT-161`。不会重试或修改系统代理，专用测试工程的 HTTP 放行设置不代表普通构建配置。
- 动态跨包图标需要真实的 UI 组件引用来生成包依赖；导出子组件的内部控件由 PartView 绑定。领奖示例通过可见的 `Bag/ItemIcon` 实例声明这一依赖。
- 实测 PuerTS 3.0.3 V8 没有 `Intl`，内置格式与浏览器存在显示差异，例如 `USD 123.5` 与 `$123.50`；日期还受宿主时区影响。不得关闭浏览器的 `Intl` 来制造字符串一致。
