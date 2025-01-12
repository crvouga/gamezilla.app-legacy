import type { Server, WebSocketHandler } from 'bun'
import { Logger, type ILogger } from '~/@/logger'
import { PubSub } from '../sub'
import { Posix } from '../time/posix'
import { HttpServerEvent, type Handler, type IHttpServer } from './interface'
import { getIpAddress } from './ip-address'

export type Config = {
  t: 'bun'
  logger: ILogger
}

export const HttpServerBun = <T>(config: Config) => {
  const logger = Logger.prefix('bun', config.logger)
  const handlers: Handler[] = []
  let webSocketHandler: WebSocketHandler<T>
  let backend: Server

  const events: PubSub<HttpServerEvent> = PubSub.create()

  const base: IHttpServer = {
    events,
    async start(port) {
      backend = Bun.serve({
        port: port,
        async fetch(req) {
          try {
            for (const handler of handlers) {
              const response = await handler(req, backend)
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

      events.pub({
        t: 'web-backend/started',
        ipAddress: getIpAddress(),
        port,
        startedAt: Posix.now(),
      })

      logger.info(`Listening on port ${port}`)
    },
    registerHandler(handler) {
      handlers.push(handler)
    },
  }
  return {
    ...base,

    _setWebSocketHandler(handler: WebSocketHandler<T>) {
      webSocketHandler = handler
    },
    _publish(topic: string, data: string) {
      backend.publish(topic, data)
    },
    t: 'bun',
  } as const
}

export type HttpServerBun = ReturnType<typeof HttpServerBun>
