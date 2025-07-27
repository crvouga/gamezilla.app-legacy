import { Sub } from '../sub'
import { IKeyBoard, isKeyboardKey, KeyboardKey } from './interface'

export type ImplWebStandard = {
  t: 'web-standard'
}

const keyUps = Sub.init<KeyboardKey>()
const keyDowns = Sub.init<KeyboardKey>()

if (typeof window !== 'undefined') {
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.repeat) return
      if (isKeyboardKey(e.key)) {
        keyDowns.pub(e.key)
      }
    },
    { passive: true },
  )

  document.addEventListener(
    'keyup',
    (e) => {
      if (e.repeat) return
      if (isKeyboardKey(e.key)) {
        keyUps.pub(e.key)
      }
    },
    { passive: true },
  )
}

const init = (_config: ImplWebStandard): IKeyBoard => {
  return {
    keyDowns: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyDowns, callback),
    keyUps: <T>(callback: (key: KeyboardKey) => T): Sub<T> => Sub.map(keyUps, callback),
  }
}

export const ImplWebStandard = {
  init,
}
