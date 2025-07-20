import { ImplConsole } from './impl-console'
import { ImplNoop } from './impl-noop'
import type { ILogger } from './interface'

export type Logger = ImplConsole | ImplNoop

const init = (config: Logger): ILogger => {
  switch (config.t) {
    case 'console': {
      return ImplConsole.init(config)
    }

    case 'noop': {
      return ImplNoop.init(config)
    }
  }
}

export const Logger = {
  init,
}
