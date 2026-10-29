import {createUnityBackend} from '../../../plugin/framework/backends/unity/adapter/index';
import {setRuntime, defaultConfig} from '../../../plugin/framework/mvc/runtime';
import {Scope} from '../../../plugin/framework/mvc/scope';
import {applyIcon} from '../../../plugin/framework/mvc/binding/icon';
import type {UILoader} from '../../../plugin/framework/core/index';

declare const PROBE_BASE: string;
declare const CS: {
  LGUI: {Tests: {ConformanceBridge: {Complete(result: string): void}; ImageProbeMetrics: {TextureCount(): number; Alive(loader: unknown): boolean; SameTexture(a: unknown, b: unknown): boolean}}};
};

const globals = globalThis as unknown as {__lguiStart?: () => Promise<void>; __lguiDispose?: () => void};
globals.__lguiStart = async () => {
  const report: Record<string, unknown> = {probe: 'real MVC icon binding + real Unity GLoader', base: PROBE_BASE};
  try {
    const backend = createUnityBackend();
    await backend.init({projectName: 'remote-review', defaultFont: null, uiBase: 'UI'});
    await backend.loadPackage('Common');
    setRuntime(backend, defaultConfig);
    const logs: {level: string; message: string}[] = [];
    // Only the deliberately missing image's expected error is collected without forwarding.
    // Every other log still reaches Unity and the strict development harness.
    const nativeWrite = backend.platform.log.write.bind(backend.platform.log);
    backend.platform.log.write = (level, message) => {
      logs.push({level, message});
      if (level === 'error' && message.includes('LGUI-RT-070') && message.includes(PROBE_BASE + '/missing.png')) return;
      nativeWrite(level, message);
    };
    const wait = (ms: number): Promise<void> => new Promise(resolve => {
      const until = backend.platform.time.now() + ms;
      const off = backend.platform.time.onFrame(() => { if (backend.platform.time.now() >= until) { off(); resolve(); } });
    });
    const fixture = () => {
      const holder = backend.createContainer('remote-review'); backend.root.addChild(holder);
      const loader = backend.createImage('ui://Common/placeholder') as UILoader;
      holder.addChild(loader); loader.rect = {x: 20, y: 20, width: 100, height: 100};
      const scope = new Scope();
      const ctx = {owner: {}, scope, isActive: () => true, where: 'RemoteImageProbe.icon'};
      const native = (loader as unknown as {native: {texture: unknown; isDisposed: boolean}}).native;
      return {holder, loader, scope, ctx, native};
    };
    const warmup = fixture(); warmup.scope.dispose(); warmup.holder.dispose();
    await wait(150);
    const baselineTextures = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();
    const target = fixture();
    const placeholderTexture = target.native.texture;
    const url = PROBE_BASE + '/one-shot.png';
    let blankFramesAfterAssignment = 0;
    const offObserve = backend.platform.time.onFrame(() => { if (target.loader.url === url && target.native.texture == null) blankFramesAfterAssignment++; });
    applyIcon(target.loader, url, undefined, target.ctx);
    await wait(100);
    report.placeholderWhileDownloading = target.loader.url === 'ui://Common/placeholder' && target.native.texture === placeholderTexture;
    await wait(900);
    offObserve();
    report.targetUrl = target.loader.url;
    report.targetTexturePresent = CS.LGUI.Tests.ImageProbeMetrics.Alive(target.native);
    report.blankFramesAfterAssignment = blankFramesAfterAssignment;
    report.oneShotLogs = [...logs];
    const stats = await backend.platform.net.fetch(PROBE_BASE + '/stats');
    report.afterOneShotServer = await stats.json();
    target.scope.dispose(); target.holder.dispose();
    await wait(150);
    report.texturesAfterTargetClosed = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();

    const beforeConcurrent = await (await backend.platform.net.fetch(PROBE_BASE + '/stats')).json() as {counts: Record<string, number>};
    const first = fixture(), second = fixture(); const sameUrl = PROBE_BASE + '/slow.png?case=concurrent';
    applyIcon(first.loader, sameUrl, undefined, first.ctx); applyIcon(second.loader, sameUrl, undefined, second.ctx);
    await wait(900);
    const afterConcurrent = await (await backend.platform.net.fetch(PROBE_BASE + '/stats')).json() as {counts: Record<string, number>};
    report.concurrentRequests = (afterConcurrent.counts['/slow.png'] ?? 0) - (beforeConcurrent.counts['/slow.png'] ?? 0);
    report.concurrentShareTexture = CS.LGUI.Tests.ImageProbeMetrics.SameTexture(first.native, second.native);
    first.scope.dispose(); first.holder.dispose(); await wait(100);
    report.secondAliveAfterFirstCloses = CS.LGUI.Tests.ImageProbeMetrics.Alive(second.native);
    second.scope.dispose(); second.holder.dispose(); await wait(150);
    report.texturesAfterBothClose = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();

    const missing = fixture(); const missingPlaceholder = missing.native.texture;
    applyIcon(missing.loader, PROBE_BASE + '/missing.png', undefined, missing.ctx);
    await wait(250);
    report.initial404KeepsPlaceholder = missing.loader.url === 'ui://Common/placeholder' && missing.native.texture === missingPlaceholder;
    report.initial404Reported070 = logs.some(log => log.message.includes('LGUI-RT-070') && log.message.includes('/missing.png'));
    missing.scope.dispose(); missing.holder.dispose();

    const closed = fixture();
    applyIcon(closed.loader, PROBE_BASE + '/slow.png?case=closed', undefined, closed.ctx);
    await wait(100); closed.scope.dispose(); closed.holder.dispose();
    await wait(700);
    report.closedBeforeDownloadIsDisposed = closed.native.isDisposed;
    report.texturesAfterAbandonedPreload = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();
    report.baselineTextures = baselineTextures;

    const cleared = fixture();
    cleared.loader.url = PROBE_BASE + '/slow.png?case=cleared';
    await wait(100); cleared.loader.url = ''; await wait(700);
    report.clearedUrlStaysEmpty = cleared.loader.url === '' && cleared.native.texture == null;
    cleared.scope.dispose(); cleared.holder.dispose();
    const switched = fixture();
    switched.loader.url = PROBE_BASE + '/slow.png?case=switched';
    await wait(100); switched.loader.url = 'ui://Common/placeholder';
    const switchedPlaceholder = switched.native.texture; await wait(700);
    report.switchedUrlKeepsPlaceholder = switched.loader.url === 'ui://Common/placeholder' && switched.native.texture === switchedPlaceholder;
    switched.scope.dispose(); switched.holder.dispose(); await wait(150);
    report.texturesAfterUrlCancellation = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();

    const http: Record<string, unknown> = {};
    const get = await backend.platform.net.fetch(PROBE_BASE + '/echo');
    http.get = {status: get.status, ok: get.ok, text: await get.text(), json: await get.json()};
    const payload = JSON.stringify({n: 7, name: '背包'});
    const post = await backend.platform.net.fetch(PROBE_BASE + '/echo', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-LGUI-Probe': 'native'}, body: payload});
    http.post = {status: post.status, ok: post.ok, text: await post.text(), json: await post.json(), payload};
    const notFound = await backend.platform.net.fetch(PROBE_BASE + '/missing-native');
    http.notFound = {status: notFound.status, ok: notFound.ok, text: await notFound.text(), json: await notFound.json()};
    try { await backend.platform.net.fetch(PROBE_BASE + '/drop'); http.drop = {rejected: false}; }
    catch (error) { const failure = error as {code?: string; message?: string}; http.drop = {rejected: true, code: failure.code, message: failure.message}; }
    report.nativeHttp = http;

    type RequestRecord = {rawURL: string; started: number; closed?: number; closedBeforeWrite?: boolean; writeStarted?: number; scheduledWrite?: number};
    const requests = async (): Promise<RequestRecord[]> => (await (await backend.platform.net.fetch(PROBE_BASE + '/stats')).json() as {requests: RequestRecord[]}).requests;
    const request = async (rawURL: string): Promise<RequestRecord | undefined> => (await requests()).find(item => item.rawURL === rawURL);
    const until = async (predicate: () => boolean | Promise<boolean>): Promise<void> => {
      const deadline = backend.platform.time.now() + 5000;
      while (!await predicate()) {
        if (backend.platform.time.now() >= deadline) throw new Error('LGUI-RT-001 Native reentrancy probe condition timed out.');
        await wait(0);
      }
    };

    // A ready cache hit calls onLoaded before Load(A) returns. Its callback starts B;
    // closing B must still own B's cancellation handle after the outer A call returns.
    const keeper = fixture(); const readyA = PROBE_BASE + '/reentrant-ready.png';
    let keeperReady = false;
    keeper.loader.onLoad(() => { if (keeper.loader.url === readyA) keeperReady = true; });
    keeper.loader.url = readyA; await until(() => keeperReady);
    const readyVictim = fixture(); const readyBPath = '/reentrant-slow.png?case=ready-B';
    let readyNested = 0;
    readyVictim.loader.onLoad(() => { if (readyVictim.loader.url === readyA) { readyNested++; readyVictim.loader.url = PROBE_BASE + readyBPath; } });
    readyVictim.loader.url = readyA;
    await until(async () => !!await request(readyBPath));
    readyVictim.scope.dispose(); readyVictim.holder.dispose();
    await until(async () => !!(await request(readyBPath))?.closed);
    report.readyReentry = {nested: readyNested, request: await request(readyBPath)};
    keeper.scope.dispose(); keeper.holder.dispose(); await wait(150);

    // Cache failure snapshots its waiters. The first A failure callback starts B on
    // the second loader before that loader's now-stale A failure callback executes.
    const failedFirst = fixture(), failedSecond = fixture();
    const failedA = PROBE_BASE + '/reentrant-fail.png'; const failedBPath = '/reentrant-slow.png?case=failed-B';
    let failureNested = 0;
    failedFirst.loader.onError(url => { if (url === failedA) { failureNested++; failedSecond.loader.url = PROBE_BASE + failedBPath; } });
    failedFirst.loader.url = failedA; failedSecond.loader.url = failedA;
    await until(async () => !!await request(failedBPath));
    failedSecond.scope.dispose(); failedSecond.holder.dispose(); failedFirst.scope.dispose(); failedFirst.holder.dispose();
    await until(async () => !!(await request(failedBPath))?.closed);
    report.failedReentry = {nested: failureNested, request: await request(failedBPath)};
    await wait(150);
    report.texturesAfterReentry = CS.LGUI.Tests.ImageProbeMetrics.TextureCount();

    let shutdownCode = '';
    const pending = backend.platform.resource.loadImage(PROBE_BASE + '/slow.png?case=shutdown').catch(error => { shutdownCode = error.code; });
    globals.__lguiDispose?.(); await pending;
    report.shutdownPendingRejected = shutdownCode === 'LGUI-RT-025';
    report.logs = logs;
  } catch (error) { report.fatal = String(error); }
  CS.LGUI.Tests.ConformanceBridge.Complete(JSON.stringify(report));
};
