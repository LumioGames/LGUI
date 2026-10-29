// 一致性测试：用例跑完后取一份状态快照（数据 + 控件属性 + 界面栈），headless 和 h5 各取一份来比。
// 这个文件和 cases/ 一起复制进测试工程的 conformance/ 目录，两个后端打包的是同一份代码。
import type { TestHarness } from 'lgui';

/** 测试工程里每个组件要读的控件（由运行器按 headless 描述生成）。 */
export interface Layout {
  components: { name: string; controllers: string[]; children: { name: string; kind: string; text: boolean; value: boolean; playing: boolean; itemTexts: string[] }[] }[];
}

/** 一个用例：开始时的屏幕尺寸，以及用 lgui.testing 的操作写成的脚本；返回值算进快照（一般是 Model 的数据）。 */
export interface Case {
  screen: { width: number; height: number };
  run(t: TestHarness): Promise<unknown>;
}

export function capture(t: TestHarness, layout: Layout, data: unknown): unknown {
  const views: Record<string, Record<string, unknown>> = {};
  for (const c of layout.components) {
    try { t.visible(c.name); } catch { continue; } // 没打开
    const controls: Record<string, unknown> = {};
    for (const ch of c.children) {
      const path = `${c.name}.${ch.name}`;
      // visible 是「真的显示」：被齿轮或组藏起来的算不显示（两个后端一样）。
      const state: Record<string, unknown> = { visible: t.visible(path), enabled: t.enabled(path) };
      if (ch.text) state.text = t.text(path);
      if (ch.value) state.value = t.value(path);
      if (ch.playing) state.playing = t.playing(path);
      if (ch.kind === 'list' || ch.kind === 'tree') {
        const n = t.items(path);
        state.items = n;
        state.itemTexts = Array.from({ length: n }, (_, i) => ch.itemTexts.map(name => t.text(`${path}[${i}].${name}`)));
      }
      controls[ch.name] = state;
    }
    for (const name of c.controllers) controls[`controller:${name}`] = t.page(`${c.name}.${name}`);
    views[c.name] = controls;
  }
  return { data, views, snapshot: t.snapshot() };
}
