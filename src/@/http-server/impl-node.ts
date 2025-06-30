import express from 'express'
import { createServer, Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { UnixMs } from '../time/unix-ms'
import {
  HttpServerEvent,
  Middleware,
  type IHttpServer,
  type IWebSocketConnection,
  type IWebSocketServer,
  type Respond,
  type WebSocketEvent,
  type WebSocketHandler,
} from './interface'
import { createRespond } from './respond'
import { TraceId } from '../wire/trace-id'
import { TraceIdHttp } from '../wire/trace-id-http'

export type Config = {
  t: 'node'
  logger: ILogger
}

class NodeWebSocketConnection<TData = any> implements IWebSocketConnection<TData> {
  private ws: WebSocket
  private subscriptions = new Set<string>()

  public data?: TData

  constructor(ws: WebSocket, data?: TData) {
    this.ws = ws
    this.data = data
  }

  send(message: string | Buffer): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    }
  }

  close(code?: number, reason?: string): void {
    this.ws.close(code, reason)
  }

  get readyState(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'CLOSED'
    }
  }

  subscribe(topic: string): void {
    this.subscriptions.add(topic)
  }

  unsubscribe(topic: string): void {
    this.subscriptions.delete(topic)
  }

  getSubscriptions(): Set<string> {
    return new Set(this.subscriptions)
  }
}

// WebSocket server implementation
class NodeWebSocketServer implements IWebSocketServer {
  private connections = new Map<string, NodeWebSocketConnection>()
  private topicSubscriptions = new Map<string, Set<string>>() // topic -> connectionIds
  public events = Sub.create<WebSocketEvent>()

  constructor() {}

  publish(topic: string, message: string | Buffer): void {
    const connectionIds = this.topicSubscriptions.get(topic)
    if (connectionIds) {
      for (const connectionId of connectionIds) {
        const connection = this.connections.get(connectionId)
        if (connection && connection.readyState === 'OPEN') {
          connection.send(message)
        }
      }
    }
  }

  getConnections(): IWebSocketConnection[] {
    return Array.from(this.connections.values())
  }

  getConnectionsByTopic(topic: string): IWebSocketConnection[] {
    const connectionIds = this.topicSubscriptions.get(topic) || new Set()
    return Array.from(connectionIds)
      .map((id) => this.connections.get(id))
      .filter((conn): conn is NodeWebSocketConnection => conn !== undefined)
  }

  addConnection(connectionId: string, connection: NodeWebSocketConnection): void {
    this.connections.set(connectionId, connection)
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (connection) {
      // Remove from all topic subscriptions
      for (const topic of connection.getSubscriptions()) {
        this.unsubscribeFromTopic(connectionId, topic)
      }
      this.connections.delete(connectionId)
    }
  }

  subscribeToTopic(connectionId: string, topic: string): void {
    if (!this.topicSubscriptions.has(topic)) {
      this.topicSubscriptions.set(topic, new Set())
    }
    this.topicSubscriptions.get(topic)!.add(connectionId)
  }

  unsubscribeFromTopic(connectionId: string, topic: string): void {
    const subscribers = this.topicSubscriptions.get(topic)
    if (subscribers) {
      subscribers.delete(connectionId)
      if (subscribers.size === 0) {
        this.topicSubscriptions.delete(topic)
      }
    }
  }
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
      const app = express()
      const respond = createRespond(middlewares, responds)

