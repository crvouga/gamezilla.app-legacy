import type { ILogger } from './interface'

export type Config = {
  t: 'noop'
}

export const Logger = (config: Config): ILogger => {
  return {
    info() {},
    warn() {},
    error() {},
    debug() {},
    trace() {},
    noop() {},
    fatal() {},
    child() {
      return Logger(config)
    },
  }
}
