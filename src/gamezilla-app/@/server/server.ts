import { Posix, Sub } from '../core'

type MaybePromise<T> = Promise<T> | T

export type Handler = (request: Request, server: unknown) => MaybePromise<Response | null | undefined>

export type ServerEvent =
  | {
      t: 'server/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'server/stopping'
      stoppedAt: Posix
    }

export type IServer = {
  start: (port: number) => Promise<void>
  registerHandler: (handler: Handler) => void
  events: Sub<ServerEvent>
}
