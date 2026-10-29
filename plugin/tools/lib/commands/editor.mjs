// lgui editor：在 127.0.0.1 的随机端口上提供编辑器，带实时会话中转，用 Chrome 或 Edge 打开（地址带 ?agent=1）。
// lgui editor props <组件> <控件> <属性>=<值> ...：编辑器开着时，修改已有控件的属性（编辑器的 setDisplayNodeProps），编辑器里马上变。
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {LgCliError} from '../errors.mjs';
import {editorDir} from '../paths.mjs';
import {openInBrowser} from '../browser.mjs';
import {startEditorServer} from '../editor/relay.mjs';
import {readUiModel, findComponent} from '../generate/model.mjs';
import {uiProjectPath} from '../generate/index.mjs';

export const connectionPath = root => path.join(root, '.lgui', 'build', 'editor-connection.json');

/** 启动编辑器服务（测试也用它）。 */
export async function startEditor(root) {
  if (!fs.existsSync(path.join(editorDir, 'index.html'))) throw new LgCliError('LGUI-CLI-104', `插件里没有编辑器（${editorDir}）。`, {fix: '重新安装插件；在 LGUI 仓库里开发时运行 node scripts/build-editor/build.mjs。'});
  return startEditorServer({editorDir, projectDir: path.join(root, 'ui'), connectionFile: connectionPath(root)});
}

export async function editor({projectRoot, flags}) {
  const server = await startEditor(projectRoot);
  const url = `${server.baseUrl}/?agent=1`;
  const stop = () => { server.close().finally(() => process.exit(0)); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  const opened = flags['no-open'] ? false : openInBrowser(url);
  return {
    data: {url, opened, connection: path.relative(projectRoot, connectionPath(projectRoot)).split(path.sep).join('/')},
    summary: [
      `编辑器地址：${url}`,
      opened ? '已经用 Chrome / Edge 打开。' : (flags['no-open'] ? '没有自动打开浏览器（--no-open）。' : '没找到 Chrome 或 Edge，请手动打开上面的地址。'),
      '编辑器每次打开都从本工程的 ui/ 重新读取，显示的总是 ui/ 里的最新内容。',
      `要在编辑器里保存回 ui/：第一次在编辑器里点「文件 → 从文件夹导入…」，选择 ${path.join(projectRoot, 'ui')} 并允许读写（只要做一次）。`,
      '编辑器开着时，Agent 可以用 lgui editor props 修改控件属性。按 Ctrl+C 停止。'
    ],
    errors: []
  };
}

// ---- lgui editor props ----

const BOOL = ['visible', 'touchable', 'grayed'];
const NUMBER = ['alpha', 'rotation', 'fontSize'];
const STRING = ['text', 'font', 'color', 'customData', 'tooltips'];
const POSITION = ['x', 'y'];
const SIZE = ['width', 'height'];
const INSTANCE = ['title', 'icon'];
const KEYS = [...BOOL, ...NUMBER, ...STRING, ...POSITION, ...SIZE, ...INSTANCE];

const notOpen = (why) => new LgCliError('LGUI-CLI-100', `编辑器没开，或者编辑器页面没连上（${why}）。`, {fix: '先在工程目录运行 lgui editor，等编辑器页面打开。'});

/** 把 <属性>=<值> 换成编辑器的属性；node 是控件现在的属性（合并位置、尺寸、按钮标题时用）。 */
export function toEditorProps(pairs, node) {
  const props = {};
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    const key = eq > 0 ? pair.slice(0, eq) : pair;
    const raw = eq > 0 ? pair.slice(eq + 1) : '';
    if (eq <= 0 || !KEYS.includes(key)) throw new LgCliError('LGUI-CLI-101', `${pair} 不是能改的属性。`, {fix: `写成 <属性>=<值>；能改的属性：${KEYS.join('、')}。`});
    const number = () => { const n = Number(raw); if (raw === '' || !Number.isFinite(n)) throw new LgCliError('LGUI-CLI-101', `${key} 要写数字（现在是 ${raw}）。`, {fix: `比如 ${key}=1。`}); return n; };
    if (BOOL.includes(key)) {
      if (raw !== 'true' && raw !== 'false') throw new LgCliError('LGUI-CLI-101', `${key} 要写 true 或 false（现在是 ${raw}）。`, {fix: `比如 ${key}=false。`});
      props[key] = raw === 'true';
    } else if (NUMBER.includes(key)) props[key] = number();
    else if (STRING.includes(key)) props[key] = raw;
    else if (POSITION.includes(key)) props.position = {...(props.position ?? node.position), [key]: number()};
    else if (SIZE.includes(key)) props.size = {...(props.size ?? node.size), [key]: number()};
    else {
      if (!node.instanceProperties) throw new LgCliError('LGUI-CLI-101', `控件 ${node.name} 不是按钮或标签，没有 ${key}。`, {fix: '文字控件改 text；按钮、标签改 title、icon。'});
      props.componentInstanceProperties = {...(props.componentInstanceProperties ?? node.instanceProperties), [key]: raw};
    }
  }
  if (!Object.keys(props).length) throw new LgCliError('LGUI-CLI-101', '没写要改的属性。', {fix: '写成 lgui editor props Bag/BagPanel sellButton title=出售。'});
  return props;
}

