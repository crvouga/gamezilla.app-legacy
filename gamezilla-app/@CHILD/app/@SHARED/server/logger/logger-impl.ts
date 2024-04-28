import { ILogger } from "./logger"
import { LoggerConsole } from "./logger-impl-console"
import { loggerNoop } from "./logger-impl-noop"

export type Impl =
  | {
      t: "console"
    }
  | {
      t: "noop"
    }

export const Logger = (impl: Impl): ILogger => {
  switch (impl.t) {
    case "console": {
      return LoggerConsole()
    }

    case "noop": {
      return loggerNoop
    }
  }
}
