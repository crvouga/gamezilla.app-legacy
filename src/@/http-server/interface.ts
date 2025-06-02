import { Sub } from '../sub'
import { Posix } from '../time/posix'

type MaybePromise<T> = Promise<T> | T

export type Respond = (request: Request, server: unknown) => MaybePromise<Response | null | undefined>

export type HttpServerEvent = { t: 'started'; ipAddress: string; port: number; startedAt: Posix } | { t: 'stopped' }

export type Middleware = (
  request: Request,
  next: (request: Request) => MaybePromise<Response>,
) => MaybePromise<Response>

export type IHttpServer = {
  start: (port: number) => Promise<void>
  stop: () => Promise<void>
  registerRespond: (handler: Respond) => void
  registerMiddleware: (middleware: Middleware) => void
  events: Sub<HttpServerEvent>
}
