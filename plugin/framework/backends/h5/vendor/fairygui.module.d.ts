// fairygui.module.js 里 h5 后端用到的那一部分的类型声明（上游没有附带声明文件）。

export interface FguiEvent {
  /** 事件附带的数据（比如 click_item 是被点的那一项）。 */
  data: unknown;
}

export type FguiListener = (event: FguiEvent) => void;

export class EventDispatcher {
  on(type: string, callback: FguiListener, target?: unknown, capture?: boolean): void;
  off(type: string, callback: FguiListener, target?: unknown, capture?: boolean): void;
}

export class GObject extends EventDispatcher {
  name: string;
  visible: boolean;
  touchable: boolean;
  grayed: boolean;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  data: unknown;
  readonly parent: GComponent | null;
  readonly packageItem: PackageItem | null;
  readonly element: HTMLElement;
  setPosition(x: number, y: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
  removeFromParent(): void;
}

export class GComponent extends GObject {
  readonly numChildren: number;
  getChild(name: string): GObject | null;
  getChildAt(index: number): GObject;
  getController(name: string): Controller | null;
  getTransition(name: string): Transition | null;
  addChild(child: GObject): GObject;
  removeChild(child: GObject, dispose?: boolean): GObject;
}

export class GRoot extends GComponent {
  static readonly inst: GRoot;
}

export class GTextField extends GObject {
  text: string;
  color: number;
}

export class GRichTextField extends GTextField {}

export class GTextInput extends GTextField {
  setPromptText(value: string): void;
}

export class GButton extends GComponent {
  title: string;
  icon: string;
  selected: boolean;
}

export class GImage extends GObject {
  fillMethod: number;
  fillOrigin: number;
  fillClockwise: boolean;
  fillAmount: number;
  color: number;
}

export class GLoader extends GObject {
  url: string;
  fillMethod: number;
  fillOrigin: number;
  fillClockwise: boolean;
  fillAmount: number;
}

export class ScrollPane {
  posX: number;
  posY: number;
  setPosX(value: number, ani?: boolean): void;
  setPosY(value: number, ani?: boolean): void;
}

export class GList extends GComponent {
  numItems: number;
  itemRenderer: ((index: number, item: GObject) => void) | null;
  selectedIndex: number;
  readonly scrollPane: ScrollPane | null;
  setVirtual(): void;
  scrollToView(index: number, ani?: boolean, setFirst?: boolean): void;
  itemIndexToChildIndex(index: number): number;
  childIndexToItemIndex(index: number): number;
}

export class GProgressBar extends GComponent {
  value: number;
  max: number;
}

export class GGraph extends GObject {
  color: number;
}

export class Controller extends EventDispatcher {
  name: string;
  selectedIndex: number;
  selectedPage: string;
  readonly pageCount: number;
  getPageName(index: number): string;
}

export class Transition {
  name: string;
  play(onComplete?: () => void, times?: number, delay?: number): void;
  stop(setToComplete?: boolean, processCallback?: boolean): void;
  setPaused(paused: boolean): void;
}

export class PackageItem {
  id: string;
  name: string;
  owner: UIPackage;
  type: number;
  file: string;
}

export class UIPackage {
  readonly id: string;
  readonly name: string;
  static loadPackage(url: string): Promise<UIPackage>;
  static removePackage(packageIdOrName: string): void;
  static getByName(name: string): UIPackage | undefined;
  static createObject(pkgName: string, resName: string): GObject | null;
  static setImageManifest(manifest: unknown): void;
  static loadImageManifest(url: string): Promise<void>;
  getItemById(itemId: string): PackageItem | null;
  getItemByName(resName: string): PackageItem | undefined;
}

export class UIConfig {
  static defaultFont: string;
}
