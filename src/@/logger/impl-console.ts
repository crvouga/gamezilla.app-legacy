import { Logger as LoggerNoop } from './impl-noop'
import type { ILogger } from './interface'
export type Config = {
  t: 'console'
  newLinePerMsg: boolean
  namespace: [string, ...string[]]
}

export const Logger = (config: Config): ILogger => {
  const timestamp = () => new Date().toISOString()

  const log =
    (level: string, color: string, fn: typeof console.log) =>
    (...msg: unknown[]) => {
      fn(
        `\x1b[90m[${timestamp()}]\x1b[0m ${color}[${level}]\x1b[0m \x1b[90m${config.namespace.join(' > ')}\x1b[0m`,
        ...msg,
        config.newLinePerMsg ? '\n' : '',
      )
    }

  return {
    info: log('INF', '\x1b[36m', console.log),
    warn: log('WRN', '\x1b[33m', console.warn),
    error: log('ERR', '\x1b[31m', console.error),
    debug: log('DBG', '\x1b[35m', console.debug),
    trace: log('TRC', '\x1b[90m', console.trace),
    fatal: log('FTL', '\x1b[41m', console.error),
    noop() {
      return LoggerNoop({ t: 'noop' })
    },
    child(namespace) {
      return Logger({ ...config, namespace: [...config.namespace, ...namespace] })
    },
  }
}
