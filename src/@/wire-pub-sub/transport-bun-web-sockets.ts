import { ILogger } from '@powersync/web'
import { HttpServerBun } from '../http-server/impl-bun'
import { ServerWebSocket } from 'bun'
import { ClientId } from '../wire/client-id'
import { SessionId } from '../wire/session-id'
import { ClientSessionId } from '../wire/client-session-id'

export type Config = {
  t: 'bun-web-sockets'
  httpServer: HttpServerBun
  logger: ILogger
}

type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export const TransportBunWebSockets = (_config: Config) => {
  const clients = new Map<ClientId, ServerWebSocket<BackendWebSocketData>>()
  console.log(clients)
  return {
    subscribe: () => {},
    publish: () => {},
  }
}
