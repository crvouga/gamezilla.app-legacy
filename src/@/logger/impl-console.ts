import { Logger as LoggerNoop } from './impl-noop'
import { ILogger } from './interface'
import { LogLevel } from './log-level'

export type Config = {
  t: 'console'
  newLinePerMsg: boolean
  namespace: [string, ...string[]]
  maxLogLevel: LogLevel
}

export const Logger = (config: Config): ILogger => {
  const timestamp = () => new Date().toISOString()

  const log =
    (level: LogLevel, color: string, fn: typeof console.log) =>
    (...msg: unknown[]) => {
      const levelLabel = LogLevel.toLabel(level)

      if (LogLevel.ORDER.indexOf(level) < LogLevel.ORDER.indexOf(config.maxLogLevel)) {
        return
      }

      fn(
        `\x1b[90m[${timestamp()}]\x1b[0m ${color}[${levelLabel}]\x1b[0m \x1b[90m${config.namespace.join(' > ')}\x1b[0m`,
        ...msg,
        config.newLinePerMsg ? '\n' : '',
      )
    }

  return {
    info: log('info', '\x1b[36m', console.log),
    warn: log('warn', '\x1b[33m', console.warn),
    error: log('error', '\x1b[31m', console.error),
    debug: log('debug', '\x1b[35m', console.debug),
    trace: log('trace', '\x1b[90m', console.trace),
    fatal: log('fatal', '\x1b[41m', console.error),
    noop() {
      return LoggerNoop({ t: 'noop' })
    },
    child(namespace) {
      return Logger({ ...config, namespace: [...config.namespace, ...namespace] })
    },
    maxLogLevel(level) {
      return Logger({ ...config, maxLogLevel: level })
    },
  }
}
