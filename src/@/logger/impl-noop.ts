import type { ILogger } from './interface'

export type ImplNoop = {
  t: 'noop'
}

const init = (config: ImplNoop): ILogger => {
  return {
    info() {},
    warn() {},
    error() {},
    debug() {},
    trace() {},
    noop() {},
    fatal() {},
    child() {
      return init(config)
    },
    setMaxLogLevel() {
      return init(config)
    },
  }
}

export const ImplNoop = {
  init,
}
