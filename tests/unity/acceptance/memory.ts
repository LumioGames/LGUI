import {lgui, LgRuntimeError} from 'lgui';
import type {Snapshot, TestHarness} from 'lgui';
import {BagView} from '../../../examples/inventory/src/modules/bag/BagView';
import {bagFxModel} from '../../../examples/inventory/src/modules/bag/BagFxModel';

export interface ArtTextCycleOptions {
  cycles?: number;
  /** Real Native / V8 / process measurements are supplied by the host. */
  sample(cycle: number): Promise<unknown>;
}

interface LogicalRelease {
  layers: Snapshot['layers'];
  active: string | null;
  views: Snapshot['views'];
  packages: Snapshot['packages'];
}

const logicalRelease = (t: TestHarness): LogicalRelease => {
  const snapshot = t.snapshot();
  return {layers: snapshot.layers, active: snapshot.active,
    views: snapshot.views.map(view => ({...view})).sort((a, b) => a.name.localeCompare(b.name)),
    packages: snapshot.packages.map(pkg => ({...pkg})).sort((a, b) => a.name.localeCompare(b.name))};
};

/** Exercise real ArtText replacement and disposal without retaining glyph/View objects. */
export async function runArtTextCycles(t: TestHarness, {cycles = 200, sample}: ArtTextCycleOptions): Promise<object> {
  let phase = 'prepare';
  let currentCycle = 0;
  const fail = (message: string): never => {
    throw new LgRuntimeError('LGUI-RT-001', `S3-04 ArtText memory / ${phase} / cycle ${currentCycle}: ${message}`,
      '保留真实 Player 日志和采样结果；不能用逻辑释放代替 Native、V8 或进程内存测量。');
  };
  const check = (condition: boolean, message: string): void => { if (!condition) fail(message); };
  const wait = async (label: string, condition: () => boolean): Promise<void> => {
    const started = lgui.time.now();
    while (!condition()) {
      if (lgui.time.now() - started >= 10000) fail(`等待 ${label} 超过 10 秒。`);
      await t.advance(16);
    }
  };
  const closeBag = async (): Promise<void> => {
    if (lgui.ui.isOpen(BagView)) {
      check(t.snapshot().active === 'BagView', '关闭前背包必须是激活界面。');
      await t.click('Bag/BagPanel.closeButton');
    }
    await wait('背包关闭', () => !lgui.ui.isOpen(BagView));
    // The caller's real sim advances at least one frame before any measurement.
    await t.advance(16);
  };
  const changeText = async (delta: number | null, expected: string): Promise<void> => {
    if (delta === null) bagFxModel.hide(); else bagFxModel.show(delta);
    await t.advance(16);
    check(t.text('Bag/BagPanel.coinFx') === expected, `ArtText 应显示 ${JSON.stringify(expected)}，实际 ${JSON.stringify(t.text('Bag/BagPanel.coinFx'))}。`);
    check(t.visible('Bag/BagPanel.coinFx') === (expected !== ''), 'ArtText 可见性与文字不一致。');
  };
  const cycle = async (): Promise<void> => {
    await t.open(BagView);
    await wait('真实 BagView 激活', () => lgui.ui.isOpen(BagView) && t.snapshot().active === 'BagView');
    await changeText(120, '+120');
    await changeText(9, '+9');
    await changeText(80, '+80');
    await changeText(null, '');
    await closeBag();
  };
  const samples: {cycle: number; measurement: unknown; logicalRelease: LogicalRelease}[] = [];
  let exactBaselineReturns = 0;
  let completedHudCountdownReturns = 0;

  try {
    check(Number.isSafeInteger(cycles) && cycles >= 0, 'cycles 必须是非负安全整数。');
    check(typeof sample === 'function', '必须注入真实内存采样回调 sample。');
    await closeBag();
    await wait('短提示关闭', () => t.snapshot().layers.toast.length === 0);
    const initial = t.snapshot();
    check(JSON.stringify(initial.layers.page) === JSON.stringify(['MainView'])
      && JSON.stringify(initial.layers.hud) === JSON.stringify(['HudView'])
      && initial.layers.popup.length === 0 && initial.layers.modal.length === 0,
    '只允许 MainView / HudView 合法常驻，不能带其他界面进入循环。');
    bagFxModel.hide();
    phase = 'warmup';
    await cycle();
    const baseline = logicalRelease(t);
    const baselineHud = baseline.views.find(view => view.name === 'HudView');
    const compareRelease = (actual: LogicalRelease): void => {
      if (JSON.stringify(actual) === JSON.stringify(baseline)) { exactBaselineReturns++; return; }
      // A real ten-minute HUD countdown may finish during a slow measurement.
      // Accept only that observed completion, never extra timers/listeners/refs.
      const hud = actual.views.find(view => view.name === 'HudView');
      const completed = baselineHud?.timers === 1 && hud?.timers === 0
        && t.text('Main/Hud.eventText') === lgui.t('hud.eventOver');
      if (completed) {
        const normalized = {...actual, views: actual.views.map(view => view.name === 'HudView' ? {...view, timers: 1} : view)};
        if (JSON.stringify(normalized) === JSON.stringify(baseline)) { completedHudCountdownReturns++; return; }
      }
      fail(`关闭后逻辑资源没有回暖机基线：${JSON.stringify({baseline, actual})}`);
    };
    const takeSample = async (cycleNumber: number, release: LogicalRelease): Promise<void> => {
      phase = 'host memory sample';
      // Materialize plain JSON once. Do not retain a host/Native proxy returned
      // by an instrumentation callback in the long-lived result object.
      const encoded = JSON.stringify(await sample(cycleNumber));
      check(encoded !== undefined, 'sample 必须返回可记录的 JSON 数据，不能返回 undefined。');
      samples.push({cycle: cycleNumber, measurement: JSON.parse(encoded as string) as unknown, logicalRelease: release});
    };
    await takeSample(0, baseline);
    const sampleAt = new Set([10, 50, 100, 150, 200, cycles]);
    for (currentCycle = 1; currentCycle <= cycles; currentCycle++) {
      phase = 'ArtText replacements / close';
      await cycle();
      const release = logicalRelease(t);
      compareRelease(release);
      if (sampleAt.has(currentCycle)) await takeSample(currentCycle, release);
    }
    phase = 'complete';
    return {cycles, textChanges: cycles * 4, warmupCycles: 1, warmupTextChanges: 4,
      baseline, finalRelease: logicalRelease(t), logicalReleasesVerified: exactBaselineReturns + completedHudCountdownReturns,
      exactBaselineReturns, completedHudCountdownReturns, samples,
      interpretation: 'Logical cleanup and actual host samples are separate evidence. This function sets no memory threshold and makes no memory pass/fail claim.'};
  } catch (error) {
    if (error instanceof LgRuntimeError && error.code === 'LGUI-RT-001') throw error;
    return fail(error instanceof Error ? error.message : String(error));
  }
}
