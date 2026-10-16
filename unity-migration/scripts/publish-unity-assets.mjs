import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';

const scriptPath = fileURLToPath(import.meta.url);
const migrationRoot = path.dirname(path.dirname(scriptPath));
const verificationRoot = path.dirname(migrationRoot);
const reportRoot = path.join(migrationRoot, 'assets-publish');
const output = path.join(reportRoot, 'unity');
const roundtripRoot = path.join(verificationRoot, '闭环验证/roundtrip-final');
const projectRoot = path.join(roundtripRoot, 'project');
const projectPath = path.join(projectRoot, 'Inventory.fairy');
const expectedArchiveHash = '183e93d11990ef2a1adeb8a7329911db525463f55a3eac640c812c2245d0e702';
const expectedIds = { Btn: 'button01', ItemRow: 'itemrow1', Main: 'main0001', Reward: 'reward01', icon: 'icon0001' };
const expectedTitle = '旅者背包 · 网页保存闭环';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const require = createRequire(path.join(verificationRoot, 'toolchain-test/package.json'));
const editorRequire = createRequire(path.join(verificationRoot, 'repos/editor-online/package.json'));
const { NodeIO } = require('@openfairygui/core/node');
const { ProjectType, liftDocumentToUamProject } = require('@openfairygui/core');
const { publishNode, validateProjectNode } = require('@openfairygui/functions/node');
const { unzipSync } = editorRequire('fflate');

async function manifest(directory, relative = '') {
  const files = [];
  for (const item of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    assert(!item.isSymbolicLink(), 'Source and output must not contain symlinks.');
    const name = path.join(relative, item.name);
    if (item.isDirectory()) files.push(...await manifest(directory, name));
    else { const bytes = await readFile(path.join(directory, name)); files.push({ path: name.replaceAll('\\', '/'), size: bytes.length, sha256: sha256(bytes) }); }
  }
  return files.sort((a,b) => a.path.localeCompare(b.path));
}

function getMain(project) {
  return project.packages.find(p => p.id === 'invtest1').resources.find(r => r.id === expectedIds.Main).component;
}
function scalar(value) {
  if (Array.isArray(value)) return value.map(scalar);
  return typeof value === 'string' && value !== '' && Number.isFinite(Number(value)) ? Number(value) : value;
}
function argbColor(value) {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(value)) return value;
  const hex=value.slice(1).toLowerCase();
  return `#${hex.length===6?'ff':''}${hex}`;
}
function projection(project) {
  return project.packages.map(pkg => ({
    id: pkg.id, name: pkg.name,
    resources: pkg.resources.map(r => ({
      id: r.id, name: r.name, kind: r.kind,
      ...(r.kind === 'image' ? { dimensions: r.dimensions } : {}),
      ...(r.kind === 'component' ? {
        size: r.component.size,
        extensionType: r.component.properties.extensionType,
        children: r.component.displayList.map(n => ({
          id: n.id, name: n.name, kind: n.kind, position: n.position, size: n.size,
          alpha: n.alpha, rotation: n.rotation, visible: n.visible, touchable: n.touchable, grayed: n.grayed,
          ...(n.resource ? { resource: { packageId: n.resource.packageId || pkg.id, resourceId: n.resource.resourceId } } : {}),
          ...(['text','richText','textInput'].includes(n.kind) ? {
            text: n.text, font: n.font, fontSize: n.fontSize, color: argbColor(n.color), align: n.align, vAlign: n.vAlign,
            singleLine: n.singleLine, autoSize: n.autoSize,
          } : {}),
          ...(n.kind === 'textInput' ? { promptText:n.promptText, password:n.password, maxLength:n.maxLength, restrict:n.restrict } : {}),
          ...(n.kind === 'graph' ? { graphType:n.graphType, fillColor:argbColor(n.fillColor), lineColor:argbColor(n.lineColor), lineSize:n.lineSize } : {}),
          ...(n.kind === 'list' ? { defaultItem:n.defaultItem, lineGap:n.lineGap, overflow:n.overflow, scrollType:n.scrollType, scrollBarDisplay:n.scrollBarDisplay } : {}),
          ...(n.instanceProperties ? { instanceProperties:n.instanceProperties } : {}),
          gears: n.gears.map(g => ({ kind:g.kind, controllerName:g.controllerName, defaultValue:g.defaultValue, states:g.states, visibleOnPageIds:g.visibleOnPageIds })),
        })),
        controllers:r.component.controllers.map(c => ({ name:c.name, selectedIndex:c.selectedIndex, pages:c.pages.map(p=>({id:p.id,name:p.name})), actions:c.actions })),
        // Binary stores seconds, not the author's frame-rate setting.
        transitions:r.component.transitions.map(t=>({ name:t.name, autoPlay:t.autoPlay, autoPlayTimes:t.autoPlayTimes, autoPlayDelay:t.autoPlayDelay, options:t.options,
          items:t.items.map(i=>({ timeSeconds:i.time/t.fps, durationSeconds:i.duration/t.fps, actionType:i.actionType, targetNodeId:i.targetNodeId, tween:i.tween, startValue:scalar(i.startValue), endValue:scalar(i.endValue), easeType:i.easeType, repeat:i.repeat, yoyo:i.yoyo, label:i.label })) })),
      } : {}),
    })).sort((a,b)=>a.id.localeCompare(b.id)),
  })).sort((a,b)=>a.id.localeCompare(b.id));
}

