// 根节点缩放：保证整个设计区域完整显示，多出来的空间交给关联（FairyGUI-dom 自己没有整体缩放）。
import type {Rect} from '../../core/index';

/** 当前的缩放比，指针坐标换算成设计尺寸时用。 */
export const stage = {scale: 1};

/** 屏幕尺寸 + 设计尺寸 → 缩放比和设计尺寸下的可见区域。 */
export function fitDesign(screen: {width: number; height: number}, design: {width: number; height: number}): {scale: number; visible: Rect} {
  const scale = Math.min(screen.width / design.width, screen.height / design.height);
  return {scale, visible: {x: 0, y: 0, width: screen.width / scale, height: screen.height / scale}};
}

/** 屏幕坐标（clientX/Y）→ 设计尺寸里的坐标。根节点贴在页面左上角。 */
export function toDesign(clientX: number, clientY: number): {x: number; y: number} {
  return {x: clientX / stage.scale, y: clientY / stage.scale};
}
