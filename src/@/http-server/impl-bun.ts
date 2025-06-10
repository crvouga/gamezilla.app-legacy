import type { Server, WebSocketHandler } from 'bun'
import { Logger, type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { UnixMs } from '../time/unix-ms'
import { HttpServerEvent, Middleware, type IHttpServer, type Respond } from './interface'
import { createRespond } from './respond'

export type Config = {
  t: 'bun'
  logger: ILogger
}

export const HttpServerBun = <T>(config: Config) => {
  const logger = Logger.prefix('bun', config.logger)
  const responds: Respond[] = []
  const middlewares: Middleware[] = []
  const events = Sub.create<HttpServerEvent>()
  let webSocketHandler: WebSocketHandler<T>
  let server: Server

  const base: IHttpServer = {
    events,
    async start(port) {
      const respond = createRespond(middlewares, responds)

      server = Bun.serve({
        port: port,
        async fetch(request, server) {
          const response = await respond(request, server)
          return response ?? undefined
        },
        websocket: webSocketHandler,
      })

      logger.info(`Listening on port ${port}`)

      events.pub({
        t: 'started',
        ipAddress: '127.0.0.1',
        port,
        startedAt: UnixMs.now(),
      })
    },
    async stop() {
      logger.info('Stopping HTTP server')
      await server.stop(true)
      events.pub({
        t: 'stopped',
      })
    },
    registerRespond(respond) {
      responds.push(respond)
    },
    registerMiddleware(middleware) {
      middlewares.push(middleware)
    },
  }
  return {
    ...base,
    _setWebSocketHandler(handler: WebSocketHandler<T>) {
      webSocketHandler = handler
    },
    t: 'bun',
  } as const
}

export type HttpServerBun = ReturnType<typeof HttpServerBun>
