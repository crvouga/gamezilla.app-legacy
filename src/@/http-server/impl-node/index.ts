import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { type ILogger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { TraceId } from '~/@/wire/trace-id'
import { TraceIdHttp } from '~/@/wire/trace-id-http'
import {
  HttpServerEvent,
  Middleware,
  type IHttpServer,
  type IWebSocketServer,
  type Respond,
  type WebSocketHandler,
} from '../interface'
import { createRespond } from '../respond'
import { initializeWebSocketServer, NodeWebSocketServer } from './websockets'

export type Config = {
  t: 'node'
  logger: ILogger
}

export const HttpServer = (config: Config): IHttpServer => {
  const logger = config.logger.child(['node'])
  const responds: Respond[] = []
  const middlewares: Middleware[] = []
  const events = Sub.create<HttpServerEvent>()
  const webSocketServers = new Map<string, NodeWebSocketServer>()
  const pendingWebSocketHandlers = new Map<string, WebSocketHandler<any>>()
  let server: Server

  return {
    events,
    async start(port) {
      logger.info('Starting HTTP server on port', port)
      const respond = createRespond(middlewares, responds)

      const parseBody = (req: IncomingMessage): Promise<string> => {
        return new Promise((resolve) => {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            resolve(body)
          })
        })
      }

      server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const traceId = TraceId.generate()
        res.setHeader(TraceIdHttp.HEADER_NAME, traceId)
        const requestLogger = logger.child([traceId])

        try {
          requestLogger.debug('Handling HTTP request', { method: req.method, url: req.url })

          let body: string | undefined
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await parseBody(req)
          }

          const request = new Request(`http://localhost:${port}${req.url}`, {
            method: req.method || 'GET',
            headers: req.headers as Record<string, string>,
            body: body,
          })

          const response = await respond(request, server, traceId)
          if (response) {
            requestLogger.debug('Sending response', { status: response.status })
            res.statusCode = response.status

            for (const [key, value] of response.headers.entries()) {
              res.setHeader(key, value)
            }

            const responseBody = await response.text()
            res.end(responseBody)
          } else {
            requestLogger.debug('No response handler found, sending 404')
            res.statusCode = 404
            res.end('Not Found')
          }
        } catch (error) {
          requestLogger.error('HTTP request error:', error)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      })

      logger.debug('Initializing pending WebSocket handlers', { count: pendingWebSocketHandlers.size })
      for (const [path, handler] of pendingWebSocketHandlers) {
        initializeWebSocketServer({
          path,
          handler,
          server,
          logger,
          webSocketServers,
        })
      }
      pendingWebSocketHandlers.clear()

      server.listen(port, () => {
        logger.info(`HTTP server listening on port ${port}`)
        events.pub({
          t: 'started',
          ipAddress: '127.0.0.1',
          port,
          startedAt: UnixMs.now(),
        })
      })
    },
    async stop() {
      logger.info('Stopping HTTP server')
      await Promise.race([
        new Promise((r) => server?.close(r)),
        new Promise((r) => server.on('close', r)),
        new Promise((r) => setTimeout(r, 10)),
      ])
      logger.info('HTTP server stopped')
      events.pub({ t: 'stopped' })
    },
    registerRespond(respond) {
      logger.debug('Registering respond handler')
      responds.push(respond)
    },
    registerMiddleware(middleware) {
      logger.debug('Registering middleware')
      middlewares.push(middleware)
    },
    registerWebSocketHandler<TData = any>(path: string, handler: WebSocketHandler<TData>): IWebSocketServer {
      logger.debug('Registering WebSocket handler', { path })
      const wsServer = new NodeWebSocketServer()
      webSocketServers.set(path, wsServer)

      if (server) {
        logger.debug('Server running, initializing WebSocket handler immediately', { path })
        initializeWebSocketServer({
          path,
          handler,
          server,
          logger,
          webSocketServers,
        })
      } else {
        logger.debug('Server not running, deferring WebSocket handler initialization', { path })
        pendingWebSocketHandlers.set(path, handler)
      }

      return wsServer
    },
  }
}
