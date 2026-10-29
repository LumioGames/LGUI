// 按当前语言格式化数字、日期、货币。
import {todo} from './todo';

export const format = {
  /** 数字，带千分位。 */
  number(value: number): string { void value; return todo('format.number'); },
  /** 日期。 */
  date(value: number | Date): string { void value; return todo('format.date'); },
  /** 货币。 */
  currency(value: number, currency: string): string { void value; void currency; return todo('format.currency'); }
};
