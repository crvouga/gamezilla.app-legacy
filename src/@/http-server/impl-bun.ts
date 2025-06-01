import type { Server, WebSocketHandler } from 'bun'
import { Logger, type ILogger } from '~/@/logger'
import { PubSub, Sub } from '../sub'
import { Posix } from '../time/posix'
import { HttpServerEvent, type IHttpServer, type Respond } from './interface'
import { getIpAddress } from './ip-address'

export type Config = {
  t: 'bun'
  logger: ILogger
}

export const HttpServerBun = <T>(config: Config) => {
  const logger = Logger.prefix('bun', config.logger)
  const handlers: Respond[] = []
  let webSocketHandler: WebSocketHandler<T>
  let httpServer: Server

  const events: PubSub<HttpServerEvent> = Sub.create()

  const staticResponses: Record<`/${string}`, Response> = {}

  const base: IHttpServer = {
    events,

    async start(port) {
      httpServer = Bun.serve({
        port: port,
        static: staticResponses,
        async fetch(req) {
          try {
            for (const handler of handlers) {
              const response = await handler(req, httpServer)
              if (response) {
                return response
              }
            }

            return new Response('Not found', {
              status: 404,
            })
          } catch (error) {
            logger.error(error)
            return new Response('Internal backend error', {
              status: 500,
            })
          }
        },
        websocket: webSocketHandler,
      })

      logger.info(`Listening on port ${port}`)

      events.pub({
        t: 'http-server/started',
        ipAddress: getIpAddress(),
        port,
        startedAt: Posix.now(),
      })
    },
    async stop() {
      logger.info('Stopping HTTP server')
      await httpServer.stop(true)
      logger.info('HTTP server was not running')
    },
    registerRespond(handler) {
      handlers.push(handler)
    },
    registerStatic(path, response) {
      staticResponses[`/${path.replace(/^\//, '')}`] = response
    },
  }
  return {
    ...base,

    _setWebSocketHandler(handler: WebSocketHandler<T>) {
      webSocketHandler = handler
    },
    _publish(topic: string, data: string) {
      httpServer.publish(topic, data)
    },
    t: 'bun',
  } as const
}

export type HttpServerBun = ReturnType<typeof HttpServerBun>
