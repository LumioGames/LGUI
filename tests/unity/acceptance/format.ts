import {format, lgui, LgRuntimeError} from 'lgui';
import type {TestHarness} from 'lgui';

type Observation = {ok: true; value: string} | {ok: false; error: {name: string; message: string; code: string}};

const observe = (read: () => string): Observation => {
  try { return {ok: true, value: read()}; }
  catch (error) {
    return {ok: false, error: {name: error instanceof Error ? error.name : 'ThrownValue',
      message: error instanceof Error ? error.message : String(error), code: error instanceof LgRuntimeError ? error.code : 'LGUI-RT-001'}};
  }
};

/** Observe the actual public formatter; do not add Intl or normalize its output. */
export async function runFormatProbe(t: TestHarness): Promise<object> {
  const originalLanguage = lgui.language();
  const timestamp = Date.UTC(2026, 0, 2, 3, 4, 5);
  const fixed = new Date(timestamp);
  const intlPresent = typeof Intl !== 'undefined';
  const intlNumberFormat = intlPresent && typeof Intl.NumberFormat === 'function';
  const intlDateTimeFormat = intlPresent && typeof Intl.DateTimeFormat === 'function';
  const timezone = intlDateTimeFormat ? observe(() => Intl.DateTimeFormat().resolvedOptions().timeZone) : null;
  const observations: object[] = [];
  try {
    for (const language of ['zh-CN', 'en']) {
      await t.setLanguage(language);
      observations.push({language: lgui.language(), number: observe(() => format.number(12345.6789)),
        negative: observe(() => format.number(-12345.6789)), zero: observe(() => format.number(0)),
        usd: observe(() => format.currency(123.5, 'USD')), cny: observe(() => format.currency(12, 'CNY')),
        dateFromTimestamp: observe(() => format.date(timestamp)), dateFromObject: observe(() => format.date(fixed))});
    }
    return {input: {number: 12345.6789, usd: 123.5, cny: 12, timestamp, iso: fixed.toISOString()},
      environment: {intlPresent, intlNumberFormat, intlDateTimeFormat, timezone,
        offsetMinutesAtInput: fixed.getTimezoneOffset(), dateStringAtInput: fixed.toString(),
        localParts: {year: fixed.getFullYear(), month: fixed.getMonth() + 1, day: fixed.getDate(), hour: fixed.getHours(), minute: fixed.getMinutes(), second: fixed.getSeconds()}},
      observations, interpretation: 'The fixed instant is UTC. Public format.date uses the host local timezone; these are observed outputs, not normalized UTC output.'};
  } catch (error) {
    throw new LgRuntimeError('LGUI-RT-001', `S3-04 actual format probe: ${error instanceof Error ? error.message : String(error)}`,
      '保留宿主时区、Intl 能力和原始 format 输出，先定位实际差异，不在测试中替换 formatter。');
  } finally {
    await t.setLanguage(originalLanguage);
  }
}
