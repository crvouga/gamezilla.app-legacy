import { KeyboardImplNoop } from './impl-noop'
import { ImplWebStandard } from './impl-web-standard'
import { IKeyBoard } from './interface'

export type KeyBoard = ImplWebStandard | KeyboardImplNoop

const init = (config: KeyBoard): IKeyBoard => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'noop':
      return KeyboardImplNoop.init(config)
  }
}

export const KeyBoard = {
  init,
}
