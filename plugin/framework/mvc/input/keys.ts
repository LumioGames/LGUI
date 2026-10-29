// 按键 → 动作。默认 Escape、Back（安卓返回键）→ back，Enter → confirm；工程配置 keyMap 可以按平台改写。
// 动作只送给激活的界面（UIManager 负责）。

export const defaultKeyMap: Readonly<Record<string, string>> = {Escape: 'back', Back: 'back', Enter: 'confirm'};

/** 按键名 → 动作名；没有映射时返回 null。platform 是后端名（h5、unity），keyMap 里 default 一组对所有平台生效。 */
export function actionForKey(key: string, platform: string, keyMap: Record<string, Record<string, string>> = {}): string | null {
  return keyMap[platform]?.[key] ?? keyMap.default?.[key] ?? defaultKeyMap[key] ?? null;
}

/** 某个动作在当前平台对应的按键名（给操作提示栏显示，比如 back → Esc）。 */
export function keysForAction(action: string, platform: string, keyMap: Record<string, Record<string, string>> = {}): string[] {
  const merged: Record<string, string> = {...defaultKeyMap, ...keyMap.default, ...keyMap[platform]};
  return Object.entries(merged).filter(([, a]) => a === action).map(([k]) => k);
}
