import type { ILogger } from './interface'

export const LoggerConsole = (): ILogger => {
  return {
    info: (msg: string) => {
      console.log(`[inf] ${msg}`)
    },
    warn: (msg: string) => {
      console.warn(`[wrn] ${msg}`)
    },
    error: (msg: string) => {
      console.error(`[err] ${msg}`)
    },
    debug: (msg: string) => {
      console.debug(`[dbg] ${msg}`)
    },
    trace: (msg: string) => {
      console.trace(`[trc] ${msg}`)
    },
    fatal: (msg: string) => {
      console.error(`[ftl] ${msg}`)
    }
  }
}
