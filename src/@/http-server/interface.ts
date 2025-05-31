import { Sub } from '../sub'
import { Posix } from '../time/posix'

type MaybePromise<T> = Promise<T> | T

export type Respond = (request: Request, backend: unknown) => MaybePromise<Response | null | undefined>

export type HttpServerEvent =
  | {
      t: 'http-server/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'http-server/stopping'
      stoppedAt: Posix
    }

export type IHttpServer = {
  start: (port: number) => Promise<void>
  stop: () => Promise<void>
  registerRespond: (handler: Respond) => void
  registerStatic: (path: string, response: Response) => void
  events: Sub<HttpServerEvent>
}
