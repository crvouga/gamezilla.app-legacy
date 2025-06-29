import { Sub } from '../sub'
import { UnixMs } from '../time/unix-ms'

type MaybePromise<T> = Promise<T> | T

export type Respond = (request: Request, server: unknown) => MaybePromise<Response | null | undefined>

export type HttpServerEvent = { t: 'started'; ipAddress: string; port: number; startedAt: UnixMs } | { t: 'stopped' }

export type Middleware = (
  request: Request,
  next: (request: Request) => MaybePromise<Response | null | undefined>,
) => MaybePromise<Response | null | undefined>

// WebSocket connection abstraction
export type IWebSocketConnection<TData = any> = {
  send: (message: string | Buffer) => void
  close: (code?: number, reason?: string) => void
  readyState: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
  data?: TData

  // Topic subscription management
  subscribe: (topic: string) => void
  unsubscribe: (topic: string) => void
  getSubscriptions: () => Set<string>
}

// WebSocket events
export type WebSocketEvent<TData = any> =
  | { t: 'connection'; connection: IWebSocketConnection<TData>; request: Request }
  | { t: 'message'; connection: IWebSocketConnection<TData>; message: string | Buffer }
  | { t: 'close'; connection: IWebSocketConnection<TData>; code: number; reason: string }
  | { t: 'error'; connection: IWebSocketConnection<TData>; error: Error }

// WebSocket handler configuration
export type WebSocketHandler<TData = any> = {
  onConnection?: (connection: IWebSocketConnection<TData>, request: Request) => TData | Promise<TData>
  onMessage?: (connection: IWebSocketConnection<TData>, message: string | Buffer) => void | Promise<void>
  onClose?: (connection: IWebSocketConnection<TData>, code: number, reason: string) => void | Promise<void>
  onError?: (connection: IWebSocketConnection<TData>, error: Error) => void | Promise<void>
}

// WebSocket server interface
export type IWebSocketServer = {
  publish: (topic: string, message: string | Buffer) => void
  getConnections: () => IWebSocketConnection[]
  getConnectionsByTopic: (topic: string) => IWebSocketConnection[]
  events: Sub<WebSocketEvent>
}

export type IHttpServer = {
  start: (port: number) => Promise<void>
  stop: () => Promise<void>
  registerRespond: (handler: Respond) => void
  registerMiddleware: (middleware: Middleware) => void
  events: Sub<HttpServerEvent>

  // WebSocket support
  registerWebSocketHandler: <TData = any>(path: string, handler: WebSocketHandler<TData>) => IWebSocketServer
}
