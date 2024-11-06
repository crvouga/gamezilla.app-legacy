import type { Server, WebSocketHandler } from 'bun'
import { Logger, type ILogger } from 'gamezilla-app/app/@/server/logger'
import * as path from 'path'
import {
  fileExtensionToContentType,
  ServerEvent,
  stringToHttpRequestMethod,
  type HttpHandler,
  type HttpRequest,
  type IServer
} from '../server'
import { Posix, PubSub } from 'gamezilla-app/@/core'
import { getIpAddress } from '../ip-address'

type FetchHandler = (req: Request, server: Server) => MaybePromise<Response | undefined | null>
type MaybePromise<T> = T | Promise<T>

export const ServerBun = <T>(config: { logger: ILogger }) => {
  const logger = Logger.prefix('bun', config.logger)
  const httpHandlers: HttpHandler[] = []
  const _fetchHandlers: FetchHandler[] = []
  let webSocketHandler: WebSocketHandler<T>
  let server: Server

  const events: PubSub<ServerEvent> = PubSub.create()

  const base: IServer = {
    events,
    async start(port) {
      server = Bun.serve({
        port: port,
        async fetch(req) {
          for (const handler of _fetchHandlers) {
            const response = await handler(req, server)
            if (response) {
              return response
            }
          }

          const httpRequest: HttpRequest = {
            body: req.body ? await readableStreamToString(req.body) : null,
            headers: Array.from(req.headers.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
              acc[key] = value
              return acc
            }, {}),
            method: stringToHttpRequestMethod(req.method),
            pathname: req.url,
            cookies: (req.headers.get('cookies')?.split(';') ?? []).reduce<Record<string, string>>((acc, cookie) => {
              const [key, value] = cookie.split('=')
              if (key && value) {
                acc[key.trim()] = value.trim()
              }
              return acc
            }, {})
          }

          for (const handler of httpHandlers) {
            const response = await handler(httpRequest)

            if (response) {
              return new Response(response.body, {
                headers: response.headers,
                status: response.status
              })
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
      httpHandlers.push(handler)
    },
    serveSinglePageApp(input) {
      _fetchHandlers.push(async (req, _server) => {
        try {
          const url = new URL(req.url)

          const pathname = decodeURIComponent(url.pathname)
          const filePath = path.join(input.directory, pathname === '/' ? input.indexFile : pathname)
          const ext = path.extname(filePath)
          const contentType = fileExtensionToContentType(ext)

          const file = Bun.file(filePath)

          if (!(await file.exists())) {
            const filePathIndex = path.join(input.directory, input.indexFile)
            const extIndex = path.extname(filePathIndex)
            const contentTypeIndex = fileExtensionToContentType(extIndex)
            const fileIndex = Bun.file(filePathIndex)
            return new Response(fileIndex, {
              headers: {
                'Content-Type': contentTypeIndex
              },
              status: 200
            })
          }

          return new Response(file, {
            headers: {
              'Content-Type': contentType
            },
            status: 200
          })
        } catch (e) {
          return new Response(`Server Error. ${String(e)}`, {
            status: 500
          })
        }
      })
    }
  }
  return {
    ...base,
    _registerFetchHandler(handler: FetchHandler) {
      _fetchHandlers.push(handler)
    },
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

async function readableStreamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, {
      stream: true
    })
  }

  // Finish the stream and decode any remaining bytes
  result += decoder.decode()
  return result
}
