import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data"
import { PubSub } from "gamezilla/@SHARED/core/sub"
import { ServerBun } from "gamezilla/@SHARED/server/server-impl-bun"
import { ServerNode } from "gamezilla/@SHARED/server/server-impl-node"

export type ServerTransportMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId }
  | { t: "server-started"; port: number }
  | {
      t: "got-bad-msgs"
      reason: "unknown-msg-type" | "codebase-version-id-mismatch"
      clientId: ClientId
      sessionId: SessionId
      msgs: unknown[]
    }

export type IServerTransport<T extends { MsgToClient: any; MsgToServer: any }> =
  {
    toClient: PubSub<{
      [clientId: ClientId]: {
        clientId: ClientId
        msgs: T["MsgToClient"][]
      }
    }>
    toClientBroadcast: PubSub<T["MsgToClient"][]>
    toServer: PubSub<{
      msgs: T["MsgToServer"][]
      clientId: ClientId
      sessionId: SessionId
    }>
    topicPublish: PubSub<{
      topics: string[]
      msg: T["MsgToClient"]
    }>
    topicSubscribe: PubSub<{
      topics: string[]
      clientId: ClientId
    }>
    wire: PubSub<ServerTransportMsg>
  }

export const initServerTransport = <
  MsgToServer,
  MsgToClient,
>(): IServerTransport<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}> => {
  return {
    toClient: PubSub.create(),
    toClientBroadcast: PubSub.create(),
    toServer: PubSub.create(),
    topicPublish: PubSub.create(),
    topicSubscribe: PubSub.create(),
    wire: PubSub.create(),
  }
}

//
//
//
//
//
//

export type ServerTransportImpl =
  | ServerTransportWebSocketImpl
  | ServerTransportSocketIOImpl

export type ServerTransportWebSocketImpl = {
  t: "bun-web-sockets"
  server: ServerBun
}

export type ServerTransportSocketIOImpl = {
  t: "socket-io"
  server: ServerNode
}
