import { Sub } from '../core'
import { Posix } from '../time/posix'

type MaybePromise<T> = Promise<T> | T

export type Handler = (request: Request, server: unknown) => MaybePromise<Response | null | undefined>

export type WebServerEvent =
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

export type IWebServer = {
  start: (port: number) => Promise<void>
  registerHandler: (handler: Handler) => void
  events: Sub<WebServerEvent>
}
