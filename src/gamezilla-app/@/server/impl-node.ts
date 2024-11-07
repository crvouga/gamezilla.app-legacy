import { Posix, PubSub } from 'gamezilla-app/@/core'
import { Logger, type ILogger } from 'gamezilla-app/app/@/server/logger'
import * as http from 'node:http'
import { getIpAddress } from './ip-address'
import { ServerEvent, type Handler, type IServer } from './server'

export type Config = {
  t: 'node'
  logger: ILogger
}

export const ServerNode = (config: Config) => {
  const logger = Logger.prefix('node', config.logger)
  const httpServer = new http.Server()
  const handlers: Handler[] = []
  const events: PubSub<ServerEvent> = PubSub.create()

  const base: IServer = {
    events,
    async start(port) {
      try {
        await new Promise<void>((r) => httpServer.listen(port, r))
        events.pub({
          t: 'server/started',
          ipAddress: getIpAddress(),
          port,
          startedAt: Posix.now()
        })
      } catch (error) {
        console.error('error', error)
      }

      logger.info(`Listening on port ${port}`)

      httpServer.on('request', async (req, res) => {
        const request = await incomingMessageToFetchRequest(req)
        for (const handler of handlers) {
          const response = await handler(request, httpServer)
          if (response) {
            applyFetchResponseToNodeResponse(res, response)
            return
          }
        }
      })
    },

    registerHandler(handler) {
      handlers.push(handler)
    }
  }
  return {
    ...base,
    httpServer,
    t: 'node'
  } as const
}

export type ServerNode = ReturnType<typeof ServerNode>

async function incomingMessageToFetchRequest(incomingMessage: http.IncomingMessage): Promise<Request> {
  const url = `${incomingMessage.headers['host']}${incomingMessage.url}`
  const method = incomingMessage.method || 'GET'

  const headers = new Headers()
  for (const [key, value] of Object.entries(incomingMessage.headers)) {
    if (value) {
      headers.append(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const body = await new Promise<Uint8Array | undefined>((resolve, reject) => {
    const chunks: Uint8Array[] = []
    incomingMessage.on('data', (chunk) => chunks.push(chunk as Uint8Array))
    incomingMessage.on('end', () => {
      resolve(chunks.length > 0 ? (Buffer.concat(chunks) as unknown as Uint8Array) : undefined)
    })
    incomingMessage.on('error', reject)
  })

  return new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? body : undefined
  })
}

async function applyFetchResponseToNodeResponse(
  res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage },
  fetchResponse: Response
): Promise<void> {
  res.statusCode = fetchResponse.status
  res.statusMessage = fetchResponse.statusText

  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  const body = await fetchResponse.arrayBuffer()
  if (body) {
    res.write(Buffer.from(body))
  }

  res.end()
}
