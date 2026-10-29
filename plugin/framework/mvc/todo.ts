// 框架里还没实现的部分：一调用就报 LGUI-RT-001，不悄悄兜底。实现完成后删掉对应的调用。
import {LgRuntimeError} from '../core/index';

export function todo(feature: string): never {
  throw new LgRuntimeError('LGUI-RT-001', `框架还没实现「${feature}」。`, '这是开发中的功能，等待新版本，或者先不用它。');
}
