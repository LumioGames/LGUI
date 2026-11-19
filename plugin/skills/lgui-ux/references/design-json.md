# design.json 的字段

UX 设计稿只有这一个源文件，放在工程的 `design/<名字>/design.json`（原型图放旁边的 `reference/`）。`lgui ux page` 校验它并生成原型页（`prototype.html`、`wireframe/<画面>-<方向>.png`、`art/<页号>.txt`、全套模式的 `handoff.md`，每次覆盖同名文件，不清空文件夹；删掉的画面留下的旧线框图自己删）；写错了报 `LGUI-CLI-163`，一次列出全部问题。所有位置和尺寸都是**设计单位**（原图像素 × `scale`）。

```json
{
  "name": "shop",
  "lguiVersion": "0.6.0",
  "mode": "design",
  "source": {"kind": "screenshot", "original": false, "note": "只对位置、尺寸、质感和颜色"},
  "project": {"platforms": ["web"], "inputs": ["touch"]},
  "references": [{"file": "reference/shop.png", "screen": "shop", "orientation": "portrait", "scale": 1.2, "size": [900, 1600]}],
  "screens": [
    {
      "id": "shop", "name": "商店", "layer": "page", "fullscreen": true, "pattern": "grid", "entry": "大厅的商店页签",
      "flow": ["打开商店 → 读商品列表 → 显示。", "点商品 → 打开购买确认。"],
      "elements": [
        {"id": "B01", "name": "背景", "type": "image", "scope": "display",
         "rect": {"portrait": [0, 0, 1080, 1920], "landscape": [0, 0, 1920, 1080]},
         "anchor": "fill", "anchorTo": "screen", "source": {"portrait": "measured", "landscape": "designed"}, "assets": ["shopBg"]},
        {"id": "T01", "name": "金币栏", "type": "button", "control": "goldBar", "component": "CurrencyBar", "scope": "full",
         "rect": {"portrait": [24, 60, 240, 64], "landscape": [24, 40, 240, 64]},
         "anchor": "left-top", "source": {"portrait": "measured", "landscape": "designed"},
         "action": "打开金币购买", "opens": "buy", "data": "player.gold", "uses": ["format.compact", "roll"],
         "text": {"content": {"zh-CN": "1.6万", "en": "16.3K"}, "dynamic": true, "fontSize": 32, "color": "#ffffff", "stroke": [2, "#020000"], "align": "center", "overflow": "shrink", "width": 150}},
        {"id": "G01", "name": "商品列表", "type": "list", "control": "list", "scope": "full",
         "rect": {"portrait": [40, 200, 1000, 1500], "landscape": [60, 160, 1800, 860]},
         "anchor": {"portrait": "stretch-stretch", "landscape": "stretch-stretch"}, "source": {"portrait": "measured", "landscape": "designed"},
         "reuse": {"from": "new"}, "list": {"mode": "scroll", "min": 0, "typical": 8, "max": 60},
         "states": [{"name": "空", "look": "中间显示「暂无商品」", "when": "列表是空的"}]}
      ]
    },
    {"id": "buy", "name": "购买确认", "layer": "popup", "fullscreen": false, "designed": false, "entry": "T01"}
  ],
  "components": [
    {"id": "CurrencyBar", "name": "货币栏", "type": "button", "size": [240, 64], "reuse": {"from": "project", "ref": "Common/CurrencyBar"},
     "parts": [
       {"name": "icon", "type": "loader", "rect": [0, -4, 72, 72]},
       {"name": "title", "type": "text", "rect": [72, 0, 150, 64]}
     ]}
  ],
  "assets": [
    {"id": "shopBg", "kind": "illustration", "size": [1080, 2400], "package": "Shop", "reuse": {"from": "new"}, "by": "ai"}
  ],
  "open": [
    {"id": "O-01", "question": "商品卡要不要显示折扣角标", "owner": "user", "default": "先不做", "blocks": ["G01"]}
  ],
  "cases": []
}
```

## 最外层

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | 是 | 短名字（小写字母、数字、连字符），也是文件夹名 |
| `lguiVersion` | 建议 | 出这份设计稿时的插件版本；和现在的插件不一样时 `lgui ux page` 提醒对照更新记录 |
| `mode` | 否 | `design`（默认）只出设计稿；`full` 再生成开发交接 `handoff.md`，并检查每个完整实现的元素有用例 |
| `source` | 是 | `kind`：`screenshot` 别的产品的截图、`mockup` 自己的效果图、`wireframe` 线框草图；`original`：是不是自己的作品 |
| `project` | 否 | 设计条件。在工程里时方向、设计尺寸、语言、验证尺寸读 `.lgui/project.json`，这里只写工程配置里没有的 `platforms`（`web`、`unity`）和 `inputs`（`touch`、`keyboardMouse`）；不在工程里时全部写在这里（`orientation`、`designSize: {portrait: [宽, 高], landscape: […]}`、`languages`、`defaultLanguage`）。这里写了的优先 |
| `references` | 否 | 原型图：`file`（相对 design.json）、`screen`、`orientation`、`scale`（设计单位 ÷ 原图像素）、`size`（原图的宽高，用来核对比例） |
| `screens` | 是 | 画面，第一个是入口画面 |
| `components` | 否 | 重复出现的结构，定义一次 |
| `assets` | 否 | 要出的图、声音、字体 |
| `open` | 否 | 未定事项 |
| `renames` | 否 | 原创替换表（原型图不是自己的作品时）：`[{"what": "玩家名", "from": "原图里的字", "to": "我们的字"}]`。两边宽度差太多会警告，换了字排出来就不一样宽 |
| `cases` | 否 | 行为用例（全套模式） |

