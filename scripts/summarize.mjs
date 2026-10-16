import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = JSON.parse(fs.readFileSync(path.join(root, 'evidence/chrome-acceptance.json')));
const edge = JSON.parse(fs.readFileSync(path.join(root, 'evidence/edge-acceptance.json')));
const soak = JSON.parse(fs.readFileSync(path.join(root, 'evidence/lifecycle-soak.json')));
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const f = value => Number(value).toFixed(1);
const summary = { chromeChecks: chrome.checks.length, edgeChecks: edge.checks.length, checksPassed: [...chrome.checks, ...edge.checks].every(x => x.pass), scrollEventMs: chrome.scrollLatencyMs, rows: [], lifecycle: soak.samples.map(x => ({ cycles: x.cycles, heapBytes: x.heap.usedSize, ...x.dom })) };
let md = '| 数据总量 | 创建行数 | ready标记 ms | open→rAF ms | 图片/字体+双rAF ms | FCP ms | 同步render函数 ms | 同步update ms | 领取→rAF ms |\n|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for (const count of [30, 300, 3000]) {
  const samples = chrome.perf.filter(x => x.count === count);
  const row = { count, nodes: median(samples.map(x => x.inspect.rowNodes)), ...Object.fromEntries(['readyMs', 'firstOpenMs', 'assetsAndTwoFramesMs', 'firstRenderMs', 'updateRenderMs', 'claimToNextFrameMs'].map(key => [key, median(samples.map(x => x[key]))])), fcpMs: median(samples.map(x => x.paints.find(p => p.name === 'first-contentful-paint').ms)) };
  summary.rows.push(row);
  md += `| ${count} | ${row.nodes} | ${f(row.readyMs)} | ${f(row.firstOpenMs)} | ${f(row.assetsAndTwoFramesMs)} | ${f(row.fcpMs)} | ${f(row.firstRenderMs)} | ${f(row.updateRenderMs)} | ${f(row.claimToNextFrameMs)} |\n`;
}
md += `\n表为Chrome每档3次样本中位数。实际滚轮→框架scroll事件单次 ${f(chrome.scrollLatencyMs[0])} ms，不是屏幕呈现延迟。\n\n`;
md += '| API开关次数 | GC后JS heap bytes | CDP节点数 | CDP监听数 |\n|---:|---:|---:|---:|\n';
for (const x of summary.lifecycle) md += `| ${x.cycles} | ${x.heapBytes} | ${x.nodes} | ${x.jsEventListeners} |\n`;
fs.writeFileSync(path.join(root, 'evidence/performance-summary.md'), md);
fs.writeFileSync(path.join(root, 'evidence/summary.json'), JSON.stringify(summary, null, 2));
const reportPath = path.join(root, '报告.md');
const report = fs.readFileSync(reportPath, 'utf8').replace(/<!-- measurements:start -->[\s\S]*?<!-- measurements:end -->/, `<!-- measurements:start -->\n${md}\n<!-- measurements:end -->`).replaceAll('research/toolchain/报告.md', 'research/toolchain/结论与证据.md');
fs.writeFileSync(reportPath, report);
console.log(JSON.stringify({ chrome: summary.chromeChecks, edge: summary.edgeChecks, pass: summary.checksPassed, perfSamples: chrome.perf.length }));
