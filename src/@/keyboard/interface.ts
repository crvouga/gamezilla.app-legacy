import { Sub } from '../sub'

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft'

const arrowKeys: { [key in ArrowKey]: ArrowKey } = {
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
}

export const isArrowKey = (key: unknown): key is ArrowKey => {
  return typeof key === 'string' && key in arrowKeys
}

export type EnterKey = 'Enter'

export const isEnterKey = (key: unknown): key is EnterKey => {
  return typeof key === 'string' && key === 'Enter'
}

export type SpaceKey = 'Space'

export type WASD = 'w' | 'a' | 's' | 'd' | 'W' | 'A' | 'S' | 'D'

export type KeyboardKey = WASD | SpaceKey | ArrowKey | EnterKey

const keys: { [key in KeyboardKey]: KeyboardKey } = {
  //
  w: 'w',
  a: 'a',
  s: 's',
  d: 'd',
  //
  W: 'W',
  A: 'A',
  S: 'S',
  D: 'D',
  //
  Space: 'Space',
  //
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  //
  Enter: 'Enter',
}

export const isKeyboardKey = (key: unknown): key is KeyboardKey => {
  return typeof key === 'string' && key in keys
}

export type IKeyBoard = {
  keyDowns: <T>(callback: (key: KeyboardKey) => T) => Sub<T>
  keyUps: <T>(callback: (key: KeyboardKey) => T) => Sub<T>
}
