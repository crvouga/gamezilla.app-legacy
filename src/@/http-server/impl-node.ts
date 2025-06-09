import * as http from 'node:http'
import { Logger, type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { UnixMs } from '../time/posix'
import { HttpServerEvent, Middleware, type IHttpServer, type Respond } from './interface'
import { createRespond } from './respond'

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
  const server = new http.Server()
  const responds: Respond[] = []
  const middlewares: Middleware[] = []
  const events = Sub.create<HttpServerEvent>()

  const respond = createRespond(middlewares, responds)

  const respondNode = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const request = await incomingMessageToFetchRequest(req)
    const response = await respond(request, server)
    if (response) {
      await applyFetchResponseToNodeResponse(res, response)
    }
  }

  const start = async (port: number) => {
    server.listen(port, () => {
      logger.info(`Listening on port ${port}`)
      events.pub({
        t: 'started',
        ipAddress: '127.0.0.1',
        port,
        startedAt: UnixMs.now(),
      })
    })

    server.on('request', respondNode)
  }

  const registerRespond = (handler: Respond) => {
    responds.push(handler)
  }

  const stop = async () => {
    await new Promise((resolve) => server.close(resolve))
    events.pub({
      t: 'stopped',
    })
  }

  const registerMiddleware = (middleware: Middleware) => {
    middlewares.push(middleware)
  }

  return {
    t: 'node',
    start,
    stop,
    registerRespond,
    registerMiddleware,
    events,
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