      app.use(async (req, res, next) => {
        const traceId = TraceId.generate()
        res.setHeader(TraceIdHttp.HEADER_NAME, traceId)
        const requestLogger = logger.child([traceId])
        try {
          requestLogger.debug('Handling HTTP request', { method: req.method, url: req.url })
          const request = new Request(`http://localhost:${port}${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
          })

          const response = await respond(request, server, traceId)
          if (response) {
            requestLogger.debug('Sending response', { status: response.status })
            res.status(response.status)
            for (const [key, value] of response.headers.entries()) {
              res.set(key, value)
            }
            const body = await response.text()
            res.send(body)
          } else {
            requestLogger.debug('No response handler found, continuing to next middleware')
            next()
          }
        } catch (error) {
          requestLogger.error('HTTP request error:', error)
          next(error)
        }
      })

      server = createServer(app)

      // Initialize WebSocket servers after HTTP server is created
      logger.debug('Initializing pending WebSocket handlers', { count: pendingWebSocketHandlers.size })
      for (const [path, handler] of pendingWebSocketHandlers) {
        initializeWebSocketServer(path, handler)
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
      server?.close()
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
        initializeWebSocketServer(path, handler)
      } else {
        logger.debug('Server not running, deferring WebSocket handler initialization', { path })
        pendingWebSocketHandlers.set(path, handler)
      }

      return wsServer
    },
  }

  function initializeWebSocketServer<TData = any>(path: string, handler: WebSocketHandler<TData>) {
    logger.debug('Initializing WebSocket server', { path })
    const wsServer = webSocketServers.get(path)!

    // Create WebSocket server for this path
    const wss = new WebSocketServer({
      server,
      path,
    })

    wss.on('connection', async (ws, request) => {
      const connectionId = Math.random().toString(36).substring(2)
      logger.debug('New WebSocket connection', { connectionId, path })
      let connectionData: TData | undefined

      try {
        // Handle connection
        if (handler.onConnection) {
          logger.debug('Handling WebSocket connection', { connectionId })
          connectionData = await handler.onConnection(
            new NodeWebSocketConnection(ws),
            new Request(`http://localhost${request.url}`, {
              method: request.method,
              headers: request.headers as Record<string, string>,
            }),
          )
        }

        const connection = new NodeWebSocketConnection<TData>(ws, connectionData)
        wsServer.addConnection(connectionId, connection)

        // Emit connection event
        wsServer.events.pub({
          t: 'connection',
          connection,
          request: new Request(`http://localhost${request.url}`),
        })

        // Handle messages
        ws.on('message', async (message) => {
          try {
            logger.debug('Received WebSocket message', { connectionId })
            if (handler.onMessage) {
              await handler.onMessage(connection, Buffer.from(message as any))
            }
            wsServer.events.pub({
              t: 'message',
              connection,
              message: Buffer.from(message as any),
            })
          } catch (error) {
            logger.error('WebSocket message error:', error)
          }
        })

        // Handle close
        ws.on('close', async (code, reason) => {
          try {
            logger.debug('WebSocket connection closing', { connectionId, code, reason: reason.toString() })
            if (handler.onClose) {
              await handler.onClose(connection, code, reason.toString())
            }
            wsServer.events.pub({
              t: 'close',
              connection,
              code,
              reason: reason.toString(),
            })
            wsServer.removeConnection(connectionId)
          } catch (error) {
            logger.error('WebSocket close error:', error)
          }
        })

        // Handle errors
        ws.on('error', async (error) => {
          try {
            logger.error('WebSocket error:', { connectionId, error })
            if (handler.onError) {
              await handler.onError(connection, error)
            }
            wsServer.events.pub({
              t: 'error',
              connection,
              error,
            })
          } catch (err) {
            logger.error('WebSocket error handler error:', err)
          }
        })

        // Override subscribe/unsubscribe to manage topic subscriptions
        const originalSubscribe = connection.subscribe.bind(connection)
        const originalUnsubscribe = connection.unsubscribe.bind(connection)

        connection.subscribe = (topic: string) => {
          logger.debug('WebSocket subscribing to topic', { connectionId, topic })
          originalSubscribe(topic)
          wsServer.subscribeToTopic(connectionId, topic)
        }

        connection.unsubscribe = (topic: string) => {
          logger.debug('WebSocket unsubscribing from topic', { connectionId, topic })
          originalUnsubscribe(topic)
          wsServer.unsubscribeFromTopic(connectionId, topic)
        }
      } catch (error) {
        logger.error('WebSocket connection setup error:', error)
        ws.close(1011, 'Internal server error')
      }
    })
  }
}
