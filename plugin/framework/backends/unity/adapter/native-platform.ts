// PuerTS 暴露的 LGUI C# 服务；这里只描述本适配器实际调用的原生 API。
import type {NativeComponent, NativeEventContext, NativeFairyGUI, NativeLoader, NativeObject} from './native-ui';
import type {PointerInput} from '../../../core/index';

export interface NativePlatformHost {
  readonly Now: number;
  readonly ScreenWidth: number;
  readonly ScreenHeight: number;
  readonly SafeAreaTop: number;
  readonly SafeAreaRight: number;
  readonly SafeAreaBottom: number;
  readonly SafeAreaLeft: number;
  readonly IsComposing: boolean;
  readonly SystemLanguage: string;
  readonly InputMode: string;
  readonly WheelDeltaX: number;
  StorageGet(project: string, key: string): string | null;
  StorageSet(project: string, key: string, value: string): void;
  StorageRemove(project: string, key: string): void;
  LoadText(resourcePath: string): string;
  SetInputMode(mode: string): void;
  Log(level: string, message: string): void;
  PlayAudio(url: string, volume: number): void;
  Fetch(url: string, method: string, headersJson: string, body: string, complete: (responseJson: string) => void): void;
}

export interface NativeDisplayObject {
  readonly gOwner: NativeObject | null;
  readonly parent: NativeDisplayObject | null;
}

export interface NativeStage {
  readonly touchTarget: NativeDisplayObject | null;
  AddCapture(type: string, callback: (context: NativeEventContext) => void): void;
  RemoveCapture(type: string, callback: (context: NativeEventContext) => void): void;
}

export interface NativeRoot extends NativeComponent {
  SetContentScaleFactor(scale: number): void;
}

export interface NativePackageItem {
  readonly width: number;
  readonly height: number;
}

export interface NativePackage {
  GetItemByName(name: string): NativePackageItem | null;
}

export type NativePlatformApi = NativeFairyGUI & {
  Stage: {readonly touchScreen: boolean; readonly inst: NativeStage};
  GRoot: {readonly inst: NativeRoot};
  UIPackage: {
    GetByName(name: string): NativePackage | null;
    AddPackage(path: string): NativePackage | null;
    RemovePackage(name: string): void;
    GetItemAssetByURL(url: string): unknown | null;
  };
};

export interface UnityPlatformOptions {
  projectName: string;
  uiBase: string;
  host: NativePlatformHost;
  fgui: NativePlatformApi;
  objects: {
    toPointerInput(type: PointerInput['type'], context: NativeEventContext): PointerInput;
    dispatchHover(target: NativeObject | null, context: NativeEventContext): void;
  };
  createLoader(): NativeLoader;
  scale: {value: number};
}
