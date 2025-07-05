export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const ORDER: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

const toLabel = (level: LogLevel): string => {
  switch (level) {
    case 'trace':
      return 'TRC'
    case 'debug':
      return 'DBG'
    case 'info':
      return 'INF'
    case 'warn':
      return 'WRN'
    case 'error':
      return 'ERR'
    case 'fatal':
      return 'FTL'
  }
}

export const LogLevel = {
  toLabel,
  ORDER,
}
