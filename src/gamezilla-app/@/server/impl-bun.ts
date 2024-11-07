import type { Server, WebSocketHandler } from 'bun'
import { Posix, PubSub } from 'gamezilla-app/@/core'
import { Logger, type ILogger } from 'gamezilla-app/app/@/server/logger'
import { getIpAddress } from './ip-address'
import { ServerEvent, type Handler, type IServer } from './server'

export type Config = {
  t: 'bun'
  logger: ILogger
}

export const ServerBun = <T>(config: Config) => {
  const logger = Logger.prefix('bun', config.logger)
  const handlers: Handler[] = []
  let webSocketHandler: WebSocketHandler<T>
  let server: Server

  const events: PubSub<ServerEvent> = PubSub.create()

  const base: IServer = {
    events,
    async start(port) {
      server = Bun.serve({
        port: port,
        async fetch(req) {
          for (const handler of handlers) {
            const response = await handler(req, server)
            if (response) {
              return response
            }
          }

          return new Response('Not found', {
            status: 404
          })
        },
        websocket: webSocketHandler
      })

      events.pub({
        t: 'server/started',
        ipAddress: getIpAddress(),
        port,
        startedAt: Posix.now()
      })

      logger.info(`Listening on port ${port}`)
    },
    registerHandler(handler) {
      handlers.push(handler)
    }
  }
  return {
    ...base,

    _setWebSocketHandler(handler: WebSocketHandler<T>) {
      webSocketHandler = handler
    },
    _publish(topic: string, data: string) {
      server.publish(topic, data)
    },
    t: 'bun'
  } as const
}

export type ServerBun = ReturnType<typeof ServerBun>