await mkdir(reportRoot, {recursive:true});
const report = { schemaVersion:1, status:'running', scriptPath, scriptSha256:sha256(await readFile(scriptPath)), sourceProject:projectPath, output, codeGeneration:false, plugins:[], checks:[] };
let sourceBefore;
let archiveBefore;
let archivePath;
try {
  for (const name of ['core','functions']) {
    const metadata = JSON.parse(await readFile(path.join(verificationRoot, 'toolchain-test/node_modules/@openfairygui', name, 'package.json'),'utf8'));
    assert.equal(metadata.version, '0.7.0');
  }
  report.packageVersions = {core:'0.7.0',functions:'0.7.0'};
  const priorReport = JSON.parse(await readFile(path.join(roundtripRoot,'publish-report.json'),'utf8'));
  archivePath = priorReport.sourceArchive;
  archiveBefore = sha256(await readFile(archivePath));
  assert.equal(archiveBefore, expectedArchiveHash);
  assert.equal(priorReport.archiveSha256, expectedArchiveHash);
  report.sourceArchive = {path:archivePath, sha256:archiveBefore};
  sourceBefore = await manifest(projectRoot);
  report.sourceManifestSha256 = sha256(Buffer.from(JSON.stringify(sourceBefore)));
  report.sourceFairySha256 = sourceBefore.find(f=>f.path==='Inventory.fairy').sha256;
  await writeFile(path.join(reportRoot,'source-manifest-before.json'),JSON.stringify(sourceBefore,null,2));
  const archiveEntries = Object.entries(unzipSync(await readFile(archivePath))).filter(([name])=>!name.endsWith('/'));
  const archivedManifest = archiveEntries.map(([name,bytes])=>({path:name.replaceAll('\\','/'),size:bytes.length,sha256:sha256(bytes)})).sort((a,b)=>a.path.localeCompare(b.path));
  assert.deepEqual(archivedManifest,sourceBefore,'Final source must be the byte-identical ZIP extraction.');
  report.checks.push({name:'final-source-matches-browser-export-zip',passed:true,fileCount:sourceBefore.length});
  report.validation = await validateProjectNode(projectPath);
  assert.equal(report.validation.status,'valid');assert.equal(report.validation.complete,true);
  const document = await new NodeIO().readProject(projectPath);
  const source = liftDocumentToUamProject(document);
  assert.equal(source.packages.length,1);assert.equal(source.packages[0].id,'invtest1');assert.equal(source.packages[0].name,'Inventory');
  for(const resource of source.packages[0].resources) assert.equal(resource.id,expectedIds[resource.name]);
  assert.equal(source.packages[0].resources.length,Object.keys(expectedIds).length);
  const title=getMain(source).displayList.find(n=>n.id==='title');
  assert.equal(title.text,expectedTitle);assert.deepEqual(title.position,{x:46,y:29});assert.equal(title.color,'#8df0c4');
  report.sourceTitle=title;
  report.sourceConfiguration={projectType:source.projectType,settings:source.settings,packagePublish:source.packages[0].publish};
  const expectedProjection=projection(source);
  report.semanticComparisonNormalization={colors:'Case-insensitive ARGB; 6-digit RGB is opaque (FF alpha). Core readColorValue preserves graph alpha and returns uppercase.',transitionTiming:'Effective seconds from authoring frames divided by fps; binary does not store the authoring fps.'};
  await writeFile(path.join(reportRoot,'source-runtime-projection.json'),JSON.stringify(expectedProjection,null,2));
  // This only changes the detached Document. No writeProject/saveSession is called.
  document.getRoot().setProjectType(ProjectType.Unity);
  report.effectivePublishConfiguration={projectType:ProjectType.Unity,fileExtension:'bytes',compressed:false,codeGeneration:false,plugins:[],assetsPath:path.join(projectRoot,'assets')};
  report.published=await publishNode({document,output,assetsPath:path.join(projectRoot,'assets'),compressed:false,fileExtension:'bytes',codeGeneration:false,plugins:[]});
  const outputManifest=await manifest(output);
  assert.deepEqual(outputManifest.map(f=>f.path),['Inventory_atlas0.png','Inventory_fui.bytes'].sort((a,b)=>a.localeCompare(b)));
  for(const file of report.published.files) assert.equal((await stat(file.path)).size,file.size);
  report.outputFiles=outputManifest;
  const binaryPath=path.join(output,'Inventory_fui.bytes');const binary=await readFile(binaryPath);
  report.binaryHeader={magic:binary.subarray(0,4).toString('ascii'),version:binary.readInt32BE(4),compressed:binary[8]!==0};
  assert.equal(report.binaryHeader.magic,'FGUI');assert.equal(report.binaryHeader.compressed,false);
  const decoded=liftDocumentToUamProject(await new NodeIO().readBinary(binaryPath));
  const decodedProjection=projection(decoded);
  await writeFile(path.join(reportRoot,'binary-runtime-projection.json'),JSON.stringify(decodedProjection,null,2));
  assert.deepEqual(decodedProjection,expectedProjection,'Unity binary must preserve the selected runtime semantics.');
  report.checks.push({name:'unity-binary-runtime-semantics',passed:true,scope:'IDs, geometry, text/input/graph/list fields, resource references, instance properties, controller pages/gears, effective transition time'});
  report.unityReferences={resourcesFolderSuggestion:'Assets/Resources/InventoryUI',addPackageArgument:'InventoryUI/Inventory',packageName:'Inventory',componentNames:['Main','ItemRow','Reward','Btn'],packageId:'invtest1',componentIds:expectedIds};
  report.status='passed';
} catch(error) {
  report.status='failed';report.error={name:error.name,message:error.message,stack:error.stack};process.exitCode=1;
} finally {
  if(sourceBefore){
    const sourceAfter=await manifest(projectRoot);
    await writeFile(path.join(reportRoot,'source-manifest-after.json'),JSON.stringify(sourceAfter,null,2));
    const changedPaths=[...new Set([...sourceBefore.map(f=>f.path),...sourceAfter.map(f=>f.path)])].filter(name=>sourceBefore.find(f=>f.path===name)?.sha256!==sourceAfter.find(f=>f.path===name)?.sha256);
    const archiveAfter=sha256(await readFile(archivePath));
    report.sourceUnchanged={passed:changedPaths.length===0&&archiveAfter===archiveBefore,changedPaths,archiveSha256After:archiveAfter,allTargetAndUnrelatedSourceFilesCompared:true};
    if(!report.sourceUnchanged.passed){report.status='failed';process.exitCode=1;}
  }
  await writeFile(path.join(reportRoot,'publish-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,sourceProject:projectPath,sourceArchive:report.sourceArchive,output,files:report.outputFiles,sourceUnchanged:report.sourceUnchanged,error:report.error},null,2));
}
