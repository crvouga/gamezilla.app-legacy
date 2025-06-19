import * as ImplConsole from './impl-console'
import * as ImplNoop from './impl-noop'
import type { ILogger } from './interface'

export type Config = ImplConsole.Config | ImplNoop.Config

export const Logger = (config: Config): ILogger => {
  switch (config.t) {
    case 'console': {
      return ImplConsole.Logger(config)
    }

    case 'noop': {
      return ImplNoop.Logger(config)
    }
  }
}
