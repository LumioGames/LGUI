// 照抄 zustand 5.0.16 的 esm/vanilla.mjs（逻辑一字不改），只把类型收窄成 LGUI 用到的部分。
//
// MIT License
//
// Copyright (c) 2019 Paul Henschel
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;

export interface StoreApi<T> {
  setState: SetState<T>;
  getState: () => T;
  getInitialState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

export type StateCreator<T> = (setState: SetState<T>, getState: () => T, store: StoreApi<T>) => T;

const createStoreImpl = <T>(createState: StateCreator<T>): StoreApi<T> => {
  let state: T;
  const listeners = /* @__PURE__ */ new Set<(state: T, prevState: T) => void>();
  const setState: SetState<T> = (partial, replace) => {
    const nextState = typeof partial === "function" ? (partial as (state: T) => T | Partial<T>)(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = ((replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState)) as T;
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener: (state: T, prevState: T) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api: StoreApi<T> = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};

export const createStore = <T>(createState: StateCreator<T>): StoreApi<T> => createStoreImpl(createState);
