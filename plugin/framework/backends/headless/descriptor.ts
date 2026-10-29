// lgui 生成的 headless 描述（.lgui/build/headless/<包名>.json）的类型。
import type {UIKind} from '../../core/index';

/** 一个子控件。 */
export interface ChildDescriptor {
  /** 控件名。 */
  name: string;
  /** 控件类型。 */
  kind: UIKind;
  /** 子组件引用的「包/组件」。 */
  ref: string | null;
  /** 列表的子项组件。 */
  defaultItem: string | null;
  /** [x, y, 宽, 高]（设计尺寸）。 */
  rect: [number, number, number, number];
  /** 初始属性。 */
  props: {visible: boolean; enabled: boolean; touchable: boolean; customData?: string; text?: string; promptText?: string; url?: string; title?: string; icon?: string; selected?: boolean; value?: number; max?: number; color?: string};
}

/** 一个组件。 */
export interface ComponentDescriptor {
  /** 「包/组件」。 */
  name: string;
  /** 资源 ID。 */
  id: string;
  /** 是否导出。 */
  exported: boolean;
  /** 扩展类型（Button、ProgressBar 等）。 */
  extension: string | null;
  /** [宽, 高]。 */
  size: [number, number];
  /** 控制器。 */
  controllers: {name: string; pages: string[]; selected: string | null}[];
  /** 动效名。 */
  transitions: string[];
  /** 子控件。 */
  children: ChildDescriptor[];
}

/** 一个包。 */
export interface PackageDescriptor {
  /** 格式版本。 */
  schemaVersion: 1;
  /** 包名。 */
  package: string;
  /** 包 ID。 */
  id: string;
  /** 组件。 */
  components: ComponentDescriptor[];
  /** 图片：名字和尺寸（ArtText 拼字时要用）。 */
  images: {name: string; width: number; height: number}[];
}
