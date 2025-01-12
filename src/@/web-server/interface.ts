import { Sub } from '../sub'
import { Posix } from '../time/posix'

type MaybePromise<T> = Promise<T> | T

export type Handler = (request: Request, server: unknown) => MaybePromise<Response | null | undefined>

export type WebBackendEvent =
  | {
      t: 'web-server/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'web-server/stopping'
      stoppedAt: Posix
    }

export type IWebBackend = {
  start: (port: number) => Promise<void>
  registerHandler: (handler: Handler) => void
  events: Sub<WebBackendEvent>
}
