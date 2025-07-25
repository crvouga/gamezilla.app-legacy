import { Sub } from '../sub'
import { IKeyBoard, KeyboardKey } from './interface'

export type Config = {
  t: 'noop'
}

const keyUps = Sub.init<KeyboardKey>()
const keyDowns = Sub.init<KeyboardKey>()

export const KeyBoard = (_config: Config): IKeyBoard => {
  return {
    keyDowns: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyDowns, callback),
    keyUps: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyUps, callback),
  }
}
