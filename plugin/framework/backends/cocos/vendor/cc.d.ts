// cc.d.ts —— 引擎类型子集（ambient declare module 'cc'）。
// 只为本仓库的工具链类型检查用；Cocos 工程里有引擎自己的完整声明，
// 用户工程的 tsconfig（include 只有 src/tests/env.d.ts）不包含本文件，不会冲突。

declare module 'cc' {

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 引擎 Color：通道 0–255。 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Asset {
  name: string;
  addRef(): Asset;
  decRef(): Asset;
}

export class AudioClip extends Asset {}
export class Texture2D extends Asset {}
export class ImageAsset extends Asset {}
export class SpriteFrame extends Asset {}
export class BufferAsset extends Asset {}
export class TextAsset extends Asset {
  text: string;
}
export class JsonAsset extends Asset {
  json: unknown;
}

export class Node {
  constructor(name?: string);
  readonly name: string;
  active: boolean;
  readonly activeInHierarchy: boolean;
  readonly parent: Node | null;
  readonly scene: Scene | null;
  addChild(child: Node): Node;
  removeFromParent(): void;
  setPosition(x: number, y: number, z?: number): void;
  setPosition(position: Vec3): void;
  position: Vec3;
  worldPosition: Vec3;
  setScale(x: number, y: number, z?: number): void;
  readonly worldScale: Vec3;
  addComponent<T extends new (...args: never[]) => Component>(type: T): InstanceType<T>;
  getComponent<T extends new (...args: never[]) => Component>(type: T): InstanceType<T> | null;
}

export class Component {
  node: Node;
  /** 每帧调用（组件激活时）。 */
  update?(dt: number): void;
  onLoad?(): void;
  onDestroy?(): void;
}

export class Scene extends Node {}

/** 引擎全局事件（切后台/回前台）。 */
export class Game {
  static EVENT_HIDE: string;
  static EVENT_SHOW: string;
  on(type: string, listener: (error?: unknown) => void): void;
  off(type: string, listener?: (error?: unknown) => void): void;
}

export const game: Game;

export const director: {
  /** 当前场景；启动早期可能为 null。 */
  getScene(): Scene | null;
  /** 第一个场景加载完成后触发（自动启动的锚点）。 */
  once(type: string, listener: (error?: unknown) => void): void;
};

export const Director: {
  EVENT_AFTER_SCENE_LAUNCH: string;
};

export const screen: {
  /** 屏幕尺寸（引擎 UI 像素）。 */
  windowSize: Size;
};

export const view: {
  getVisibleSize(): Size;
  getScaleX(): number;
  getScaleY(): number;
};

export const sys: {
  readonly language: string;
  readonly isNative: boolean;
  localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  /** 屏幕安全区（引擎 UI 像素，原点左下、y 向上）。 */
  getSafeAreaRect(): Rect;
};

export interface BundleLoadOptions {
  /** bundle 失败时的提示。 */
  [key: string]: unknown;
}

export class AssetManagerBundle {
  readonly name: string;
  load(paths: string, type?: unknown, onComplete?: (error: Error | null, asset: Asset | null) => void): void;
  loadDir(dir: string, type?: unknown, onComplete?: (error: Error | null, assets: Asset[]) => void): void;
  releaseAsset(asset: Asset): void;
  releaseAll(): void;
}

export const assetManager: {
  loadBundle(name: string | BundleLoadOptions, onComplete?: (error: Error | null, bundle: AssetManagerBundle) => void): void;
  bundles: Map<string, AssetManagerBundle>;
};

export class AudioSourceComponent extends Component {
  clip: AudioClip | null;
  volume: number;
  loop: boolean;
  playing: boolean;
  play(): void;
  stop(): void;
  /** 放一次音效，返回退出时的播放比例（未用）。 */
  playOneShot(clip: AudioClip, volumeScale?: number): number;
}
}