编号（画面、元素、组件、资源、用例、未定事项的 `id`）在整份设计稿里唯一。

## 画面 `screens[]`

| 字段 | 必填 | 说明 |
|---|---|---|
| `id`、`name` | 是 | 编号和给人看的名字 |
| `layer` | 是 | `page`、`popup`、`modal`、`hud`、`toast`（MVC 开发规范第 10 节） |
| `fullscreen` | 是 | 全屏界面每个方向一套位置；不是全屏的（弹窗）只要一套，框架把它放在安全区正中 |
| `designed` | 否 | `false`：只记有这个画面和它的入口，不设计（图里没有、用户没要求设计的画面） |
| `pattern` | 否 | 整个画面套用的排布模式：`split`、`tabs`、`grid`、`dialog` |
| `entry` | 否 | 从哪进来（元素编号或一句话） |
| `flow` | 否 | 流程步骤，一步一句 |
| `elements` | 是 | 元素；顺序就是层叠顺序，后面的在上面 |

## 元素 `elements[]`

| 字段 | 必填 | 说明 |
|---|---|---|
| `id`、`name` | 是 | 编号和名字 |
| `type` | 是 | `button`、`label`、`component`、`list`、`tree`、`loader`、`image`、`text`、`richtext`、`input`、`graph`、`progress`、`slider`、`combobox`、`movieclip`、`group`（和 `lgui ui list` 里的控件类型一致） |
| `scope` | 是 | `full` 完整实现、`stub` 占位、`display` 只显示 |
| `rect` | 是 | `[x, y, 宽, 高]`。两个方向不一样时写 `{"portrait": […], "landscape": […]}`；全屏画面里工程要求的方向都要有 |
| `anchor` | 顶层元素必填 | 贴哪边：`<水平>-<垂直>`，水平 `left`、`center`、`right`、`stretch`，垂直 `top`、`middle`、`bottom`、`stretch`；铺满写 `fill`。可以按方向分开写。有 `parent` 的元素跟着上级，可以不写 |
| `anchorTo` | 否 | `screen`：贴屏幕边（背景）；不写是贴安全区 |
| `source` | 是 | `measured` 在原型图上量的、`estimated` 估的、`designed` 自己设计的；可以按方向分开写 |
| `control` | 否 | 以后的控件名（小写开头的驼峰，子控件用点号，列表项写 `list[0]`） |
| `parent` | 否 | 上级元素的编号（同一个画面里） |
| `component` | 否 | 是哪个组件的实例（`components` 里的编号） |
| `action`、`opens`、`closes` | 否 | 点了做什么（一句话）；打开哪个画面；`closes: true` 表示它关闭所在的弹窗 |
| `states` | 否 | `[{name, look, when}]`：叫什么、长什么样、什么时候 |
| `data` | 否 | 绑定的数据（比如 `player.gold`） |
| `reuse` | 要做成组件的必填 | 复用来源，见下。文字、图片、图形、组可以不写；写了 `component` 的看组件的 |
| `uses` | 否 | 用到的框架能力：绑定词（`roll`、`tick`、`redDot`…）或规范里的写法（`format.compact`、`lgui.confirm`…） |
| `text` | 文字元素必填 | 见下 |
| `list` | 列表必填 | `{mode: "scroll" \| "fixed", min, typical, max}`：能不能滚，最少、常见、最多几项 |
| `assets` | 否 | 用到的资源编号 |
| `note` | 否 | 备注 |

### 复用来源 `reuse`

`{"from": …, "ref": …, "to": …}`。`from`：`framework` 框架自带直接用、`reskin` 框架自带换样子、`pattern` 排布模式、`project` 工程已有、`new` 新建、`none` 不需要。前四种要写 `ref`（`Common/RedDot`、`dialog`、`Common/CurrencyBar`）；`new` 可以写 `to` 指明放进哪个包（两个以上画面要用就写 `"to": "Common"`）。`ref` 指的东西不存在会报错：框架自带的对照 UI 开发规范第 10 节，工程已有的对照工程里的组件和图片（`lgui ui list --shared`）。

### 文字 `text`

