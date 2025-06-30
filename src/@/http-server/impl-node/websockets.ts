import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { type ILogger } from '~/@/logger'
import { Sub } from '../../sub'
import {
  type IWebSocketConnection,
  type IWebSocketServer,
  type WebSocketEvent,
  type WebSocketHandler,
} from '../interface'

export class NodeWebSocketConnection<TData = any> implements IWebSocketConnection<TData> {
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

export class NodeWebSocketServer implements IWebSocketServer {
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

export function initializeWebSocketServer<TData = any>({
  webSocketServers,
  server,
  logger,
  path,
  handler,
}: {
  webSocketServers: Map<string, NodeWebSocketServer>
  server: Server
  logger: ILogger
  path: string
  handler: WebSocketHandler<TData>
}) {
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
