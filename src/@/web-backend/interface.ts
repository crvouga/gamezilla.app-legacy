import { Sub } from '../sub'
import { Posix } from '../time/posix'

type MaybePromise<T> = Promise<T> | T

export type Handler = (request: Request, backend: unknown) => MaybePromise<Response | null | undefined>

export type WebBackendEvent =
  | {
      t: 'web-backend/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'web-backend/stopping'
      stoppedAt: Posix
    }

export type IWebBackend = {
  start: (port: number) => Promise<void>
  registerHandler: (handler: Handler) => void
  events: Sub<WebBackendEvent>
}
