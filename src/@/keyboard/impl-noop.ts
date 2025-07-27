import { Sub } from '../sub'
import { IKeyBoard, KeyboardKey } from './interface'

export type KeyboardImplNoop = {
  t: 'noop'
}

const keyUps = Sub.init<KeyboardKey>()
const keyDowns = Sub.init<KeyboardKey>()

const init = (_config: KeyboardImplNoop): IKeyBoard => {
  return {
    keyDowns: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyDowns, callback),
    keyUps: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyUps, callback),
  }
}

export const KeyboardImplNoop = {
  init,
}
