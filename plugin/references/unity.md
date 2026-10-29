# 接入 Unity

> **阶段 3 实现。** 下面写的是定好的做法，命令和 Unity 包还没有做出来。

**什么时候做：** 先在网页端把全部功能做完，Unity 放在最后。

**前提：** 用户自己安装 Unity 6000.6（即 Unity 6.6），并在 Unity 工程里按 PuerTS 官方说明装好 PuerTS 3.0.3。LGUI 不替用户装 Unity 和 PuerTS。

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
        └── LGUIBoot.unity     # 启动场景，第一次导出时生成，之后不覆盖
```

**规则**

- `Assets/LGUI/Resources/UI/` 和 `Assets/LGUI/Resources/Game/` 是生成物，不要在 Unity 里改。要改就回到 LGUI 工程的 `ui/`、`src/` 里改，然后重新导出。
- 用户自己的 Unity 代码（C#、平台 SDK 等）放在 `Assets/LGUI/` 以外的地方。游戏代码要用这些能力，就通过框架的平台服务接口去调。
- `ui/` 和 `src/` 不需要为 Unity 改任何一行。
- PuerTS 的补丁要打在用户工程能改的那份 PuerTS 上。如果按官方方式安装后 PuerTS 在 Unity 的包缓存里、改了会被还原，就要求用户把 PuerTS 装成本地包。这一点在阶段 3 验证。

**接入后要看的三件事**

1. **文字：** Unity 和浏览器测量文字的方式不同，要实际看一遍有没有被截断。
2. **平台服务：** 存档位置、网络连接方式在 Unity 上有自己的实现，由框架提供，用户代码不用管。
3. **格式化：** PuerTS 的 V8 里有没有 `Intl`；没有的话由框架自己实现格式化。
