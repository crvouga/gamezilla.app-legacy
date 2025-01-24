import * as http from 'node:http'
import { Logger, type ILogger } from '~/@/logger'
import { PubSub } from '../sub'
import { Posix } from '../time/posix'
import { HttpServerEvent, type Respond, type IHttpServer } from './interface'
import { getIpAddress } from './ip-address'

export type Config = {
  t: 'node'
  logger: ILogger
}
export const HttpServerNode = (
  config: Config,
): IHttpServer & {
  t: 'node'
} => {
  const logger = Logger.prefix('node', config.logger)
  const httpServer = new http.Server()
  const handlers: Respond[] = []
  const events: PubSub<HttpServerEvent> = PubSub.create()

  const staticResponses: Record<`/${string}`, Response> = {}

  const respondNode = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const request = await incomingMessageToFetchRequest(req)
    const response = await respond(request)
    if (response) {
      await applyFetchResponseToNodeResponse(res, response)
    }
  }

  const respond = async (request: Request): Promise<Response> => {
    const staticResponse = staticResponses[`/${request.url.replace(/^\//, '')}`]
    if (staticResponse) {
      return staticResponse
    }

    for (const handler of handlers) {
      const response = await handler(request, httpServer)
      if (response) {
        return response
      }
    }

    return new Response('Not found', { status: 404 })
  }

  const start = async (port: number) => {
    httpServer.listen(port, () => {
      events.pub({ t: 'web-backend/started', ipAddress: getIpAddress(), port, startedAt: Posix.now() })
      logger.info(`Listening on port ${port}`)
    })

    httpServer.on('request', respondNode)
  }

  const registerRespond = (handler: Respond) => {
    handlers.push(handler)
  }

  const registerStatic = (path: string, response: Response) => {
    staticResponses[`/${path.replace(/^\//, '')}`] = response
  }

  return {
    events,
    start,
    registerRespond,
    registerStatic,
    t: 'node',
  }
}

export type HttpServerNode = ReturnType<typeof HttpServerNode>

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
    body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
  })
}

async function applyFetchResponseToNodeResponse(
  res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage },
  fetchResponse: Response,
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
