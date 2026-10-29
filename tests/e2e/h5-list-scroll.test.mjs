import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchBrowser} from '../helpers/browser.mjs';
import {runH5} from '../conformance/runner.mjs';
import {createInventoryContext} from '../unity/acceptance/context.mjs';

const source = fileURLToPath(new URL('../../examples/inventory/src/modules/bag/BagView.ts', import.meta.url)).split(path.sep).join('/');
const model = fileURLToPath(new URL('../../examples/inventory/src/modules/bag/BagModel.ts', import.meta.url)).split(path.sep).join('/');

test('h5: writing a different list position commits before inertia advances and survives rotation', {timeout: 60000}, async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
    const context = await createInventoryContext();
    fs.writeFileSync(path.join(context.root, 'conformance/cases/list-scroll.ts'), `import {lgui} from 'lgui';
import type {UIList,TestHarness} from 'lgui';
import {BagView} from ${JSON.stringify(source)};
import {bagModel} from ${JSON.stringify(model)};
export default {screen:{width:1280,height:720},async run(t:TestHarness){
  // Same real business state as the acceptance failure: 23 cells / four rows,
  // content height 688 in the 620-high viewport, so the drag enters bounce-back.
  bagModel.equip('bow-1');bagModel.sold('sword-1',1,80);bagModel.salvage('axe-1');
  const view=await t.open(BagView);
  const list=():UIList=>view.__component!.child('list') as UIList;
  await t.drag('Bag/BagPanel.list',0,-120);
  if(list().scrollPosition.y<=0)throw new Error('LGUI-RT-001 The real inventory drag did not scroll.');
  list().scrollPosition={x:0,y:40};
  const immediate=list().scrollPosition.y;
  await t.advance(16);
  const nextFrame=list().scrollPosition.y;
  if(immediate!==40 || nextFrame!==40)throw new Error('LGUI-RT-001 Different list position was overwritten before rotation: '+JSON.stringify({immediate,nextFrame}));
  const selected=list().selectedIndex;
  await t.setScreen(450,800);
  if(t.snapshot().orientation!=='portrait' || list().scrollPosition.y!==40 || list().selectedIndex!==selected)
    throw new Error('LGUI-RT-001 Rotation did not preserve the committed list position/selection: '+JSON.stringify({immediate,nextFrame,portrait:list().scrollPosition.y,selected,actualSelected:list().selectedIndex,orientation:t.snapshot().orientation}));
  return {immediate,nextFrame,portrait:list().scrollPosition.y,selected,orientation:t.snapshot().orientation};
}};\n`);
    const output = await runH5(context, 'list-scroll', browser);
    assert.deepEqual(output.data, {immediate: 40, nextFrame: 40, portrait: 40, selected: -1, orientation: 'portrait'});
  } finally { await browser.close(); }
});