async function call(conn, route, body) {
  let res;
  try {
    res = await fetch(`${conn.baseUrl}/__lgui_editor/${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {Authorization: `Bearer ${conn.token}`, 'Content-Type': 'application/json'},
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw notOpen(`连不上 ${conn.baseUrl}`);
  }
  return res.json();
}

export async function editorProps({projectRoot, args}) {
  const [componentName, control, ...pairs] = args;
  if (!componentName || !control) throw new LgCliError('LGUI-CLI-101', '要写组件和控件。', {fix: '写成 lgui editor props Bag/BagPanel sellButton title=出售。'});
  if (control.includes('.')) throw new LgCliError('LGUI-CLI-101', `控件 ${control} 是子组件里的路径；这里只能改组件自己的控件。`, {fix: '改子组件里的控件，就写子组件的名字，比如 lgui editor props Common/Button title …'});
  const model = readUiModel(uiProjectPath(projectRoot));
  const component = findComponent(model, componentName);
  if (!component) throw new LgCliError('LGUI-CLI-102', `ui/ 里没有组件 ${componentName}。`, {fix: '用 lgui ui list 查组件名。'});
  const child = component.children.find(c => c.name === control);
  if (!child) throw new LgCliError('LGUI-CLI-102', `${componentName} 里没有控件 ${control}。`, {fix: '用 lgui ui list 查控件名。'});

  const file = connectionPath(projectRoot);
  if (!fs.existsSync(file)) throw notOpen('没有连接文件');
  const conn = JSON.parse(fs.readFileSync(file, 'utf8'));
  const clients = await call(conn, 'clients');
  const client = clients.data?.clients?.sort((a, b) => b.lastSeen - a.lastSeen)[0];
  if (!client) throw notOpen('没有连着的编辑器页面');

  const rpc = request => call(conn, 'rpc', {clientId: client.clientId, request});
  const selector = {packageId: component.pkg.id, componentResourceId: component.id, displayNodeId: child.id};
  const found = await rpc({method: 'query', selector});
  if (!found.ok) {
    if (found.error?.code === 'selector_not_found') throw new LgCliError('LGUI-CLI-102', `编辑器里找不到 ${componentName} 的 ${control}。`, {fix: `编辑器里打开的可能不是本工程的 ui/：在编辑器里点「文件 → 从文件夹导入…」，选择 ${path.join(projectRoot, 'ui')}。`});
    throw new LgCliError('LGUI-CLI-103', `编辑器拒绝了查询：${found.error?.code} ${found.error?.message ?? ''}`, {fix: '看编辑器的提示；重新打开编辑器后再试。'});
  }
  const props = toEditorProps(pairs, found.data.entity);
  const requestId = crypto.randomUUID();
  const result = await rpc({method: 'transact', requestId, identity: found.data.identity, summary: `lgui editor props ${componentName} ${control}`, operations: [{kind: 'setDisplayNodeProps', selector, props}]});
  if (!result.ok) throw new LgCliError('LGUI-CLI-103', `编辑器拒绝了修改：${result.error?.code} ${result.error?.message ?? ''}`, {fix: result.error?.code === 'stale_write' ? '编辑器里的内容刚变过，再运行一次。' : '按编辑器的提示改属性值。'});
  return {
    data: {component: componentName, control, props, revision: result.data?.identity?.revision ?? null},
    summary: [`已经在编辑器里修改 ${componentName} 的 ${control}：${pairs.join(' ')}`, '在编辑器里保存（Ctrl+S）后写回 ui/。']
  };
}
