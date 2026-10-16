import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const out = path.dirname(fileURLToPath(import.meta.url));
const validation = path.resolve(out, '..');
const complex = path.join(validation, 'unity-migration/complex-inventory');
const ev = path.join(complex, 'fidelity/evidence');
const readJSON = async p => JSON.parse((await fs.readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
const [architecture, foundation, runtime] = await Promise.all([
  readJSON(path.join(ev, 'document-architecture-notes.json')),
  readJSON(path.join(ev, 'document-foundation-notes.json')),
  readJSON(path.join(ev, 'document-runtime-facts.json')),
]);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const refs = new Map();
const relativeURL = p => path.relative(out, p).split(path.sep).map(encodeURIComponent).join('/');
function link(p, label) {
  const absolute = path.isAbsolute(p) ? path.resolve(p) : path.resolve(validation, p);
  if (!absolute.startsWith(validation + path.sep)) throw Error('Reference outside validation: ' + p);
  if (absolute.includes(path.sep+'build'+path.sep) && !existsSync(absolute)) return `<span>${esc(path.relative(validation,absolute).replaceAll('\\','/'))}（原机产物，开源源码不附带）</span>`;
  refs.set(absolute, {path: absolute, label: label || path.basename(p)});
  return `<a href="${relativeURL(absolute)}" data-local-reference>${esc(label || path.basename(p))}<span class="link-arrow" aria-hidden="true"> ↗</span></a>`;
}
const cp = (p, label) => link(path.resolve(complex, p), label);
const fp = (id, label) => {const s = foundation.sources.find(x=>x.id===id); if(!s)throw Error(id); return link(s.relativePath.replace(/^验证\//,''),label||s.id);};
const citations = items => `<div class="citations">证据 · ${items.join(' · ')}</div>`;
const badge = (label, type='green') => `<span class="badge ${type}">${esc(label)}</span>`;
const code = s => `<code>${esc(s)}</code>`;
const bullets = items => `<ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>`;
const table = (head, rows, cls='') => `<div class="table-wrap ${cls}" tabindex="0"><table><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const section = (id, n, title, lead, body) => `<section id="${id}" class="chapter"><div class="chapter-heading"><span class="chapter-number">${n}</span><div><h2>${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</div></div>${body}</section>`;
const note = (title, body, kind='') => `<aside class="note ${kind}"><strong>${title}</strong><div>${body}</div></aside>`;
const images = [];
async function figure(relative, title, caption, cls='') {
  const absolute = path.resolve(complex, relative);
  const bytes = await fs.readFile(absolute);
  images.push({path: path.relative(validation, absolute).replaceAll('\\','/'), bytes: bytes.length, sha256:sha(bytes)});
  return `<figure class="${cls}"><button class="image-button" type="button" data-image-title="${esc(title)}" aria-label="放大：${esc(title)}"><img src="data:image/png;base64,${bytes.toString('base64')}" alt="${esc(title)}" loading="eager" decoding="async"></button><figcaption><strong>${title}</strong><span>${caption}</span></figcaption></figure>`;
}
const [reference, web, narrow, native, nativeNarrow] = await Promise.all([
  figure('art/reference.png','设计参考 · 1586 × 992','本次生成的美术方向：深海军蓝、旧金属边框与高对比物件；这是目标图，不是运行截图。','reference-figure'),
  figure('fidelity/evidence/button-skins-2026-10-16T10-18-55.338Z/794.png','网页实拍 · 794 × 727','同窗口自适应为 4 列 × 6 行；按钮、金币、数量和详情都是可交互控件。此图记录按钮修复阶段。'),
  figure('fidelity/evidence/narrow-layout-2026-10-16T10-28-39.024Z/390-ring.png','网页窄窗 · 390 × 844','2 列 × 12 行，戒指按透明主体等比显示；搜索、分类与详情重新排版。此图记录窄屏修复阶段。','portrait'),
  figure('fidelity/evidence/unity-player-release-first-1103/player-1280x800-sword.png','Unity IL2CPP Player · 1280 × 800','实际原生渲染，使用正式发布包。此图来自说明高度补丁前：第三行说明裁切的失败证据被保留。'),
  figure('fidelity/evidence/unity-player-release-first-1103/player-486x727-ring.png','Unity IL2CPP Player · 486 × 727','实际窗口为 3 列 × 8 行；同一 TS 业务、布局数据与透明物件，原生宿主负责绘制。','portrait'),
]);

const summary = section('decision','01','结论与采用边界','建议继续 FairyGUI 主线，作为需要维护适配层的跨端方案有限采用。',`
  <p>本次从同一个背包工程出发，完成了独立浏览器运行、Agent 与网页编辑器共用状态及保存、纯 TS 业务复用、正式资源发布，以及 Unity Editor 和 Windows x64 IL2CPP 的实际运行。用户已明确<strong>验收通过</strong>。</p>
  <div class="three-up"><div class="summary-card"><span class="eyebrow">可复用的核心</span><h3>业务规则与资产</h3><p>装备、消耗、出售、奖励、存档 schema 与原子失败规则留在纯 TS；图片、资源 ID 与几何布局跨端复用。</p></div><div class="summary-card"><span class="eyebrow">必须维护的部分</span><h3>两个平台适配</h3><p>DOM 与 Unity 的控件实例化、字体测量、事件、存储、资源载入和生命周期仍需各自实现。</p></div><div class="summary-card"><span class="eyebrow">工程化的关键</span><h3>可审查的闭环</h3><p>编辑器有唯一状态所有者；写入受 session、revision 与 requestId 约束；保存后读回，运行时记录实际输入哈希。</p></div></div>
  ${note('交付状态按证据分别记录', '用户验收通过；最终 Windows x64 IL2CPP Release 已构建成功。最近一次完整 Player 运行的业务检查为 46/46，但说明裁切使当轮总体为 failed；之后的原生高度补丁已编译，尚无补丁后运行复验报告。原机曾生成构建目录，ZIP 未生成；此开源仓库不附带 Player 二进制。详见第 7 节。','amber')}
  <p>“1:1”应先定义固定画布的美术与几何目标，再单独定义窄窗重排规则。自适应版本改变行列与区域分配，保留美术风格、物件比例和控件可用性；本次用户验收不等同于所有平台逐像素相同。</p>
  ${citations([fp('closed-loop-report','编辑闭环报告'),fp('fidelity-publish','正式发布结果'),cp('fidelity/evidence/document-runtime-facts.json','运行事实核对')])}
`);

const architectureSection = section('architecture','02','方案：把变化留在适配层','共享业务与几何；平台负责控件、输入和资源。编辑器会话闭环是独立的一条链。',`
  <div class="architecture" role="img" aria-label="共享纯 TS 业务、几何布局与美术资源，通过 DOM 和 Unity 两个平台适配运行；编辑器通过正式 SDK 发布资源。">
    <div class="arch-top"><span>人类可视化编辑</span><b>＋</b><span>Agent 结构化事务</span></div>
    <div class="arch-arrow">↓ 同一 EditorProjectSession · 队列 / revision / history / save</div>
    <div class="arch-source"><strong>Inventory.fairy · 固定资源 ID</strong><span>正式 SDK 校验、保存、重开、发布与读回</span></div>
    <div class="arch-arrow">↓</div>
    <div class="shared-strip"><div><strong>纯 TS 业务</strong><small>状态 / 动作 / 奖励 / 存档 JSON</small></div><div><strong>纯布局函数</strong><small>视口 → 几何数据</small></div><div><strong>同源素材与映射</strong><small>skin / tile / detail / 九宫格</small></div></div>
    <div class="arch-arrow">↓ 平台契约</div>
    <div class="platforms"><div><span class="eyebrow">WEB</span><h3>FairyGUI-dom</h3><p>DOM 控件与真实浏览器事件<br>当前 fidelity 手工组装组件<br>散图与 localStorage</p></div><div><span class="eyebrow">UNITY</span><h3>FairyGUI-unity ＋ PuerTS V8</h3><p>正式 ComplexMain / ItemSlot 资源包<br>C# 原生宿主与 JSON 调用桥<br>四页图集与本地文件存档</p></div></div>
  </div>
  ${table(['层','本次实现','共享边界'],[
    ['业务模型',`${cp('shared/model.ts','ComplexInventory')} 组合原 ${link('prototype/shared/model.ts','奖励模型')}；build 输出 26,852 字节 IIFE。`,'共享同一份业务字节。共享层不引用 DOM、UnityEngine、CS 或文件系统。'],
    ['几何与展示',`${cp('fidelity/layout-shared.js','layout-shared.js')} 在浏览器与 PuerTS 中执行相同字节；按 viewport 生成 bounds。`,'几何已共享。fidelityPresentation 由原生使用，网页仍保留既有展示投影，展示代码尚未完全去重。'],
    ['美术与工程',`${cp('project/Inventory.fairy','Inventory.fairy')}；132 个正式资源、4 张 Unity atlas。`,'同源素材和 ID；网页当前没有直接实例化正式 ComplexMain，组件树实现仍存在平台差异。'],
    ['宿主',`${cp('fidelity/fidelity.ts','网页适配')} / ${cp('../InventoryUnity/Assets/Migration/FidelityInventoryHost.cs','Unity 原生宿主')}`,'负责控件、事件、字体测量、存储和释放。浏览器与 Unity 是独立运行会话。'],
  ])}
  <h3>三种“同一”需要区分</h3>
  ${bullets([
    '<strong>Agent 与网页编辑器：</strong>共用同一个当前浏览器 Backend、队列、revision 和撤销历史，能读到人的未保存编辑。',
    '<strong>网页游戏与 Unity：</strong>执行相同业务与布局字节，存档使用相同 schema；各自有 VM 与存储，未实现在线账号存档同步。',
    '<strong>源工程与运行组件：</strong>正式源工程能发布到 Unity；最新网页 fidelity 仍是分层组装。将网页也改为正式包实例化，是后续去重方向。',
  ])}
  <h3>运行时所有权</h3><p>应用持有一个 ScriptEnv，Update 中只 Tick 一次。关闭背包仅释放视图与监听，重开沿用原业务状态；宿主退出先关闭应用，再 Dispose 一次。把 UI 生命周期与全局 JS 运行时绑在一起，会造成重开状态丢失、重复回调或重复 Tick。</p>
  ${citations([cp('shared/API.md','业务 API'),fp('baseline-migration-boundary','迁移边界记录'),cp('fidelity/evidence/setup-unity.json','资源同步与哈希')])}
`);

const versions = section('versions','03','冻结版本与环境','以下是本次实际使用的固定版本，供复现；不是持续更新的“最新版”推荐。',`
  ${table(['组件','固定版本 / 提交','用途与注意点'],[
    ['Unity Hub','3.22.3','用户确认安装；账号与可用许可证由用户完成登录、激活。'],
    ['Unity Editor','6000.6.6f1 · d20c9ac777da','Windows Editor 与 Windows x64 IL2CPP Support；本次无 Android/iOS 结论。'],
    ['PuerTS Core / V8','3.0.3 / 3.0.3','存在本地 Unity 6.6 兼容补丁，见第 6 节。'],
    ['FairyGUI-dom',code('fade49fc33bdcd5673351e04637d4cc08d2297f3'),'main 固定提交，package 1.0.0；较旧 runtime，需要维护局部适配。'],
    ['FairyGUI-unity',code('8cc8f214cca79685532eef13372d0a4f74acdf08'),'master 固定提交；原生 UI 运行时。'],
    ['OpenFairyGUI SDK',`0.7.0<br>${code('6e29ee2e8a4cf557579f3d374450f99d06152985')}`,'正式工程读写、事务、校验和发布；无正式 DOM target。'],
    ['Editor Online',code('45f0bef93bb16d507552b673ace6d5af417a8a0f'),'编辑器使用 Core/functions/backend 0.2.4；文本修复针对这组依赖。'],
    ['OneJS V3 / onejs-react','3.9.10 / 0.4.1','仅固定源码核查；未执行运行验证，保留为备选。'],
  ])}
  <details><summary>展开：设备、浏览器与本地构建工具</summary>
  ${table(['环境','记录'],[
    ['设备','Windows 11 Pro 10.0.26200；Intel i5-12600KF，10 核 / 16 线程；可见内存约 23.8 GiB。'],
    ['浏览器','Chrome 155.0.8059.84；Edge 155.0.4283.45；Playwright 1.64.1 使用既有浏览器。'],
    ['工具','Node 24.18.0；npm 11.16.0；pnpm 11.25.0；Git 2.55.0.windows.5；PowerShell 7.6.5。'],
    ['Windows IL2CPP 工具链','Visual Studio 2022 Community 17.14.39；MSVC v143 14.44；Windows SDK 10.0.26100，复用已安装环境。'],
    ['Unity 安装位置',code('[LOCAL_HOME]\\AppData\\Local\\Programs\\Unity\\6000.6.6f1\\Editor\\Unity.exe')],
  ])}</details>
  ${citations([link('evidence/environment.json','最初环境'),link('evidence/repository-versions.json','仓库版本'),fp('installed-env','安装后环境'),fp('puerts-install','PuerTS 安装'),fp('onejs-versions','OneJS 固定版本')])}
`);

const workflow = section('closed-loop','04','Agent 与人工共用编辑闭环','状态只有一个所有者，预检、提交、撤销和保存都经过同一串行队列。',`
  <div class="flow"><span>查询当前会话</span><i>→</i><span>克隆预检</span><i>→</i><span>入队校验身份与版本</span><i>→</i><span>提交＋同一历史</span><i>→</i><span>保存＋正式读回</span><i>→</i><span>导出与独立运行</span></div>
  <p>原先 Inspector 同时发送 text/font/fontSize/color 单字段和完整 textProperties，Core 0.2.4 以 invalid_display_node_payload 拒绝。修复仅删除四处重复赋值，保留整组属性和 Core 的严格校验。真实 Core 回归从 <strong>7 失败 / 1 通过</strong>变为 <strong>8/8 通过</strong>，合法逆命令也能恢复。</p>
  ${table(['契约','本次方案','应避免的做法'],[
    ['唯一会话','浏览器现有 EditorProjectSession / Backend 是编辑状态来源；Agent 调用 runExclusive 与 UI 同队列。','另起磁盘 Backend，看到过期文件却声称与网页同步。'],
    ['并发控制','clientId、sessionId、generation、expected revision；在队列实际执行时校验。相同 revision 并发一胜一负。','只在入队前检查；刷新后沿用旧身份；把 revision 当跨会话全局计数。'],
    ['预检','克隆当前状态，采用相同规范化规则与正式 Core 模拟；不提交、不增加 revision。','用简化模拟器接受生产接口实际拒绝的命令。'],
    ['精确重试','同 requestId＋同载荷返回原结果；同 ID 不同载荷拒绝。超时 result_unknown 后精确重试。','超时后生成新 ID 直接重发，造成双执行。'],
    ['查询与历史','state/query 也入队并返回副本；Agent undo 与网页 redo 使用同一历史。','Backend 已变而 UI/history 尚未同步时读半完成状态。'],
    ['保存成功','明确校验目标；overall ok、checkpointSaved 与 readback verified 都成立才成功。','把 skipped 当成功；把持久化工作区误称自动写回导入的 ZIP。'],
  ])}
  <p>保存落在同 profile、同 origin 的 OPFS / IndexedDB 工作区。导入 ZIP 后仍需显式导出检查点；原磁盘 ZIP 不会被静默改写。写请求结果缓存上限 512，达到上限明确失败，避免静默淘汰导致重试双执行。</p>
  <div class="metric-row"><div><b>23 / 23</b><span>Chrome 真实编辑闭环</span></div><div><b>25 / 25</b><span>Edge 真实编辑闭环</span></div><div><b>12 / 12</b><span>整进程关闭后恢复</span></div><div><b>10 ＋ 10</b><span>导出后独立 DOM 运行</span></div></div>
  <p>真实 textarea 输入并失焦的未保存文案能被独立 Node Agent CLI 读取；事务同时修改文案、位置与颜色，Inspector 和画布同步。导出实际保存后的 6,134 字节 ZIP，再发布到独立 DOM 页面验证。重开后旧会话身份被拒绝，组件 ID、控制器、gears、transition 与布局保留。</p>
  ${note('本地开发桥接的边界','relay 通过显式环境连接文件、127.0.0.1 和 ?agent=1 启用；普通页与生产构建无入口。当前不是远程多人协作或通用 MCP 成品。连接令牌不放入文档或日志；跨 profile、断电崩溃恢复与目录句柄写回未测。')}
  ${citations([fp('text-fix-report','文本修复'),fp('text-red','失败回归'),fp('text-green','修复回归'),fp('editor-chrome','Chrome'),fp('editor-edge','Edge'),fp('editor-persistent','重启恢复'),fp('roundtrip-dom','导出运行')])}
`);

const visuals = section('visuals','05','从参考图还原到可操作界面','先固定初态、拆分美术，再让布局适应窗口。不能用整张图的热点伪装动态 UI。',`
  ${reference}
  <h3>美术拆分与源工程回写</h3>
  <p>将参考图拆成环境、无字底板、边框、图标、物件和装饰。字标可保留图片；金币、数量、详情、按钮文字由实时控件绘制。canonical 使用固定几何的参考切片与透明孔；adaptive 使用独立空底和九宫格边框，避免孔位随整图拉伸。</p>
  <p>生成道具图集后，按真实行边界切片，再用 alpha 阈值 8 与 2px 留边裁主体。戒指的有效图由 256×240 透明画布裁为 151×161；列表 tile 与详情图分开。原始生成图、派生透明图、裁片、prompt 和哈希都有记录，派生素材不冒称原图的逐像素分层。</p>
  <p>同一包 ${code('invtest1')} 保留原 ID；ComplexMain 为 ${code('cxmain01')}，ItemSlot 为 ${code('cxslot01')}。追加 69 个 skin、24 个紧主体详情图与 5 个按钮样式组件，正式工程共 132 个资源。旧 39 个文件中，仅预期的 5 个 XML 改变，其余 34 个哈希保持。Unity 发布为 bytes＋4 张 atlas；DOM 输出 package.xml、manifest 和 119 张散图。</p>
  ${table(['视口','布局','保持的约束'],[
    ['1586×992 设计 / 1280×800 Player','canonical · 6 列 × 4 行','接近原比例时统一等比缩放；物件、文字与底图不分别拉伸。'],
    ['754 / 794 宽窗口','adaptive · 4 列 × 6 行','实际 scale=1，左列表右详情，金色按钮保持约 370:65 比例。'],
    ['486×727','adaptive · 3 列 × 8 行','根据可用宽高重排；物品格参考 128:137，搜索与分类分行。'],
    ['390×844','adaptive · 2 列 × 12 行','控件与说明保持可读，物件 contain，菜单与弹层约束在视口内。'],
  ])}
  <div class="gallery two-up">${web}${native}</div>
  <div class="gallery portrait-gallery">${narrow}${nativeNarrow}<div class="gallery-explainer"><span class="eyebrow">RESPONSIVE RULE</span><h3>重排区域，保持主体比例</h3><p>曾经将整个设计稿缩进窄窗口，486 宽时比例降到约 0.306，按钮只有约 113×20，形成大黑边与小字。</p><p>修复后根据宽高比选择模式；自适应模式直接按可用空间分配列表、详情、正文和操作区。</p><p>图片点击可放大。所有截图均内嵌，可离线阅读；各图说明保留其版本范围。</p></div></div>
  ${citations([cp('fidelity/skin-manifest.json','皮肤来源与切边'),cp('fidelity/detail-icons.json','详情图裁边'),cp('published/fidelity-sync-report.json','源工程保存重开'),fp('fidelity-source-audit','源文件审计'),fp('fidelity-publish','发布读回'),cp('published/fidelity-resource-map.json','资源映射')])}
`);

const editorPitfalls = [
  {title:'文本一改就被 Core 拒绝',symptom:'Inspector 文案、字体或颜色提交失败。',cause:'完整 textProperties 与四个单字段混发，违反固定 Core 0.2.4 的命令协议。',fix:'去掉重复字段，保留完整组属性；使用真实 Core 做红绿回归与 inverse 恢复。',practice:'定位发送端协议问题后最小修复，不为让命令通过而放宽校验或盲目升级整套依赖。',refs:[fp('text-fix-report','修复报告')]},
  {title:'SDK 返回成功，仍改到了无关字节',symptom:'语义校验通过，但未列入预检的 ItemRow 文件发生变化。',cause:'save 规范化 gear XML 顺序；preflight.files 不等于最终字节修改范围。',fix:'保存前后枚举源文件并记录 SHA，明确区分语义保持与严格字节隔离。此通用问题未在本轮宣称修复。',practice:'事务返回值、保存结果、读回内容与磁盘差异必须分别验收。',refs:[fp('toolchain-summary','strictByteIsolationPassed=false')]},
  {title:'发布完成，DOM 图标却请求 /null',symptom:'正式发布文件存在，浏览器图标 404。',cause:'SDK 无 DOM target；旧 DOM 的 GImage 读取 PackageItem.file，而导出的 image.file=null。',fix:'使用兼容的未压缩资源描述与独立 PNG manifest，通过公开字段补映射。Laya 是发布格式，不引入 Laya 游戏运行时。',practice:'读取实际 runtime 的资源消费路径，分别测试发布成功、资源解析和真实网络加载。',refs:[fp('toolchain-report','SDK 与 DOM 适配')]},
  {title:'资源发布与 PuerTS 绑定不是同一步',symptom:'指定 Unity＋TypeScript，资源已输出，误以为完整 TS 绑定也完成。',cause:'SDK 的 Unity 默认绑定是 C#；该 TS 路径只给 warning / skipped。大图 Backend 读取还受 1 MiB 预算限制。',fix:'明确分开资源发布、组件绑定和 PuerTS 互通生成；大图从 SDK 声明路径授权读取本地原字节并记录 SHA。',practice:'读取 diagnostics 和 skipped 项；文件系统补充读取不包装成 Backend 正式读取成功。',refs:[fp('toolchain-report','发布与绑定边界'),fp('fidelity-publish','本次发布记录')]},
];
const nativePatch = {
  title:'最新 Unity 编译成功前的 IL2CPP 兼容坑',symptom:'Unity 6.6 原生编译在四处 Object::Unbox 调用失败；Editor 成功未暴露此问题。',cause:'PuerTS 3.0.3 模板依赖的 IL2CPP 内部接口在当前 Unity 版本不可用。',fix:'固定模板四处改为公开 il2cpp_object_unbox，重新生成 ReflectionMode bridge 后再构建。保留原错误、patch 和结果。',practice:'尽早做实际目标 Player；固定 Unity/PuerTS 成对版本，模板补丁与生成物都需追踪。',refs:[fp('il2cpp-compat','兼容补丁与原错误')]};
const cards = [...editorPitfalls, ...architecture.pitfalls.map(p=>({title:({
  'reference-is-a-design-not-a-screen-overlay':'参考风格接近，仍不能叫还原',
  'viewport-fit-is-not-responsive':'窄窗口大黑边、控件过小',
  'nine-slice-and-button-proportions':'Button 比例不对，边框出现黑条',
  'detail-art-and-alpha-bounds':'戒指拉长、物件缩小、药水带邻行残片',
  'measure-real-text':'四字动作与操作后反馈被裁',
  'lifecycle-caches-and-layer-order':'已释放缓存、面板透字与模板残留',
  'v8-without-intl':'浏览器 12,480，原生变成 12480',
  'native-text-height':'业务字符串完整，原生第三行仍消失',
}[p.id]||p.id),...p,refs:p.paths.map(x=>cp(x.path,path.basename(x.path)))})),nativePatch];
const pitfalls = section('pitfalls','06','踩坑手册','按根因整理：每次先复现，再最小修复，最后在实际目标上留下证据。',`
  <div class="pitfall-grid">${cards.map((p,i)=>`<article class="pitfall"><div class="pitfall-head"><span>${String(i+1).padStart(2,'0')}</span><h3>${p.title}</h3></div><dl><dt>现象</dt><dd>${esc(p.symptom)}</dd><dt>根因</dt><dd>${esc(p.cause)}</dd><dt>处理</dt><dd>${esc(p.fix)}</dd><dt>经验</dt><dd>${esc(p.practice)}</dd></dl>${p.status?`<p class="status-note">${esc(p.status)}</p>`:''}${citations(p.refs)}</article>`).join('')}</div>
  ${note('测试失败也要先核实根因','尾随空格、错误截图尺寸、编辑器抢占 Ctrl+A、颜色大小写或换行差异会产生假红。原生一次“剑消失”反馈经 PNG 区域比对未成立，未据此继续改层级。初始化状态被外部改变的来源未确定，重置 fixture 后复测。先分开产品缺陷、夹具问题和证据误读。')}
`);

const acceptance = section('acceptance','07','验收记录：保留各版本的真实结果','用户验收、功能断言、视觉判定与构建结果分别存档。通过数是断言数，不是独立场景数。',`
  ${table(['阶段 / 对象','结果','覆盖与证据边界'],[
    ['用户验收',badge('通过'),'用户明确表示“验收通过”。这是最终人工接受决定。'],
    ['Inspector 文本修复',badge('8 / 8'),`${fp('text-red','修复前 7 失败 / 1 通过')} → ${fp('text-green','修复后同 8 项通过')}，另有类型检查与合法逆操作恢复。`],
    ['Agent＋编辑器',badge('23 / 25 / 12 项通过'),`${fp('editor-chrome','Chrome 23')}、${fp('editor-edge','Edge 25')}、${fp('editor-persistent','进程重开 12')}；真实输入、同历史、冲突拒绝与保存读回。`],
    ['导出后 DOM',badge('两浏览器各 10 项'),`${fp('roundtrip-dom','实际保存 ZIP 的独立发布运行')}；不借用编辑器 Laya 画布作为游戏验收。`],
    ['新版网页控件',badge('两浏览器各 182 项'),`九宫格、透明图、控件比例与字形检查。${cp('fidelity/evidence/adaptive-controls-2026-10-16T10-20-28.108Z-chrome-control-art-rounded-pixels/result.json','Chrome')} / ${cp('fidelity/evidence/adaptive-controls-2026-10-16T10-20-28.113Z-edge-control-art-final/result.json','Edge')}。共享布局提取后 ${fp('fidelity-adaptive','Chrome 再验 182 项')}。`],
    ['新版窄窗与弹层',badge('两浏览器各 74 项'),`${cp('fidelity/evidence/narrow-2026-10-16T10-40-57.558Z-chrome-changed-overlay/result.json','Chrome')} / ${cp('fidelity/evidence/narrow-2026-10-16T10-40-57.577Z-edge-changed-overlay/result.json','Edge')}；另有 ${fp('fidelity-narrow','34 项布局专项')}。visualStatus=not-assessed，审美由人工判断。`],
    ['Unity Editor 最近完整运行',badge('部分通过','amber'),`${fp('fidelity-editor-interim','28 / 28 业务与生命周期断言')}、20 次开关。请求 794×727，实际 390×844；GameView 尺寸未改变，整体保留 partial。`],
    ['IL2CPP Player 最近完整运行',badge('业务通过 / 整体失败','amber'),`${fp('fidelity-player-interim','46 / 46 业务与生命周期断言')}、20 次开关、4 种实际尺寸；canonical 第三行说明裁切，visualStatus=failed-native-text-bounds。`],
    ['原生说明高度补丁',badge('已修源码并编译','blue'),'按真实 textHeight 增高到受按钮上界约束的高度；最终 Host SHA 已改变。补丁后运行复验尚未执行，不能沿用旧 46 项宣称通过。'],
    ['最终 Windows x64 IL2CPP Release',badge('构建成功'),`${fp('fidelity-release-build','Succeeded')}；developmentBuild=false，errors=0，warnings=7。只证明编译与链接生成产物。`],
    ['分发 ZIP',badge('尚未生成','neutral'),'构建目录存在；打包脚本存在；未发现 ZIP、package manifest 或最终包普通启动验收。'],
  ])}
  <h3>最近 Player 的四种实际窗口</h3>
  ${table(['请求与实际','模式','列数 / scale'],runtime.latestCompletedPlayer.resolutions.map(r=>[r.actual.join(' × ')+' · 请求匹配',r.mode,r.columns+' 列 / '+Number(r.scale).toFixed(r.scale===1?0:4)]))}
  <p>原生验收通过显式验证目录的文件命令，在 Unity 主线程触发真实 FairyGUI 事件与平台存档；不是 OS 鼠标键盘或完整命中测试。物理中文输入法、真实移动设备、Safari、Android/iOS、所有 AOT 泛型/委托以及跨平台性能排名均无本轮通过结论。</p>
  <details><summary>展开：基线压力测试与新版固定 24 格的区别</summary><p>较早的 baseline Windows IL2CPP 在 30 / 300 / 3000 数据量下各有 22 项通过，开关次数为 200 / 20 / 20，实际虚拟显示约 7 行。新版 fidelity 是 24 个真实 ItemSlot，virtualList=false，容量为 30；旧压力结果不能用于证明新版规模性能。旧 complex 的 429 步跨端比较也不并入新版通过数。</p><p>本次最终 Release 构建记录约 28.86 秒、400,106,359 字节，受已有缓存与本地环境影响，仅作为单次构建日志，不作为冷启动或框架性能基准。完整 snapshot / JSON 传输仍可能 O(N)，少量可见节点不等于小 payload。</p>${citations([fp('baseline-player-summary','基线原始结果'),fp('fidelity-release-build','本次构建日志')])}</details>
`);

const practices = section('practices','08','最佳实践：可用于下一套 UI','把本次修复沉淀成约束，减少后续页面重复踩坑。',`
  <div class="practice-list">${[
    ['先冻结验收样本','固定参考图、初始 fixture、选中物品、金币、视口与设备缩放。每份截图都标目标版本、实际尺寸和当前状态；避免拿不同初态互相对比。'],
    ['先做网页视觉，再迁移原生','在独立 DOM 页面先把主要美术、按钮、物件和窄窗行为定下来；通过后回写正式源工程，再由 Unity 验证原生差异。'],
    ['建立资产契约','每张图记录用途、自然尺寸、透明边界、九宫格 insets 与来源哈希。列表 tile、详情主体、边框、按钮底和图标各用各的素材。'],
    ['几何计算保持纯函数','用 viewport＋manifest 生成可序列化布局。选择 canonical 或 adaptive，并显式分配正文/按钮区域；避免 DOM 和 Unity 各写一套坐标常量。'],
    ['测量真实字形与图像主体','按钮宽度依实际文字 ink 范围与 gutter 计算；原生还要检查 textHeight。覆盖两字/四字动作、最长名称、三行说明和操作后反馈。'],
    ['把共享业务编译成同一字节','两端读取相同 bundle 并在运行时记录 SHA。平台只做 JSON dispatch、渲染与存取；不要用两份重写逻辑去“验证复用”。'],
    ['避免宿主可选能力渗入规则','数字格式化等需要确定性；在缺 Intl 环境验证。字体、输入法、文件路径、时钟和平台事件留在适配边界。'],
    ['状态、历史、保存同一个主人','人和 Agent 的读写都走同队列；身份/版本校验放在执行点。使用 requestId 精确去重；保存成功必须有实际读回。'],
    ['尽早生成真实目标 Player','Editor 通过仍需 IL2CPP 编译、启动和运行；记录模板补丁与生成配置。绑定、资源和 AOT 互通分别验。'],
    ['用所有权约束生命周期','应用持有 VM，视图持有控件和监听；关闭清理监听，退出只 Dispose 一次。重复开关检查重复 Tick、回调、状态与清理。'],
    ['证据与版本绑定','保留失败报告；保存前后源文件 manifest；记录运行时实际 TextAsset 字节。新补丁编译后必须有新运行报告才能升级自动验收状态。'],
    ['维护补丁清单与停止条件','锁版本、隔离适配、保留原错误和复现命令。若需要大面积改底层，或关键输入/目标平台长期无法闭环，应重新评估，而不是持续堆补丁。'],
  ].map((p,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h3>${p[0]}</h3><p>${p[1]}</p></div></article>`).join('')}</div>
  <details><summary>展开：下一套界面的最小验收清单</summary>${bullets([
    '固定画布：初态与参考并排；动态数字、选中框、两类按钮和长说明实际可见。',
    '自适应：近方形与窄窗均测；物件等比、九宫格不交叠、控件比例稳定、菜单与弹窗不出屏。',
    '业务：正常动作与失败原子性；出售确认/取消、装备/卸下、奖励不可领/可领/已领、存档恢复。',
    '编辑：真实文本输入、未保存状态互读、旧 revision 拒绝、同 ID 重试不重复、撤销重做、保存和重开。',
    '跨端：同一 bundle 哈希，正式包 ID 一致；原生实际 Screen/PNG 尺寸；关闭重开与退出释放。',
    '发布：无未解释诊断；运行页资源和引擎依赖清楚；完整目录交付，最终构建与运行报告对应。',
  ])}</details>
`);

const commands = `# 工作目录：验证/unity-migration/complex-inventory
# 以下是复现入口；整理文档时未重新执行游戏测试或构建。

# 1. 构建新版网页适配（读取现有共享业务产物）
node fidelity/build-fidelity.mjs
# 若服务已在 4182 运行，直接打开 http://127.0.0.1:4182/fidelity/
# 否则启动本地服务：
node scripts/serve.mjs

# 2. 将已冻结的正式发布资产、业务与布局同步到 Unity
node scripts/setup-fidelity-unity.mjs

# 3. Unity 工程准备、互通生成与 Windows IL2CPP Release 构建
pwsh -File scripts/run-fidelity.ps1 -Action prepare
pwsh -File scripts/run-fidelity.ps1 -Action generate
pwsh -File scripts/run-fidelity.ps1 -Action build -EvidenceName your-build-id

# 4. 实际运行与验收：启动返回 EvidencePath 后，传给验收器
pwsh -File scripts/run-fidelity.ps1 -Action player -EvidenceName your-player-id
node fidelity/accept-unity-fidelity.mjs "<启动返回的 EvidencePath>" player --cycles 20

# Editor 可使用 -Action editor-auto；GameView 需核实际尺寸。
# 正式工程修改后的 sync/publish 会改源与发布目录，先读脚本再运行。
# ZIP 尚未生成；如后续打包，必须传真实成功构建的 player-build.json：
# pwsh -File scripts/package-fidelity.ps1 -BuildReport "<player-build.json 绝对路径>"`;
const reproduce = section('reproduce','09','工程入口与复现方法','所有验证与修改都保存在独立“验证”目录；原始阶段记录保留，不覆盖生产工程。',`
  <div class="file-cards"><div><span class="eyebrow">SOURCE</span><h3>工程与平台入口</h3>${bullets([cp('project/Inventory.fairy','FairyGUI 源工程'),cp('shared/API.md','共享业务 API'),cp('fidelity/index.html','当前网页入口 /fidelity/'),cp('../InventoryUnity/Assets/Migration/FidelityInventoryHost.cs','Unity 原生宿主'),cp('../InventoryUnity/Assets/Editor/FidelityMigrationBuild.cs','Unity 构建入口')])}</div><div><span class="eyebrow">BUILD OUTPUT</span><h3>原机 Windows 构建记录</h3><p>${link('unity-migration/build/fidelity-windows-il2cpp','打开完整构建目录')}</p><p>入口为 FidelityInventory.exe，必须与 UnityPlayer.dll、GameAssembly.dll、FidelityInventory_Data 等运行文件保持在一起。请勿仅复制 exe。</p><p class="muted">当前尚无 ZIP；开源源码不附带本机 Player 构建目录，可按下方命令重建。</p></div></div>
  <details open><summary>展开：复现命令与执行顺序</summary><pre>${esc(commands)}</pre></details>
  ${table(['脚本 / 文件','作用与注意'],[
    [cp('scripts/build-app.mjs','build-app.mjs'),'共享业务的构建入口；业务修改后先构建并更新字节身份。'],
    [cp('scripts/sync-fidelity-project.mjs','sync-fidelity-project.mjs'),'回写新版皮肤、组件与资源映射；会修改验证源工程，保留审计。'],
    [cp('scripts/publish-fidelity-project.mjs','publish-fidelity-project.mjs'),'从正式源工程发布与读回；不要运行旧 create-publish 复位到旧布局。'],
    [cp('fidelity/accept-adaptive-controls.mjs','accept-adaptive-controls.mjs'), 'Chrome / Edge 的按钮、九宫格、透明图及文字专项。'],
    [cp('fidelity/accept-narrow-layout.mjs','accept-narrow-layout.mjs'),'窄窗、长反馈、弹层与布局 smoke。'],
    [cp('scripts/setup-fidelity-unity.mjs','setup-fidelity-unity.mjs'),'检查正式发布记录、共享字节与纯布局执行，复制四张 atlas 和 TextAsset 等 12 项。'],
    [cp('scripts/run-fidelity.ps1','run-fidelity.ps1'),'prepare / generate / build / editor / editor-auto / player；每次独立证据目录。'],
    [cp('fidelity/accept-unity-fidelity.mjs','accept-unity-fidelity.mjs'),'主线程文件命令验收，记录实际 Screen、文本 bounds、业务状态和退出。'],
    [cp('scripts/package-fidelity.ps1','package-fidelity.ps1'),'要求成功 IL2CPP 构建报告，复制完整运行目录并排除调试备份；本轮未执行打包。'],
  ])}
  <p>文档整理只读取已有记录并生成本 HTML，没有续跑 Unity 或游戏验收。运行事实核对时（2026-10-16 11:11:43 UTC）本任务拥有的 Unity Editor、Player 与编译器均已结束；该进程快照不代表以后再次打开时的实时状态。既有本地网页服务也不作为交付文档的运行依赖。</p>
`);

const boundaries = section('boundaries','10','长期维护、备选路线与许可','本轮证明的是具体工程、固定版本和实际目标，采用时应保留这些前提。',`
  <div class="two-up"><div class="summary-card"><span class="eyebrow">CONTINUE WHEN</span><h3>继续的条件</h3>${bullets(['关键页面能在独立 DOM 中闭环；平台差异集中在可审查的适配层。','正式源工程、ID 与产物可稳定读回；Agent 操作不会脱离人工当前会话。','版本升级前能重跑目标 Player 与视觉样本，补丁数量和维护成本可控。'])}</div><div class="summary-card"><span class="eyebrow">REASSESS WHEN</span><h3>重新评估的条件</h3>${bullets(['关键输入、复杂字体或资源类型长期不能满足产品目标。','底层兼容工作演变为大面积 runtime 重写，迁移收益被维护成本吞没。','实际目标平台或协作保存无法稳定复现，无法形成可靠发布闭环。'])}</div></div>
  <h3>OneJS V3 保留为备选</h3><p>固定 OneJS 3.9.10 是 React 19 → Unity UI Toolkit 与自有 QuickJS / 句柄桥。要满足本目标，仍需独立 DOM 后端、统一组件/样式/事件/资源契约，以及 PuerTS 宿主、转换与生命周期重做。OJPlay 的 Unity 容器与 Unity WebGL 不满足“浏览器不带 Unity 引擎”的要求。本次仅核查源码，未运行 OneJS，不提供跨框架性能排名，也不建议退回 V2。</p>
  <h3>已有能力、本次新增与后续工作</h3>
  ${table(['类别','内容'],[
    ['已有能力','FairyGUI 两端 runtime；OpenFairy 正式工程 API、事务与发布；PuerTS JS 执行与互通基础。'],
    ['本次新增 / 维护','Inspector 修复；Agent 同会话桥接；DOM 发布映射与局部 runtime 适配；共享业务与几何；美术拆层和自适应；Unity 宿主、测试泵、构建脚本与 IL2CPP 兼容补丁。'],
    ['适合作为独立适配包','共享 schema / layout、资源 manifest、宿主接口、发布检查、回归样本和证据格式。'],
    ['需要跟随 fork / 版本维护','编辑器命令协议与会话集成、旧 DOM runtime 兼容、PuerTS IL2CPP 模板补丁。升级时逐项对上游复核。'],
    ['仍需工程化','补齐末版原生复验和分发包普通启动；网页正式包实例化；展示投影进一步去重；完善输入、字体、资源类型、目标平台与规模性能验证。'],
  ])}
  <h3>许可按层核对</h3><p>runtime 或工具链原创代码的 MIT 不覆盖全部编辑器素材、品牌、字体和依赖。FairyGUI 官方编辑器命令行发布涉及专业版；公开 Editor 仓库不等于整个官方编辑器源码。网页编辑器涉及 Laya、官方 UI 和品牌使用边界，原项目的口头品牌授权不自动延伸到 fork。</p><p>PuerTS Tencent 部分为 BSD-3-Clause，V8 与第三方声明另行清点。系统字体在本机可用，不代表可以分发字体文件。本次生成与派生美术有来源记录；本报告是分层许可核查记录，不是完整商业合规审计。后续公开发行前应使用项目批准的字体与素材清单。</p>
  ${citations([fp('onejs-report','OneJS V3 源码核查'),fp('toolchain-report','工具链与品牌边界'),fp('unity-research','Unity / PuerTS 与许可核查')])}
`);

const hashRows = [
  ['共享业务 IIFE',cp('dist/ComplexInventoryApp.txt','26,852 字节'),runtime.sourceIdentity.businessBundle.sha256],
  ['共享布局 / 展示函数',cp('fidelity/layout-shared.js','17,584 字节'),runtime.sourceIdentity.sharedLayout.sha256],
  ['完整运行报告所用 Host','补丁前身份；用于解释最近 Editor / Player 运行',runtime.sourceIdentity.hostOfLatestCompletedRuntimeChecks.sha256],
  ['最终原生 Host',cp('../InventoryUnity/Assets/Migration/FidelityInventoryHost.cs','已构建，尚无补丁后运行报告'),runtime.sourceIdentity.finalHostAfterDescriptionPatch.sha256],
  ['最终 Release exe',link('unity-migration/build/fidelity-windows-il2cpp/FidelityInventory.exe','FidelityInventory.exe'),runtime.finalReleaseBuild.executable.sha256],
  ['最终 GameAssembly',link('unity-migration/build/fidelity-windows-il2cpp/GameAssembly.dll','GameAssembly.dll'),runtime.finalReleaseBuild.gameAssembly.sha256],
];
const evidence = section('evidence','11','证据索引与制品身份','截图已嵌入 HTML；原始日志、源码和工程入口指向旁边的验证目录。复制此 HTML 仍可离线阅读，证据链接需保留原目录。',`
  <h3>核心文件 SHA-256</h3>${table(['对象','文件 / 状态','SHA-256'],hashRows.map(r=>[r[0],r[1],code(r[2])]),'hash-table')}
  ${citations([cp('fidelity/evidence/document-runtime-facts.json','完整运行核对'),cp('fidelity/evidence/document-architecture-notes.json','架构核对'),cp('fidelity/evidence/document-foundation-notes.json','历史阶段与版本核对'),cp('fidelity/evidence/unity-build-release-final-1108/result-20261016-110750.json','最终构建进程结果'),cp('fidelity/evidence/unity-build-release-final-1108/build-20261016-110750.log','最终构建日志')])}
  <details><summary>展开：阶段报告与原始证据（${foundation.sources.length} 项）</summary>
  ${table(['阶段','入口','使用说明'],foundation.sources.map(s=>[({early_research:'早期调研',editor_closed_loop:'编辑闭环',baseline_unity:'基线迁移',fidelity24:'新版 24 格'})[s.stage]||s.stage,link(s.relativePath.replace(/^验证\//,''),s.id),esc(s.caveat)]))}</details>
  <details><summary>展开：阅读与复现说明</summary><p>整理日期：2026-10-16（America/Los_Angeles）。日志文件名与原始运行时间采用 UTC，本报告保留原时间，避免改写证据。早期报告中的“未安装 Unity”“Unity 待验”属于当时状态；本页按后续实际证据汇总，不修改旧报告。公开版对原机绝对路径做占位化，原始哈希仍指向原记录；变换清单见 PUBLICATION.md 与 publication-manifest.json。</p><p>全部实现、测试产物和文档位于独立验证目录。同步参考目录 sources/ 保持只读；本次未修改生产仓库、提交、推送、创建远程 PR 或上传私有工程。文档不包含会话连接 token。</p><p>HTML 不引用外部字体、脚本或样式，图片以原 PNG 内嵌。目录导航、图片放大、展开全部和打印可离线使用；浏览器的文件访问策略可能限制跳转到本地目录，此时按可见路径从文件管理器打开。</p></details>
`);

const css = `
:root{--ink:#172e39;--muted:#586b72;--navy:#081c28;--navy2:#113340;--gold:#ac803a;--line:#d9dfdc;--paper:#f6f6f0;--green:#27604c;--amber:#825619;--white:#fff;--radius:12px;font-family:"Segoe UI","Microsoft YaHei UI","Microsoft YaHei",system-ui,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.78;scroll-behavior:smooth}
*{box-sizing:border-box}body{margin:0}a{color:#1c596c;text-underline-offset:3px;overflow-wrap:anywhere}a:hover{color:#936121}button{font:inherit;cursor:pointer}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #be8638;outline-offset:4px}button:disabled{cursor:default}p{margin:0 0 1em}h1,h2,h3{line-height:1.35;letter-spacing:.01em}h1{font-size:clamp(32px,4vw,52px);margin:20px 0 16px;font-weight:700}h2{font-size:28px;margin:0 0 8px}h3{font-size:19px;margin:25px 0 12px}ul,ol{padding-left:1.4em;margin:12px 0 18px}li{padding-left:.2em;margin:7px 0}code{font-family:Consolas,ui-monospace,monospace;font-size:.88em;background:#edf1ed;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}pre{margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.8 Consolas,monospace;background:#0c2430;color:#d9e5e5;padding:24px;border-radius:8px}b,strong{font-weight:650}.muted{color:var(--muted)}.eyebrow{display:block;color:var(--gold);font:700 11px/1.4 "Segoe UI",sans-serif;letter-spacing:.16em}.badge{display:inline-flex;padding:3px 10px;border-radius:30px;font-size:12px;line-height:1.65;font-weight:650;background:#e5efe8;color:#265442;white-space:normal}.badge.amber{background:#f7ead6;color:#77501e}.badge.blue{background:#e4eef3;color:#305d73}.badge.neutral{background:#eaece7;color:#616a65}.link-arrow{white-space:nowrap;font-size:.8em;opacity:.7}
.masthead{background:var(--navy);color:#f1eee1;padding:54px max(6vw,24px) 46px;position:relative;overflow:hidden;border-bottom:4px solid #aa8247}.masthead:after{content:"";position:absolute;width:450px;height:450px;border:1px solid #bc94583b;border-radius:50%;top:-220px;right:-50px;box-shadow:0 0 0 55px #bc94580b,0 0 0 110px #bc945806;pointer-events:none}.hero-inner{max-width:1300px;margin:auto;position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:40px;align-items:end}.hero-kicker{color:#c8a46c;letter-spacing:.16em;font-size:12px;font-weight:650}.hero-subtitle{font-size:18px;color:#cad8d9;max-width:680px;line-height:1.85;margin-bottom:26px}.hero-meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;color:#a9bec3;font-size:13px}.hero-meta .badge{background:#173f38;color:#c0e1cd}.hero-card{padding:24px;border:1px solid #6d7b7059;border-radius:8px;background:#16313c70}.hero-card strong{display:block;font-size:30px;color:#e4c48c;line-height:1.25;margin-bottom:12px}.hero-card p{color:#bdccce;font-size:13px;margin:0}.toolbar{display:flex;justify-content:flex-end;gap:8px;max-width:1300px;margin:0 auto 16px;position:relative;z-index:1}.toolbar button{background:#ffffff08;color:#d5dedc;border:1px solid #718a8866;border-radius:5px;padding:5px 11px;font-size:12px}.toolbar button:hover{background:#ffffff16}
.shell{display:grid;grid-template-columns:210px minmax(0,1fr);gap:48px;max-width:1380px;margin:auto;padding:42px 30px 80px}.toc{align-self:start;position:sticky;top:28px;font-size:13px;max-height:calc(100vh - 56px);overflow:auto;padding-right:8px}.toc-label{font-size:11px;color:#85928e;letter-spacing:.15em;margin:4px 0 16px;padding-left:12px}.toc a{display:block;text-decoration:none;border-left:2px solid transparent;padding:7px 0 7px 12px;color:#5c6e73;line-height:1.55}.toc a small{color:#929e98;margin-right:8px;font-family:Consolas,monospace}.toc a.active{border-left-color:var(--gold);color:var(--ink);background:#e8e9df;}.toc-note{margin:24px 0 0 12px;font-size:11px;color:#7c8987;line-height:1.8}.content{min-width:0}.chapter{scroll-margin-top:30px;padding:0 0 54px;margin:0 0 42px;border-bottom:1px solid var(--line)}.chapter:last-child{border:0;margin-bottom:0;padding-bottom:0}.chapter-heading{display:flex;align-items:flex-start;gap:18px;margin-bottom:24px}.chapter-number{display:grid;place-items:center;flex-shrink:0;width:40px;height:42px;font:17px/1 Consolas,monospace;color:#97743c;border-top:2px solid #b19461;border-bottom:1px solid #c6b58e;padding:12px 0}.lead{margin:0;color:var(--muted);font-size:15px}.three-up{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:24px 0}.two-up{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.summary-card{border:1px solid var(--line);border-radius:var(--radius);padding:22px;background:#fbfcf8}.summary-card h3{margin:10px 0 12px}.summary-card p,.summary-card li{font-size:14px;color:var(--muted)}.summary-card p:last-child{margin:0}.note{border-left:3px solid #4d7a7b;background:#eaf0ed;padding:18px 22px;margin:24px 0;border-radius:0 8px 8px 0;font-size:14px}.note strong{display:block;color:#284951;margin-bottom:5px}.note p:last-child{margin:0}.note.amber{border-color:#ad8246;background:#f1ebdb}.note.amber strong{color:#75511e}.citations{border-top:1px solid #dce1d955;margin-top:16px;padding-top:10px;font-size:11px;line-height:1.8;color:#788680}.citations a{color:#586c72}
.table-wrap{max-width:100%;overflow-x:auto;margin:20px 0;border:1px solid #d5ddd9;border-radius:8px;background:#fbfcf8}table{width:100%;border-collapse:collapse;text-align:left;font-size:13px;line-height:1.8}th{background:#e8eee8;color:#334b52;font-weight:650}th,td{padding:13px 16px;vertical-align:top;border-bottom:1px solid #dde3dd}td:first-child{font-weight:600;min-width:120px}tr:last-child td{border-bottom:0}td p{margin:0}td code{font-size:11px}details{background:#eef1ea;border:1px solid #dce2d8;border-radius:8px;padding:0 18px;margin:20px 0}summary{font-size:14px;font-weight:600;cursor:pointer;padding:14px 0}details[open]{padding-bottom:16px}details[open] summary{border-bottom:1px solid #d8ded3;margin-bottom:16px}details .table-wrap{margin-bottom:0}.hash-table td:nth-child(3){width:45%;word-break:break-all}
.architecture{background:#0d2633;color:#d2dfdf;padding:28px;border-radius:12px;margin:25px 0 30px;text-align:center;border:1px solid #46606b}.arch-top{display:flex;align-items:center;justify-content:center;gap:18px;font-size:14px}.arch-top span{border:1px solid #547580;padding:8px 20px;border-radius:6px;background:#163746}.arch-arrow{font-size:11px;color:#9db5bd;margin:12px 0;letter-spacing:.03em}.arch-source{border:1px solid #b48e4a88;padding:15px;background:#b48e4a13;border-radius:6px;max-width:640px;margin:auto}.arch-source strong{color:#e5c791;font-size:16px}.arch-source span{display:block;font-size:11px;color:#afbec0;margin-top:5px}.shared-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.shared-strip div{padding:14px 8px;border:1px solid #49616a;background:#173542;border-radius:6px}.shared-strip strong{font-size:14px}.shared-strip small{display:block;font-size:11px;color:#a2b9bd;margin-top:5px}.platforms{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left}.platforms>div{padding:18px 22px;background:#0a202b;border:1px solid #3d5a66;border-radius:6px}.platforms h3{font-size:17px;margin:8px 0 12px;color:#e1e9e3}.platforms p{font-size:12px;margin:0;color:#b4c5c9;line-height:1.9}.flow{display:flex;align-items:center;gap:9px;flex-wrap:wrap;background:#e8eee7;padding:18px;border-radius:8px;margin:20px 0}.flow span{font-size:12px;background:#fafcf7;border:1px solid #d0d9d0;padding:6px 9px;border-radius:4px}.flow i{font-style:normal;color:#8b987e}.metric-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:26px 0}.metric-row>div{border-top:2px solid #b39563;padding:14px 10px;background:#edefe6}.metric-row b{font:600 24px/1.3 "Segoe UI",sans-serif;display:block;color:#254c58;margin-bottom:8px}.metric-row span{font-size:11px;color:#596d70}
figure{margin:0;min-width:0;background:#e7ebe5;border:1px solid #d5ddd6;border-radius:9px;overflow:hidden}.image-button{display:block;width:100%;padding:0;border:0;background:#061118;cursor:zoom-in}.image-button img{display:block;width:100%;height:auto;max-width:100%}figcaption{padding:14px 17px;font-size:12px;line-height:1.75}figcaption strong{display:block;color:#2e4b53;margin-bottom:5px}figcaption span{display:block;color:#637572}.reference-figure{margin-bottom:28px}.gallery{margin:24px 0;align-items:start}.portrait-gallery{display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:18px}.gallery-explainer{font-size:13px;color:var(--muted);padding:18px 0}.gallery-explainer h3{margin:12px 0}.pitfall-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.pitfall{background:#fbfcf8;border:1px solid #d6dfd7;border-radius:9px;padding:22px;min-width:0;break-inside:avoid}.pitfall-head{display:flex;gap:12px;align-items:flex-start;border-bottom:1px solid #e0e5db;padding-bottom:12px}.pitfall-head>span{font:18px/1.7 Consolas,monospace;color:#ac8a50}.pitfall h3{font-size:17px;margin:0}.pitfall dl{font-size:13px;line-height:1.85;margin:16px 0 0}.pitfall dt{font-weight:650;color:#365760;margin:12px 0 3px}.pitfall dt:first-child{margin-top:0}.pitfall dd{margin:0;color:#5b6c71}.status-note{background:#f4ead5;color:#805c28;border-radius:4px;padding:10px;font-size:11px;margin:16px 0 0}.practice-list{border:1px solid #d8dfd6;background:#fbfcf8;border-radius:10px;overflow:hidden}.practice-list article{display:flex;gap:18px;padding:22px 25px;border-bottom:1px solid #dfe4da;break-inside:avoid}.practice-list article:last-child{border:0}.practice-list article>span{color:#ad8b52;font:20px/1.5 Consolas,monospace}.practice-list h3{font-size:17px;margin:0 0 6px}.practice-list p{font-size:14px;color:#607271;margin:0}.file-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:24px 0}.file-cards>div{background:#fbfcf8;border:1px solid #d5ddd5;border-radius:8px;padding:22px;font-size:13px}.file-cards h3{margin-top:12px}.file-cards li{margin:8px 0}.footer{padding:28px 24px;background:#0b2531;color:#a1b8bd;text-align:center;font-size:12px}.footer strong{color:#d4c4a1;display:block;font-size:15px;letter-spacing:.1em;margin-bottom:5px}.screen-only{}dialog{border:1px solid #526d70;border-radius:10px;padding:12px;background:#0b2531;color:#e8eddf;max-width:96vw;max-height:96vh;overflow:auto}dialog::backdrop{background:#020e16dd}dialog img{display:block;max-width:90vw;max-height:80vh;width:auto;height:auto;margin:auto;object-fit:contain}.dialog-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;padding:5px 5px 12px}.dialog-bar button{background:#29424c;color:white;border:1px solid #65818b;border-radius:4px;padding:3px 12px}.top-link{float:right;font-size:12px}
@media(min-width:1600px){.shell{max-width:1480px;grid-template-columns:220px minmax(0,1fr);gap:60px}.hero-inner,.toolbar{max-width:1360px}}
@media(max-width:1080px){.shell{grid-template-columns:175px minmax(0,1fr);gap:26px;padding:30px 22px}.toc{font-size:12px}.three-up{grid-template-columns:1fr}.summary-card{padding:20px}.summary-card p{margin:0}.hero-inner{grid-template-columns:minmax(0,1fr) 220px}.pitfall-grid{grid-template-columns:1fr}.portrait-gallery{grid-template-columns:1fr 1.25fr}.gallery-explainer{grid-column:1/-1;padding:0}.gallery-explainer p{display:inline}.gallery-explainer p:after{content:' '}.two-up.gallery{grid-template-columns:1fr}.hash-table table{min-width:600px}}
@media(max-width:760px){:root{font-size:15px}.masthead{padding:24px 20px 30px}.hero-inner{display:block}.hero-card{margin-top:24px;padding:18px}.hero-card strong{font-size:24px}.hero-card p{max-width:none}.toolbar{justify-content:flex-start;margin-bottom:20px}.hero-subtitle{font-size:16px}.shell{display:block;padding:24px 18px 50px}.toc{position:static;max-height:none;margin-bottom:32px;padding:0;border:1px solid #d7ded3;border-radius:8px;background:#ecefe6;overflow:hidden}.toc-label{margin:12px 0 8px}.toc-links{display:grid;grid-template-columns:1fr 1fr;padding-bottom:10px}.toc a{padding:5px 9px;font-size:12px}.toc-note{display:none}h2{font-size:23px}.chapter-heading{gap:12px}.chapter{padding-bottom:32px;margin-bottom:30px}.chapter-number{width:30px;height:35px;font-size:14px;padding:10px 0}.lead{font-size:13px}.two-up,.file-cards{grid-template-columns:1fr}.metric-row{grid-template-columns:1fr 1fr}.shared-strip{grid-template-columns:1fr}.platforms{grid-template-columns:1fr}.architecture{padding:20px 15px}.arch-top{gap:10px;font-size:12px}.arch-top span{padding:6px 10px}.arch-arrow{font-size:10px}.portrait-gallery{gap:12px;grid-template-columns:1fr 1.2fr}figcaption{padding:10px 12px;font-size:11px}table{font-size:12px}th,td{padding:11px 12px}td:first-child{min-width:95px}.pitfall{padding:18px}.practice-list article{padding:18px;gap:12px}.note{padding:16px}.flow{gap:6px;padding:12px}.flow span{font-size:11px}pre{font-size:11px;padding:16px}details{padding-left:13px;padding-right:13px}}
@media print{@page{size:A4;margin:16mm 14mm}:root{font-size:10pt;background:white;color:#172e39;line-height:1.6}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}.masthead{padding:20px 24px;background:#0b2632!important}.toolbar,.toc,.screen-only,dialog,.link-arrow{display:none!important}.hero-inner{display:block}.hero-card{display:none}h1{font-size:27pt;margin:10px 0}.hero-subtitle{font-size:12pt;margin-bottom:12px}.hero-meta{font-size:9pt}.hero-kicker{font-size:9pt}.shell{display:block;padding:25px 0 0;max-width:none}.chapter{padding-bottom:20px;margin-bottom:24px;scroll-margin-top:0}h2{font-size:18pt}h3{font-size:12pt;break-after:avoid}.chapter-heading{break-after:avoid;margin-bottom:16px}.lead{font-size:10pt}.three-up{gap:10px}.summary-card{padding:13px}.summary-card p,.summary-card li,.note{font-size:9pt}.note{padding:12px;break-inside:avoid}.table-wrap{overflow:visible;max-width:none}table{font-size:8.5pt;line-height:1.65;min-width:0!important}thead{display:table-header-group}tr{break-inside:avoid}td,th{padding:8px 10px}.hash-table td code{font-size:7pt}details{background:white;padding:0;border:0}summary{font-size:10pt}details[open]{padding:0}details[open] summary{margin-bottom:10px}.architecture{break-inside:avoid;padding:18px}.platforms p,.shared-strip small,.arch-arrow{font-size:8pt}.pitfall-grid{display:block}.pitfall{margin:0 0 12px;padding:14px}.pitfall dl{font-size:9pt;display:grid;grid-template-columns:30px 1fr;gap:6px 10px}.pitfall dt{margin:0}.pitfall dd{margin:0}.pitfall h3{font-size:11pt}.pitfall .citations{font-size:7.5pt;margin-top:10px;padding-top:6px}.practice-list article{padding:14px 17px}.practice-list p{font-size:9pt}.gallery{break-inside:avoid}.gallery.two-up{display:grid;grid-template-columns:1fr 1fr}.portrait-gallery{display:grid;grid-template-columns:1fr 1.25fr 1fr}.gallery-explainer{grid-column:auto;font-size:8.5pt;padding:0}.gallery-explainer p{display:block}.reference-figure{max-width:155mm;margin:0 auto 20px;break-inside:avoid}figcaption{font-size:8pt;padding:9px 12px}.metric-row b{font-size:17pt}.metric-row span{font-size:8pt}.file-cards{font-size:9pt}.citations{font-size:8pt}pre{font-size:8pt;padding:14px;line-height:1.65}a{color:#234f5d;text-decoration:underline}.footer{margin-top:24px;padding:15px;font-size:8pt}.footer strong{font-size:10pt}}
`;

const chapters = [
  ['decision','01','结论与采用边界'],['architecture','02','分层架构'],['versions','03','固定版本与环境'],['closed-loop','04','Agent 编辑闭环'],['visuals','05','参考还原与自适应'],['pitfalls','06','踩坑手册'],['acceptance','07','验收记录'],['practices','08','最佳实践'],['reproduce','09','工程与复现'],['boundaries','10','维护与许可'],['evidence','11','证据与哈希'],
];
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="同一个背包工程的 FairyGUI 浏览器优先、Agent 编辑闭环及 Unity/PuerTS 迁移实证总结，含踩坑、最佳实践和证据。"><title>FairyGUI 跨端 UI｜方案、踩坑与最佳实践</title><style>${css}</style></head>
<body id="top"><header class="masthead"><div class="toolbar screen-only"><button type="button" id="toggle-details" aria-expanded="false">展开全部细节</button><button type="button" id="print">打印 / 保存 PDF</button></div><div class="hero-inner"><div><div class="hero-kicker">LUMIONEXT · ENGINEERING FIELD NOTES</div><h1>一套背包，走通两端 UI</h1><p class="hero-subtitle">FairyGUI 浏览器优先 → Agent 编辑闭环 → Unity / PuerTS<br>方案、踩坑总结与最佳实践</p><div class="hero-meta">${badge('用户验收通过')}<span>整理于 2026.10.16</span><span>本地独立验证工程</span></div></div><div class="hero-card"><span class="eyebrow">THE CORE DECISION</span><strong>共享规则<br>适配平台</strong><p>让业务、几何和素材可复用；把字体、事件、资源与生命周期的差异放进明确的平台边界。</p></div></div></header>
<div class="shell"><nav class="toc" aria-label="文档目录"><div class="toc-label">DOCUMENT MAP</div><div class="toc-links">${chapters.map(([id,n,title])=>`<a href="#${id}"><small>${n}</small>${title}</a>`).join('')}</div><p class="toc-note">单文件 HTML · 截图内嵌<br>支持离线阅读、图片放大与打印<br>原始证据保持各自判定</p></nav><main class="content">${summary}${architectureSection}${versions}${workflow}${visuals}${pitfalls}${acceptance}${practices}${reproduce}${boundaries}${evidence}<a class="top-link screen-only" href="#top">回到顶部 ↑</a></main></div>
<footer class="footer"><strong>旅者背包 · 跨端 UI 实证记录</strong>方案可复用，结论有边界，失败证据可追溯。 · 2026-10-16</footer>
<dialog id="image-dialog" aria-labelledby="image-dialog-title"><div class="dialog-bar"><span id="image-dialog-title"></span><button type="button" id="close-dialog">关闭 ×</button></div><img alt=""></dialog>
<script>
const details=[...document.querySelectorAll('details')];
const toggle=document.getElementById('toggle-details');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';details.forEach(d=>d.open=open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'收起全部细节':'展开全部细节';});
const dialog=document.getElementById('image-dialog');let opener;
document.querySelectorAll('.image-button').forEach(button=>button.addEventListener('click',()=>{opener=button;const img=button.querySelector('img');dialog.querySelector('img').src=img.src;dialog.querySelector('img').alt=img.alt;document.getElementById('image-dialog-title').textContent=button.dataset.imageTitle;dialog.showModal();}));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>opener?.focus());
const tocLinks=[...document.querySelectorAll('.toc-links a')];
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){tocLinks.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-5% 0px -75% 0px'});
document.querySelectorAll('.chapter').forEach(s=>observer.observe(s));
let printState;window.addEventListener('beforeprint',()=>{printState=details.map(d=>d.open);details.forEach(d=>d.open=true);});window.addEventListener('afterprint',()=>{if(printState)details.forEach((d,i)=>d.open=printState[i]);});
document.getElementById('print').addEventListener('click',()=>window.print());
</script></body></html>`;

await fs.mkdir(out,{recursive:true});
const file = path.join(out,'FairyGUI-跨端UI方案与最佳实践.html');
await fs.writeFile(file,html,'utf8');
const localReferences = await Promise.all([...refs.values()].map(async r=>{
  const stat = await fs.stat(r.path);
  return {path:path.relative(validation,r.path).replaceAll('\\','/'),label:r.label,type:stat.isDirectory()?'directory':'file',bytes:stat.isFile()?stat.size:undefined};
}));
const manifest = {schemaVersion:1,title:'FairyGUI 跨端 UI：方案、踩坑与最佳实践',document:path.basename(file),documentSha256:sha(Buffer.from(html)),bytes:Buffer.byteLength(html),date:'2026-10-16',timezone:'America/Los_Angeles',createdAtUtc:new Date().toISOString(),selfContained:true,externalDependencies:[],chapters:chapters.length,images,localReferences,scope:'Documentation only. No Unity/game build, runtime or packaging executed during document preparation.'};
await fs.writeFile(path.join(out,'document-manifest.json'),JSON.stringify(manifest,null,2),'utf8');
console.log(JSON.stringify({file,bytes:manifest.bytes,chapters:manifest.chapters,images:images.length,references:localReferences.length,sha256:manifest.documentSha256}));
