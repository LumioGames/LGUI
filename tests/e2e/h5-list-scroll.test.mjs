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

async function scrollCase() {
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
  const landscape=view.__component;
  if(t.snapshot().orientation!=='landscape' || landscape?.componentName!=='Bag/BagPanel')
    throw new Error('LGUI-RT-001 The rotation regression must start on the real landscape component.');
  await t.setScreen(450,800);
  // setScreen includes a wall-clock wait. The 150ms orientation debounce runs
  // on real frames, so delayed rAF may still be pending when that timer ends.
  const started=lgui.time.now();
  while(t.snapshot().orientation!=='portrait'){
    if(lgui.time.now()-started>=5000)throw new Error('LGUI-RT-001 The framework did not finish portrait rotation: '+JSON.stringify(t.snapshot()));
    await t.advance(16);
  }
  if(view.__component===landscape || view.__component?.componentName!=='Bag/BagPanel@portrait')
    throw new Error('LGUI-RT-001 Portrait orientation did not replace the landscape component.');
  if(t.snapshot().orientation!=='portrait' || list().scrollPosition.y!==40 || list().selectedIndex!==selected)
    throw new Error('LGUI-RT-001 Rotation did not preserve the committed list position/selection: '+JSON.stringify({immediate,nextFrame,portrait:list().scrollPosition.y,selected,actualSelected:list().selectedIndex,orientation:t.snapshot().orientation}));
  return {immediate,nextFrame,portrait:list().scrollPosition.y,selected,orientation:t.snapshot().orientation};
}};\n`);
  return context;
}

const expected = {immediate: 40, nextFrame: 40, portrait: 40, selected: -1, orientation: 'portrait'};

test('h5: writing a different list position commits before inertia advances and survives rotation', {timeout: 60000}, async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  try {
    const context = await scrollCase();
    const output = await runH5(context, 'list-scroll', browser);
    assert.deepEqual(output.data, expected);
  } finally { await browser.close(); }
});

test('h5: rotation assertion waits for the actual frame after the Harness wall timer has completed', {timeout: 60000}, async t => {
  const browser = await launchBrowser();
  if (!browser) { t.skip('未找到 Chrome 或 Edge'); return; }
  let release, controllerError, beforeRelease, beforeClose;
  const delayedFrames = {
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(() => {
        const raf = window.requestAnimationFrame.bind(window);
        const timeout = window.setTimeout.bind(window);
        const control = {held: false, heldCallbacks: 0, wallTimerDelivered: false, resizes: [], queued: []};
        window.__rotationFrames = control;
        window.requestAnimationFrame = callback => raf(time => {
          if (control.held) { control.heldCallbacks++; control.queued.push(callback); }
          else Reflect.apply(callback, window, [time]);
        });
        window.setTimeout = (callback, delay, ...args) => {
          if (typeof callback !== 'function') return timeout(callback, delay, ...args);
          return timeout(() => {
            if (control.held && delay === 200) control.wallTimerDelivered = true;
            Reflect.apply(callback, window, args);
          }, delay);
        };
        window.addEventListener('resize', () => control.resizes.push({width: innerWidth, height: innerHeight}));
        control.release = () => {
          control.held = false;
          for (const callback of control.queued.splice(0)) raf(callback);
        };
      });
      const resize = page.setViewportSize.bind(page);
      page.setViewportSize = async size => {
        await page.evaluate(() => { window.__rotationFrames.held = true; });
        const result = await resize(size);
        release = (async () => {
          // This is the fault-injection gate, not a longer wait in the test:
          // release only after the real Harness 200ms timer has fired while
          // framework rAF callbacks are still withheld.
          await page.waitForFunction(() => window.__rotationFrames.wallTimerDelivered, null, {polling: 10, timeout: 5000});
          beforeRelease = await page.evaluate(() => ({
            held: window.__rotationFrames.held, heldCallbacks: window.__rotationFrames.heldCallbacks,
            wallTimerDelivered: window.__rotationFrames.wallTimerDelivered, resizes: window.__rotationFrames.resizes,
            width: innerWidth, height: innerHeight, orientation: window.__lguiTest.current.snapshot().orientation
          }));
          await page.evaluate(() => window.__rotationFrames.release());
        })().catch(error => { controllerError = error; });
        return result;
      };
      const close = page.close.bind(page);
      page.close = async () => {
        try {
          beforeClose = await page.evaluate(() => ({held: window.__rotationFrames.held,
            heldCallbacks: window.__rotationFrames.heldCallbacks, wallTimerDelivered: window.__rotationFrames.wallTimerDelivered,
            width: innerWidth, height: innerHeight, orientation: window.__lguiTest.current.snapshot().orientation}));
        } finally { await close(); }
      };
      return page;
    }
  };
  try {
    const context = await scrollCase();
    const output = await runH5(context, 'list-scroll', delayedFrames);
    await release;
    assert.equal(controllerError, undefined);
    assert.deepEqual(output.data, expected);
    assert.equal(beforeRelease.orientation, 'landscape');
    assert.equal(beforeRelease.held, true);
    assert.equal(beforeRelease.wallTimerDelivered, true);
    assert.ok(beforeRelease.heldCallbacks > 0);
    assert.deepEqual([beforeRelease.width, beforeRelease.height], [450, 800]);
    assert.ok(beforeRelease.resizes.some(size => size.width === 450 && size.height === 800));
    assert.equal(beforeClose.orientation, 'portrait');
  } catch (error) {
    console.error('controlled rotation frames: ' + JSON.stringify({beforeRelease, beforeClose, controllerError: String(controllerError ?? '')}));
    throw error;
  } finally { await browser.close(); await release; }
});
