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
      const app = express()
      const respond = createRespond(middlewares, responds)

      // Handle HTTP requests
      app.use(async (req, res, next) => {
        try {
          const request = new Request(`http://localhost:${port}${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
          })

          const response = await respond(request, server)
          if (response) {
            res.status(response.status)
            for (const [key, value] of response.headers.entries()) {
              res.set(key, value)
            }
            const body = await response.text()
            res.send(body)
          } else {
            next()
          }
        } catch (error) {
          logger.error('HTTP request error:', error)
          next(error)
        }
      })

      server = createServer(app)

      // Initialize WebSocket servers after HTTP server is created
      for (const [path, handler] of pendingWebSocketHandlers) {
        initializeWebSocketServer(path, handler)
      }
      pendingWebSocketHandlers.clear()

      server.listen(port, () => {
        logger.info(`Listening on port ${port}`)
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
      events.pub({ t: 'stopped' })
      return new Promise<void>((resolve) => {
        server?.close()
        resolve()
      })
    },
    registerRespond(respond) {
      responds.push(respond)
    },
    registerMiddleware(middleware) {
      middlewares.push(middleware)
    },
    registerWebSocketHandler<TData = any>(path: string, handler: WebSocketHandler<TData>): IWebSocketServer {
      const wsServer = new NodeWebSocketServer()
      webSocketServers.set(path, wsServer)

      if (server) {
        // Server is already running, initialize immediately
        initializeWebSocketServer(path, handler)
      } else {
        // Server not started yet, defer initialization
        pendingWebSocketHandlers.set(path, handler)
      }

      return wsServer
    },
  }

  function initializeWebSocketServer<TData = any>(path: string, handler: WebSocketHandler<TData>) {
    const wsServer = webSocketServers.get(path)!

    // Create WebSocket server for this path
    const wss = new WebSocketServer({
      server,
      path,
    })

    wss.on('connection', async (ws, request) => {
      const connectionId = Math.random().toString(36).substring(2)
      let connectionData: TData | undefined

      try {
        // Handle connection
        if (handler.onConnection) {
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
          originalSubscribe(topic)
          wsServer.subscribeToTopic(connectionId, topic)
        }

        connection.unsubscribe = (topic: string) => {
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
