import type { ILogger } from './logger'

export const LoggerConsole = (): ILogger => {
  return {
    info: (msg: string) => {
      console.log(`[info] ${msg}`)
    },
    warn: (msg: string) => {
      console.warn(`[warn] ${msg}`)
    },
    error: (msg: string) => {
      console.error(`[error] ${msg}`)
    },
    debug: (msg: string) => {
      console.debug(`[debug] ${msg}`)
    },
    trace: (msg: string) => {
      console.trace(`[trace] ${msg}`)
    },
    fatal: (msg: string) => {
      console.error(`[fatal] ${msg}`)
    }
  }
}
