import { type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import {
  HttpServerEvent,
  type IHttpServer,
  type IWebSocketConnection,
  type IWebSocketServer,
  type WebSocketEvent,
  type WebSocketHandler,
} from './interface'

export type ImplNoop = {
  t: 'noop'
  logger: ILogger
}

// Noop WebSocket server implementation
class NoopWebSocketServer implements IWebSocketServer {
  public events = Sub.init<WebSocketEvent>()

  publish(_topic: string, _message: string | Buffer): void {
    // No-op
  }

  getConnections(): IWebSocketConnection[] {
    return []
  }

  getConnectionsByTopic(_topic: string): IWebSocketConnection[] {
    return []
  }
}

const init = (_config: ImplNoop): IHttpServer => {
  return {
    events: Sub.init<HttpServerEvent>(),
    registerMiddleware: () => {},
    registerRespond: () => {},
    start: () => Promise.resolve(),
    stop: () => Promise.resolve(),
    registerWebSocketHandler: <TData = any>(_path: string, _handler: WebSocketHandler<TData>): IWebSocketServer => {
      return new NoopWebSocketServer()
    },
  }
}

export const ImplNoop = {
  init,
}
