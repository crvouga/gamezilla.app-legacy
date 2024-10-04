export type ILogger = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
  debug: (msg: string) => void
  trace: (msg: string) => void
  fatal: (msg: string) => void
}
