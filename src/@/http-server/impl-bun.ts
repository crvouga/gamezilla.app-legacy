import type { Server, WebSocketHandler } from 'bun'
import { Logger, type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { Posix } from '../time/posix'
import { allowCORS } from './cors'
import { HttpServerEvent, type IHttpServer, type Respond } from './interface'

export type Config = {
  t: 'bun'
  logger: ILogger
}

export const HttpServerBun = <T>(config: Config) => {
  const logger = Logger.prefix('bun', config.logger)
  const handlers: Respond[] = []
  const events = Sub.create<HttpServerEvent>()
  let webSocketHandler: WebSocketHandler<T>
  let httpServer: Server

  const respond = async (request: Request) => {
    try {
      for (const handler of handlers) {
        const response = await handler(request, httpServer)

        if (response) {
          return allowCORS(request, response)
        }
      }

      return new Response('Not found', { status: 404 })
    } catch (error) {
      logger.error(error)
      return new Response('Internal backend error', {
        status: 500,
      })
    }
  }

  const base: IHttpServer = {
    events,
    async start(port) {
      httpServer = Bun.serve({
        port: port,
        async fetch(request) {
          const response = await respond(request)
          return allowCORS(request, response)
        },
        websocket: webSocketHandler,
      })

      logger.info(`Listening on port ${port}`)
      events.pub({
        t: 'started',
        ipAddress: '127.0.0.1',
        port,
        startedAt: Posix.now(),
      })
    },
    async stop() {
      logger.info('Stopping HTTP server')
      await httpServer.stop(true)
      events.pub({
        t: 'stopped',
      })
    },
    registerRespond(handler) {
      handlers.push(handler)
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
