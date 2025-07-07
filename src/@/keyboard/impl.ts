import * as ImplNoop from './impl-noop'
import * as ImplWebStandard from './impl-web-standard'
import { IKeyBoard } from './interface'

export type Config = ImplWebStandard.Config | ImplNoop.Config

export const KeyBoard = (config: Config): IKeyBoard => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.KeyBoard(config)
    case 'noop':
      return ImplNoop.KeyBoard(config)
  }
}
