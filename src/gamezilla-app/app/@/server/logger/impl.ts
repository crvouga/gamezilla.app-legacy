import type { ILogger } from './interface'
import { LoggerConsole } from './impl-console'
import { loggerNoop } from './impl-noop'

export type Impl =
  | {
      t: 'console'
    }
  | {
      t: 'noop'
    }

export const Logger = (impl: Impl): ILogger => {
  switch (impl.t) {
    case 'console': {
      return LoggerConsole()
    }

    case 'noop': {
      return loggerNoop
    }
  }
}
