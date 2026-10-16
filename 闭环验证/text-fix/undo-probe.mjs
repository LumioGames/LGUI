import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../repos/editor-online');
process.chdir(repo);
const require = createRequire(path.join(repo, 'package.json'));
const core = await import(pathToFileURL(require.resolve('@openfairygui/core')).href);
const { NodeIO } = await import(pathToFileURL(require.resolve('@openfairygui/core/node')).href);
const { importTypeScriptModule } = await import(pathToFileURL(path.join(repo, 'scripts/import-typescript-module.mjs')).href);
const { createInverseSetDisplayNodePropsOperation, snapshotDisplayNode } = await importTypeScriptModule('src/editor/commands/DisplayNodePropsLogic.ts');
const { createProjectSnapshotFromUamProject } = await importTypeScriptModule('src/editor/services/UamProjectSnapshotAdapter.ts');
const projectPath = path.resolve(here, '../../toolchain-test/project/Inventory.fairy');
const project = core.liftDocumentToUamProject(await new NodeIO().readProject(projectPath));
const snapshot = createProjectSnapshotFromUamProject(project, {projectPath, openfairyguiVersion:'0.2.4', reader:'NodeIO'});
const pkg = snapshot.packages.find(p=>p.name==='Inventory');
const main = pkg.components.find(c=>c.name==='Main');
const title = main.children.find(n=>n.id==='title');
const fixed = JSON.parse(await readFile(path.join(here,'green-results.json'),'utf8')).records[0].command;
const legacy = JSON.parse(await readFile(path.join(here,'red-results.json'),'utf8')).records[0].command;
const fixedInverse = createInverseSetDisplayNodePropsOperation(fixed, snapshotDisplayNode(title), 1);
const legacyInverse = createInverseSetDisplayNodePropsOperation(legacy, snapshotDisplayNode(title), 1);
const changed = core.applyUamTransaction(project, [fixed]);
const fixedIssues = core.validateTransactionSupport(changed,[fixedInverse]);
assert.deepEqual(fixedIssues,[]);
const restored = core.applyUamTransaction(changed,[fixedInverse]);
const restoredTitle = restored.packages.find(p=>p.id===pkg.id).resources.find(r=>r.id===main.id).component.displayList.find(n=>n.id==='title');
assert.equal(restoredTitle.text,title.text);
const legacyIssues = core.validateTransactionSupport(project,[legacyInverse]);
assert(legacyIssues.some(i=>i.code==='invalid_display_node_payload'&&i.message.includes('cannot be combined')));
const result={
  coreVersion:'0.2.4', fixedInverse, fixedIssues, restoredText:restoredTitle.text,
  legacyInverse, legacyIssues,
  conclusion:'Inverse generation mirrors edited fields. A legal full-textProperties forward command produces a legal full-textProperties inverse; the original illegal mixed command produces the same illegal mixed inverse. No Adapter change is needed for new Inspector commands.',
};
await writeFile(path.join(here,'undo-results.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({fixedUndoPassed:true,restoredText:restoredTitle.text,fixedInverseKeys:Object.keys(fixedInverse.props),legacyInverseKeys:Object.keys(legacyInverse.props),legacyIssues},null,2));
