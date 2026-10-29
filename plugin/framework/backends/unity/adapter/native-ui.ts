// FairyGUI-unity 8cc8f2 的 C# 边界。仅后端引用；游戏代码不接触引擎对象。
export interface NativeColor {r: number; g: number; b: number; a: number}
export interface NativeVector2 {x: number; y: number}
export interface NativeInputEvent {
  x: number; y: number; touchId: number; button: number;
  keyCode: number; character: string | number; mouseWheelDelta: number;
}
export interface NativeEventContext {
  inputEvent: NativeInputEvent | null;
  data: unknown;
  CaptureTouch(): void;
}
export type NativeEventHandler = (event: NativeEventContext) => void;
export interface NativeEventListener {
  Add(handler: NativeEventHandler): void;
  Remove(handler: NativeEventHandler): void;
  AddCapture(handler: NativeEventHandler): void;
  RemoveCapture(handler: NativeEventHandler): void;
}
export interface NativePackageItem {
  name: string; owner: {name: string}; width: number; height: number;
  /** FairyGUI.PackageItemType。 */
  type: number;
}
export interface NativeObject {
  name: string; visible: boolean; enabled: boolean; grayed: boolean; touchable: boolean;
  x: number; y: number; width: number; height: number;
  data: unknown;
  readonly parent: NativeComponent | null;
  readonly packageItem: NativePackageItem | null;
  readonly onTouchBegin: NativeEventListener;
  readonly onTouchMove: NativeEventListener;
  readonly onTouchEnd: NativeEventListener;
  SetXY(x: number, y: number): void;
  SetSize(width: number, height: number): void;
  Dispose(): void;
}
export interface NativeComponent extends NativeObject {
  readonly numChildren: number;
  GetChild(name: string): NativeObject | null;
  GetChildAt(index: number): NativeObject;
  GetChildIndex(child: NativeObject): number;
  GetController(name: string): NativeController | null;
  GetTransition(name: string): NativeTransition | null;
  AddChild(child: NativeObject): NativeObject;
  RemoveChild(child: NativeObject): NativeObject;
}
export interface NativeText extends NativeObject {text: string; color: NativeColor}
export interface NativeTextInput extends NativeText {promptText: string; readonly onChanged: NativeEventListener}
export interface NativeButton extends NativeComponent {title: string; icon: string; selected: boolean}
export interface NativeImage extends NativeObject {
  fillMethod: number; fillOrigin: number; fillClockwise: boolean; fillAmount: number;
}
/** LGUIResourceLoader 继承原生 GLoader；两种完成事件由 LGUI 的 C# 衔接类提供。 */
export interface NativeLoader extends NativeObject {
  url: string;
  readonly texture: unknown | null;
  readonly component: NativeComponent | null;
  readonly onLoaded: NativeEventListener;
  readonly onLoadError: NativeEventListener;
}
export interface NativeScrollPane {
  readonly posX: number; readonly posY: number;
  SetPosX(value: number, animate: boolean): void;
  SetPosY(value: number, animate: boolean): void;
}
export interface NativeList extends NativeComponent {
  numItems: number;
  itemRenderer: ((index: number, item: NativeObject) => void) | null;
  selectedIndex: number;
  readonly scrollPane: NativeScrollPane | null;
  readonly onClickItem: NativeEventListener;
  SetVirtual(): void;
  ChildIndexToItemIndex(index: number): number;
  ItemIndexToChildIndex(index: number): number;
  ScrollToView(index: number, animate: boolean): void;
}
export interface NativeProgress extends NativeComponent {value: number; max: number}
export interface NativeGraph extends NativeObject {color: NativeColor}
export interface NativeController {
  readonly name: string; selectedPage: string; readonly pageCount: number;
  readonly onChanged: NativeEventListener;
  GetPageName(index: number): string;
}
export interface NativeTransition {
  readonly name: string;
  Play(times: number, delay: number, complete: () => void): void;
  Stop(setToComplete: boolean, processCallback: boolean): void;
  SetPaused(paused: boolean): void;
}
export interface NativeFairyGUI {
  GComponent: new () => NativeComponent;
  GTextField: new () => NativeText;
  GTextInput: new () => NativeTextInput;
  GButton: new () => NativeButton;
  GImage: new () => NativeImage;
  GLoader: new () => NativeLoader;
  GList: new () => NativeList;
  GProgressBar: new () => NativeProgress;
  GGraph: new () => NativeGraph;
  Utils: {ToolSet: {ConvertFromHtmlColor(value: string): NativeColor}};
  Stage: {touchScreen: boolean};
  UIPackage: {GetItemByURL(url: string): NativePackageItem | null};
}
