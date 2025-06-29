import { type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import {
  HttpServerEvent,
  type IHttpServer,
  type IWebSocketServer,
  type WebSocketHandler,
  type WebSocketEvent,
  type IWebSocketConnection,
} from './interface'

export type Config = {
  t: 'noop'
  logger: ILogger
}

// Noop WebSocket server implementation
class NoopWebSocketServer implements IWebSocketServer {
  public events = Sub.create<WebSocketEvent>()

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

export const HttpServer = (_config: Config): IHttpServer => {
  return {
    events: Sub.create<HttpServerEvent>(),
    registerMiddleware: () => {},
    registerRespond: () => {},
    start: () => Promise.resolve(),
    stop: () => Promise.resolve(),
    registerWebSocketHandler: <TData = any>(_path: string, _handler: WebSocketHandler<TData>): IWebSocketServer => {
      return new NoopWebSocketServer()
    },
  }
}
