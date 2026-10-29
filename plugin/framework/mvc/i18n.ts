// 多语言：文本表、lgui.t、格式化。文本表是 i18n/<语言>.json，扁平的「键 → 文字」；
// 要按数量变化的文字写成按复数形式分开的对象：{"one": "…", "other": "…"}，用参数 count 选。
import {runtime} from './runtime';

/** 一种语言的文本表。 */
export type TextTable = Record<string, string | Partial<Record<PluralForm, string>>>;
/** 复数形式（和 Intl.PluralRules 的名字一致）。 */
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

interface I18nState {
  language: string;
  tables: Record<string, TextTable>;
}

let state: I18nState = {language: 'zh-CN', tables: {}};

/** 内部用：设置全部文本表和当前语言（启动时调用）。 */
export function setTexts(tables: Record<string, TextTable>, language: string): void {
  state = {language, tables};
}

/** 内部用：切换当前语言（S2-F3 的 lgui.setLanguage 在这之上重建界面）。 */
export function setCurrentLanguage(language: string): void { state = {...state, language}; }

/** 当前语言。 */
export function currentLanguage(): string { return state.language; }

/** 启动时选语言：系统语言里第一个工程支持的；都不支持就用默认语言。 */
export function pickLanguage(system: readonly string[], supported: readonly string[], fallback: string): string {
  for (const lang of system) {
    if (supported.includes(lang)) return lang;
    const base = lang.split('-')[0];
    const match = supported.find(s => s === base || s.split('-')[0] === base);
    if (match) return match;
  }
  return fallback;
}

// 没有 Intl.PluralRules 时的内置规则：中文、日文、韩文不分单复数，其余按英文（1 和其他）。
function pluralForm(language: string, count: number): PluralForm {
  const Rules = (globalThis as {Intl?: {PluralRules?: new (lang: string) => {select(n: number): string}}}).Intl?.PluralRules;
  if (Rules) return new Rules(language).select(count) as PluralForm;
  if (/^(zh|ja|ko)\b/.test(language)) return 'other';
  return count === 1 ? 'one' : 'other';
}

const reported = new Set<string>();

/** 取文本，占位符写成 {count}。找不到键时记一条 LGUI-RT-090，显示键名。 */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const table = state.tables[state.language] ?? {};
  let entry = table[key];
  if (entry === undefined) {
    const id = `${state.language}:${key}`;
    if (!reported.has(id)) {
      reported.add(id);
      try { runtime().backend.platform.log.write('error', `LGUI-RT-090  文本表 i18n/${state.language}.json 里没有键 ${key}。  → 在每种语言的文本表里加上它（lgui check 会列出缺的键）。`); } catch { /* 框架没启动时（纯 Model 单测）只返回键名 */ }
    }
    return key;
  }
  if (typeof entry !== 'string') {
    const count = Number(params.count ?? 0);
    entry = entry[pluralForm(state.language, count)] ?? entry.other ?? '';
  }
  return entry.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

type IntlLike = {
  NumberFormat?: new (lang: string, options?: Record<string, unknown>) => {format(n: number): string};
  DateTimeFormat?: new (lang: string, options?: Record<string, unknown>) => {format(d: Date): string};
};
const intl = (): IntlLike | undefined => (globalThis as {Intl?: IntlLike}).Intl;

const groups = (n: number): string => {
  const [int, frac] = Math.abs(n).toString().split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + grouped + (frac ? '.' + frac : '');
};
const pad = (n: number): string => String(n).padStart(2, '0');

/** 按当前语言格式化数字、日期、货币。有 Intl 时用它，没有时用内置实现（千分位、固定的日期格式）。 */
export const format = {
  /** 数字，带千分位。 */
  number(value: number): string {
    const NumberFormat = intl()?.NumberFormat;
    return NumberFormat ? new NumberFormat(state.language).format(value) : groups(value);
  },
  /** 日期（年-月-日 时:分）。参数是毫秒时间戳或 Date。 */
  date(value: number | Date): string {
    const d = typeof value === 'number' ? new Date(value) : value;
    const DateTimeFormat = intl()?.DateTimeFormat;
    if (DateTimeFormat) return new DateTimeFormat(state.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(d);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
  /** 货币，currency 是 ISO 代码（CNY、USD）。 */
  currency(value: number, currency: string): string {
    const NumberFormat = intl()?.NumberFormat;
    return NumberFormat ? new NumberFormat(state.language, {style: 'currency', currency}).format(value) : `${currency} ${groups(Math.round(value * 100) / 100)}`;
  }
};
