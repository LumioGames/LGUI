// 接口层的平台服务：每个后端各实现一份。游戏代码只通过 lgui.platform 用到其中的网络和存储。
import type {PointerInput, Rect, Unsubscribe} from './ui';

/** 时间。 */
export interface TimeService {
  /** 当前时间（毫秒）。单调递增，用于界面计时；测试里是假时钟。 */
  now(): number;
  /** 每帧调用一次，参数是距上一帧的毫秒数。 */
  onFrame(handler: (deltaMs: number) => void): Unsubscribe;
  /** 切到后台（false）或回到前台（true）时调用。 */
  onVisibilityChange(handler: (visible: boolean) => void): Unsubscribe;
}

/** 本地键值存储。H5 用浏览器存储，Unity 用本地文件；键名由后端自动加工程名前缀。 */
export interface StorageService {
  /** 读一个键，不存在返回 null。 */
  get(key: string): string | null;
  /** 写一个键。 */
  set(key: string, value: string): void;
  /** 删除一个键。 */
  remove(key: string): void;
}

/** 资源：FairyGUI 包和图片。 */
export interface ResourceService {
  /** 加载一个界面包（按包名）。已经加载过就直接完成。 */
  loadPackage(name: string): Promise<void>;
  /** 释放一个界面包。 */
  releasePackage(name: string): void;
  /** 这个包现在是否已加载。 */
  hasPackage(name: string): boolean;
  /** 预先加载一张图片（ui:// 或网络地址）。 */
  loadImage(url: string): Promise<void>;
}

/** 一次键盘事件。key 是统一后的按键名，比如 Escape、Enter、Back（安卓返回键）、ArrowUp、a。 */
export interface KeyInput {
  /** 按下或抬起。 */
  type: 'down' | 'up';
  /** 统一后的按键名。 */
  key: string;
  /** 是否是按住不放时的重复事件。 */
  repeat: boolean;
}

/** 一次滚轮事件，坐标是设计尺寸里的坐标。 */
export interface WheelInput {
  /** 指针 x。 */
  x: number;
  /** 指针 y。 */
  y: number;
  /** 横向滚动量（像素）。 */
  deltaX: number;
  /** 纵向滚动量（像素）。 */
  deltaY: number;
}

/** 原始输入。手势由框架识别，后端只上报原始事件。 */
export interface InputService {
  /** 整个舞台上的原始指针事件（支持多点）。 */
  onPointer(handler: (event: PointerInput) => void): Unsubscribe;
  /** 键盘事件。 */
  onKey(handler: (event: KeyInput) => void): Unsubscribe;
  /** 滚轮事件。 */
  onWheel(handler: (event: WheelInput) => void): Unsubscribe;
  /** 告诉游戏场景现在谁接收输入（UIManager 在激活的界面变化时调用）。 */
  setInputMode(mode: 'ui' | 'game' | 'all'): void;
}

/** 文字输入和输入法。 */
export interface TextInputService {
  /** 是否正在用输入法组字（组字期间不要把按键当成动作）。 */
  isComposing(): boolean;
}

/** 屏幕四边的安全区内边距（设计尺寸）。 */
export interface Insets {
  /** 上。 */
  top: number;
  /** 右。 */
  right: number;
  /** 下。 */
  bottom: number;
  /** 左。 */
  left: number;
}

/** 屏幕。 */
export interface ScreenService {
  /** 当前可用区域的尺寸（屏幕像素）。 */
  size(): {width: number; height: number};
  /** 安全区（屏幕像素）。 */
  safeArea(): Insets;
  /** 尺寸或方向变了时调用（不防抖，防抖由框架做）。 */
  onResize(handler: (size: {width: number; height: number}) => void): Unsubscribe;
  /** 内部用：按设计尺寸设置根节点的缩放和偏移，返回设计尺寸里可见的区域。 */
  applyDesignSize(design: {width: number; height: number}): Rect;
}

/** 音频：只放界面音效。 */
export interface AudioService {
  /** 播放一个音效（ui:// 或网络地址）。 */
  play(url: string, options?: {volume?: number}): void;
}

/** 语言。 */
export interface LocaleService {
  /** 系统的语言列表，按优先级排列，比如 ['zh-CN', 'en']。 */
  systemLanguages(): readonly string[];
}

/** 一条日志。 */
export interface LogEntry {
  /** 级别。 */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** 内容。 */
  message: string;
  /** 记录时间（毫秒）。 */
  time: number;
}

/** 统一日志出口。 */
export interface LogService {
  /** 写一条日志。 */
  write(level: LogEntry['level'], message: string): void;
  /** 最近的日志（最多 200 条），给调试面板和测试用。 */
  recent(): readonly LogEntry[];
}

/** 网络响应。 */
export interface NetResponse {
  /** HTTP 状态码。 */
  status: number;
  /** 状态码是否在 200–299。 */
  ok: boolean;
  /** 读成文字。 */
  text(): Promise<string>;
  /** 读成 JSON。 */
  json(): Promise<unknown>;
}

/** 一条 WebSocket 连接。 */
export interface NetSocket {
  /** 发送文字消息。 */
  send(data: string): void;
  /** 关闭连接。 */
  close(): void;
  /** 收到消息时调用。 */
  onMessage(handler: (data: string) => void): Unsubscribe;
  /** 连接断开时调用。 */
  onClose(handler: (code: number) => void): Unsubscribe;
  /** 连接成功时调用。 */
  onOpen(handler: () => void): Unsubscribe;
}

/** 网络：只提供原始能力，给游戏自己的 Service 用，界面层不直接用。 */
export interface NetService {
  /** 发一个 HTTP 请求。 */
  fetch(url: string, init?: {method?: string; headers?: Record<string, string>; body?: string}): Promise<NetResponse>;
  /** 打开一条 WebSocket 连接。 */
  webSocket(url: string): NetSocket;
}

/** 平台服务全集。 */
export interface Platform {
  /** 时间。 */
  time: TimeService;
  /** 存储。 */
  storage: StorageService;
  /** 资源。 */
  resource: ResourceService;
  /** 原始输入。 */
  input: InputService;
  /** 文字输入。 */
  textInput: TextInputService;
  /** 屏幕。 */
  screen: ScreenService;
  /** 音频。 */
  audio: AudioService;
  /** 语言。 */
  locale: LocaleService;
  /** 日志。 */
  log: LogService;
  /** 网络。 */
  net: NetService;
}
