import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {esbuild} from '../../../plugin/tools/lib/vendor.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));

/** Prepare only this development probe in an existing Unity project with the native test bridge and Common package. */
export async function prepareRemoteImageProbe({project, evidenceDir, baseURL}) {
  project = path.resolve(project); evidenceDir = path.resolve(evidenceDir);
  const base = new URL(baseURL);
  if (base.protocol !== 'http:' || base.hostname !== '127.0.0.1') throw new Error('LGUI-RT-001 Remote image verification requires its local HTTP fixture.');
  if (!fs.existsSync(path.join(project, 'Packages/manifest.json')) || !fs.existsSync(path.join(project, 'Assets'))) throw new Error('LGUI-RT-001 Select an existing development Unity project.');
  const output = path.join(project, 'Assets/LGUI/Resources/Game/game.js.txt');
  fs.mkdirSync(path.dirname(output), {recursive: true}); fs.mkdirSync(evidenceDir, {recursive: true});
  await esbuild().build({entryPoints: [path.join(here, 'probe.ts')], outfile: output,
    bundle: true, format: 'iife', target: 'es2020', platform: 'neutral', keepNames: true, logLevel: 'silent', define: {PROBE_BASE: JSON.stringify(base.origin)}});
  fs.copyFileSync(path.join(here, 'ImageProbeMetrics.cs'), path.join(project, 'Assets/ImageProbeMetrics.cs'));
  return {project, base: base.origin, result: path.join(evidenceDir, 'result.json'), log: path.join(evidenceDir, 'unity.log')};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => process.argv[process.argv.indexOf(name) + 1];
  for (const name of ['--project', '--evidence', '--base-url']) if (!process.argv.includes(name) || !argument(name)) throw new Error(`LGUI-RT-001 Missing ${name}.`);
  console.log(JSON.stringify(await prepareRemoteImageProbe({project: argument('--project'), evidenceDir: argument('--evidence'), baseURL: argument('--base-url')})));
}
