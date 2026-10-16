import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../repos/editor-online');
const projectPath = path.resolve(here, '../../toolchain-test/project/Inventory.fairy');
process.chdir(repo);
const require = createRequire(path.join(repo, 'package.json'));
const coreVersion = JSON.parse(await readFile(path.join(repo, 'node_modules/@openfairygui/core/package.json'), 'utf8')).version;
assert.equal(coreVersion, '0.2.4', 'Regression must use the editor’s locked Core version.');
const core = await import(pathToFileURL(require.resolve('@openfairygui/core')).href);
const { NodeIO } = await import(pathToFileURL(require.resolve('@openfairygui/core/node')).href);
const { importTypeScriptModule } = await import(pathToFileURL(path.join(repo, 'scripts/import-typescript-module.mjs')).href);
const { InspectorController } = await importTypeScriptModule('src/editor/ui/InspectorController.ts');
const { createProjectSnapshotFromUamProject } = await importTypeScriptModule('src/editor/services/UamProjectSnapshotAdapter.ts');
const document = await new NodeIO().readProject(projectPath);
const project = core.liftDocumentToUamProject(document);
const snapshot = createProjectSnapshotFromUamProject(project, { projectPath, openfairyguiVersion: coreVersion, reader: 'NodeIO' });
const pkg = snapshot.packages.find(p => p.name === 'Inventory');
const component = pkg.components.find(c => c.name === 'Main');
const records = [];
after(async () => {
  await writeFile(process.env.TEXT_FIX_REPORT || path.join(here, 'latest-results.json'), JSON.stringify({ coreVersion, projectPath, records }, null, 2));
});

// Only the graphical controls are represented by their input values. The command
// builder, snapshot mapper, Core preflight and transaction application are real.
function controls(node, changes = {}) {
  const p = { ...node.textProperties, ...changes };
  return {
    text: { title: p.text }, font: { title: p.font }, fontSize: { title: String(p.fontSize) }, color: p.color,
    align: { selectedIndex: p.align }, verticalAlign: { selectedIndex: p.vAlign },
    leading: { numberValue: p.leading }, letterSpacing: { numberValue: p.letterSpacing },
    autoSize: { selectedIndex: p.autoSize }, singleLine: { selected: p.singleLine },
    clearOnPublish: { selected: p.autoClearText }, varsEnabled: { selected: p.templateVarsEnabled },
    ubbEnabled: { selected: p.ubbEnabled }, underline: { selected: p.underline },
    italic: { selected: p.italic }, bold: { selected: p.bold }, strike: { selected: p.strikethrough },
  };
}

function makeCommand(node, changes, position) {
  const inspector = new InspectorController({}, () => {}, () => {});
  inspector.fields.textEditor = controls(node, changes);
  if (position) { inspector.fields.x = { numberValue: position.x }; inspector.fields.y = { numberValue: position.y }; }
  return inspector.createDisplayNodeCommand(pkg, component, node);
}

const cases = [
  { name: 'Chinese text change reaches Core', changes: { text: '网页已修复：奖励可领取' } },
  { name: 'font change reaches Core', changes: { font: 'Arial' } },
  { name: 'font size change reaches Core', changes: { fontSize: 26 } },
  { name: 'color change reaches Core', changes: { color: '#123456' } },
  { name: 'text and all Inspector style controls reach Core together', changes: {
    text: '样式完整保留', font: 'Arial', fontSize: 28, color: '#AABBCC', align: 1, vAlign: 1,
    leading: 5, letterSpacing: 2, autoSize: 0, singleLine: true, autoClearText: true,
    templateVarsEnabled: true, ubbEnabled: true, underline: true, italic: true, bold: true, strikethrough: true,
  } },
  { name: 'common layout and text changes remain composable', changes: { text: '位置和文本一起改' }, position: { x: 38, y: 26 } },
  { name: 'text input editing uses the same valid contract', nodeId: 'search', changes: { text: '药水' } },
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const node = component.children.find(n => n.id === (scenario.nodeId || 'title'));
    const command = makeCommand(node, scenario.changes, scenario.position);
    const issues = core.validateTransactionSupport(project, [command]);
    records.push({ name: scenario.name, command, issues });
    assert.equal(issues.length, 0, JSON.stringify(issues));
    const changed = core.applyUamTransaction(project, [command]);
    const changedNode = changed.packages.find(p => p.id === pkg.id).resources.find(r => r.id === component.id).component.displayList.find(n => n.id === node.id);
    for (const [key, value] of Object.entries(scenario.changes)) {
      assert.equal(changedNode[key], key === 'color' ? value.toLowerCase() : value, `Applied ${key}`);
    }
    if (scenario.position) assert.deepEqual(changedNode.position, scenario.position);
    // Editing visible controls must retain less common authoring attributes.
    for (const key of ['strokeColor', 'strokeSize', 'shadowColor', 'shadowOffset', 'outlineSoftness', 'underlaySoftness']) {
      assert.deepEqual(changedNode[key], node.textProperties[key], `Preserved ${key}`);
    }
    const originalNode = project.packages.find(p => p.id === pkg.id).resources.find(r => r.id === component.id).component.displayList.find(n => n.id === node.id);
    assert.equal(originalNode.text, node.text, 'Transaction does not mutate its baseline.');
  });
}

test('unchanged text Inspector produces no edit', () => {
  const node = component.children.find(n => n.id === 'title');
  assert.deepEqual(makeCommand(node, {}).props, {});
});
