export type Logger = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
  debug: (msg: string) => void
  trace: (msg: string) => void
  fatal: (msg: string) => void
}

export const LoggerConsole = (prefix: string): Logger => {
  return {
    info: (msg: string) => console.log(`[${prefix}] [info] ${msg}`),
    warn: (msg: string) => console.log(`[${prefix}] [warn] ${msg}`),
    error: (msg: string) => console.log(`[${prefix}] [error] ${msg}`),
    debug: (msg: string) => console.log(`[${prefix}] [debug] ${msg}`),
    trace: (msg: string) => console.log(`[${prefix}] [trace] ${msg}`),
    fatal: (msg: string) => console.log(`[${prefix}] [fatal] ${msg}`),
  }
}