| 字段 | 必填 | 说明 |
|---|---|---|
| `content` | 是 | 按语言写：`{"zh-CN": "开始游戏", "en": "Start"}`。默认语言必填，没翻译的可以先不写 |
| `fontSize` | 是 | 字号 |
| `overflow` | 是 | 超长怎么办：`shrink`、`ellipsis`、`height`、`both`（UI 开发规范第 8 节） |
| `dynamic` | 否 | `true`：内容会变（数字、名字），`content` 写原型图上当时的样子 |
| `color`、`background` | 否 | 字的颜色、它压着的底色（`#rrggbb`）；两个都写且没有描边时查对比度 |
| `stroke`、`shadow` | 否 | `[粗细, 颜色]`、`[x, y, 颜色]` |
| `align` | 否 | `left`、`center`、`right` |
| `width` | 否 | 文字框的宽度；不写用元素的宽度 |
| `image` | 否 | `true`：字在图片里（带字图片），不查字号和宽度 |

## 组件 `components[]`

`id`（大写开头的驼峰，就是以后的组件名）、`name`、`type`、`size: [宽, 高]`、`reuse`（必填）、`uses`、`parts`。零件 `parts[]`：`name`（小写开头的驼峰，就是以后的控件名）、`type`、`rect`（相对组件左上角）、`text`、`assets`。按钮、标签、下拉框里显示标题的文字零件叫 `title`，图标叫 `icon`，红点叫 `redDot`。

## 资源 `assets[]`

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 小写开头的驼峰，就是以后的图片名 |
| `kind` | 是 | `image`、`illustration`（插画、背景）、`textImage`（带字图片）、`sound`、`font`、`artfont`（美术字）、`icon`（代码图标） |
| `size` | 图片必填 | 导出尺寸 `[宽, 高]` |
| `nine`、`tile`、`radius` | 否 | 九宫格边距 `[左, 上, 右, 下]`（0 表示这个方向不拉伸）；`tile: true` 横向平铺；圆角半径（边距不能比它小） |
| `package` | 否 | 放进哪个包，不写是 `Common` |
| `reuse` | 是 | 同上；工程里已经有的写 `{"from": "project", "ref": "Common/coin"}` |
| `by` | 是 | 谁出：`ai`、`artist`、`code`（代码合成或代码图标）、`existing`（已有素材） |
| `sheet`、`fit` | 否 | AI 出图时的图集页号；`fit` 同 `lgui art cut` 名字文件里的 `fit` |
| `languages` | 否 | 带字图片确认要每种语言出一版时写 `true` |
| `note` | 否 | 质感、画什么 |

## 未定事项 `open[]`

`id`、`question`（要定什么）、`owner`（`user` 或 `agent`）、`default`（没人答时怎么办）、`decided`（定了以后写结论）、`blocks`（卡住哪些编号）。

## 行为用例 `cases[]`

`id`、`name`、`steps`（怎么操作）、`expect`（应该看到什么）、`covers`（覆盖的元素编号）、`runner`：`headless`、`browser`、`visual`。

## `lgui ux page` 查什么

**报错（不生成）：** 字段缺失或写错；编号重复；引用了不存在的画面、元素、组件、资源；全屏画面缺某个方向的位置、贴边方式、数值来源；文字缺超长处理；复用来源或框架能力指向不存在的东西；九宫格边距占满了图。

**警告（照样生成，逐条处理或和用户确认）：**

| 警告 | 依据 |
|---|---|
| 字号小于 20；描边加投影超过字号的 7.5% | 框架上限，拼界面时 `lgui check` 会报 `LGUI-UI-011`、`LGUI-UI-081` |
| 字在最小的验证尺寸上不到 8 像素；能点的东西不到 24 像素 | 按 `verifySizes` 里最小的屏幕换算 |
| 某种语言的文字放不下 | 按字数估宽度，没翻译的按加长 40% 估；估算，最后以 `lgui verify --lang pseudo` 为准 |
| 文字和底色对比度低于 3 | 写了 `color` 和 `background` 且没有描边时 |
| 目标平台有 Unity 却用了代码图标 | 导出会报 `LGUI-CLI-144` |
| 带字图片没确认各语言版本；有从右往左的语言 | UI 开发规范第 9 节 |
| 有键盘鼠标时，全屏画面底部 64 设计像素里有能点的东西 | 操作提示栏占这一条（UI 开发规范第 7.3、10 节） |
| 替换的文字和原文宽度差 20% 以上 | 按字数估 |
| 九宫格边距比圆角小；图比图集上限大；同一页图集尺寸差 2.5 倍以上 | UI 开发规范第 5 节，`LGUI-CLI-111`、`LGUI-CLI-113` |
| 从第一个画面走不到的画面；没有关闭元素的弹窗 | 按 `opens`、`closes` 算 |
| 没人用的组件和资源；新建的组件在两个以上画面用到却没放进 Common | — |
| 完整实现的元素没有用例（全套模式）；未定事项没有默认做法 | — |
| 原型图换算后和设计尺寸对不上；设计稿的插件版本和现在不一样；不在工程里没法核对「工程已有」 | — |
