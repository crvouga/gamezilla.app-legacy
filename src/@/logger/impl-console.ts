import type { ILogger } from './interface'

export type Config = {
  t: 'console'

  newLinePerMsg: boolean
}

export const LoggerConsole = (config: Config): ILogger => {
  const timestamp = () => new Date().toISOString()

  return {
    info(...msg) {
      console.log(`[${timestamp()}][inf]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    warn(...msg) {
      console.warn(`[${timestamp()}][wrn]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    error(...msg) {
      console.error(`[${timestamp()}][err]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    debug(...msg) {
      console.debug(`[${timestamp()}][dbg]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    trace(...msg) {
      console.trace(`[${timestamp()}][trc]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    fatal(...msg) {
      console.error(`[${timestamp()}][ftl]`, ...msg, config.newLinePerMsg ? '\n' : '')
    },
    noop() {},
  }
}
