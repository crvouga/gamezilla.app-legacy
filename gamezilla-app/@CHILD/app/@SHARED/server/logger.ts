export type Logger = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
  debug: (msg: string) => void
  trace: (msg: string) => void
  fatal: (msg: string) => void
}

export type Impl =
  | {
      t: "console"
      prefix: string
    }
  | {
      t: "noop"
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

export const loggerNoop: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
}

export const Logger = (impl: Impl): Logger => {
  switch (impl.t) {
    case "console": {
      return LoggerConsole(impl.prefix)
    }

    case "noop": {
      return loggerNoop
    }
  }
}
