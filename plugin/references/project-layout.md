# 用户工程目录

用户对 Agent 说"帮我建一个 UI 工程"，Agent 执行 `lgui init`，得到下面的目录。文档里的 `lgui xxx` 都指 `node <插件目录>/tools/lgui.mjs xxx`。

```
MyGame/
├── ui/                        # 界面：FairyGUI 工程，界面资源和预制结构只在这里改
│   ├── UI.fairy               #   工程文件
│   ├── assets/                #   各个界面包（组件 XML、图片）
│   └── art-src/               #   AI 生成的原始大图：只作来源，界面不引用，不进游戏包
├── src/                       # 游戏代码，按 MVC 开发规范写
│   ├── main.ts                #   入口：选后端（默认 h5），启动游戏
│   └── modules/               #   一个功能一个文件夹
│       └── bag/
│           ├── BagModel.ts    #     数据和规则
│           ├── BagView.ts     #     对应 ui/ 里的一个组件，只负责显示和转发事件
│           └── BagController.ts #   处理事件、改数据、调服务
├── tests/                     # 单元测试：用测试后端在 Node 里跑，不需要浏览器
├── i18n/                      # 文本表：每种语言一个 <语言>.json
├── .lgui/                     # LGUI 自己的东西，用户不用管
│   ├── project.json           #   工程配置（字段见下）
│   ├── framework/             #   建工程时从插件复制一份框架进来，锁定版本
│   └── build/                 #   生成物，不手改，不进 git：预览文件、控件类型（types/）、本地连接文件
├── package.json               # 只有工程名称等少量字段，不需要 npm install
└── .gitignore                 # 忽略 .lgui/build/、node_modules/
```

**`.lgui/project.json` 的字段：** 工程名称、LGUI 版本号、设计尺寸、方向（`orientation`）、标准验证尺寸、语言列表、按平台的「按键 → 动作」映射、界面缓存策略、统一错误提示、默认占位图、默认后端、Unity 工程路径（可选）。

**说明**

- **用户只碰 `ui/`、`src/`、`tests/`、`i18n/`。**
- **框架复制进工程，不走 npm 安装。** 离线可用，版本固定，同一工程在谁的机器上跑都一样。插件和工程的版本不一致时，命令会直接报错，提示运行 `lgui upgrade`。
- **游戏代码的写法。** `src/main.ts` 里 `import` 的是 `lgui`，指向 `.lgui/framework/`；需要的配置由 `lgui init` 生成。游戏代码不出现 `document`、`window`、`CS.` 这类引擎或平台的 API，这一条由 `lgui check` 检查。
- **`src/modules/` 里的细节以 MVC 开发规范为准。** 比如文件怎么命名、服务放在哪里。本节只定到"一个功能一个文件夹"。
- **日常命令。** 预览用 `lgui dev`（打开浏览器，改动后自动刷新），改界面用 `lgui editor`（打开编辑器，保存直接写回 `ui/`），检查用 `lgui check`，测试用 `lgui test`。
- **队友和 CI。** 也要装插件，才能运行 `lgui` 命令。
