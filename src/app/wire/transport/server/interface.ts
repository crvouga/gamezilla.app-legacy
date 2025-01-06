import { PubSub } from '~/@/sub'
import type { ClientId } from '~/app/@/data/client-id'
import type { SessionId } from '~/app/@/data/session-id'

export type ServerTransportMsg =
  | {
      t: 'client-connected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'client-disconnected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'server-started'
      port: number
    }
  | {
      t: 'got-bad-msgs'
      reason: 'unknown-msg-type' | 'codebase-version-id-mismatch'
      clientId: ClientId
      sessionId: SessionId
      msgs: unknown[]
    }

export type ToClientPayload<TMsgToClient> = {
  [clientId: ClientId]: {
    clientId: ClientId
    msgs: TMsgToClient[]
  }
}

export type ToServerPayload<TMsgToServer> = {
  msgs: TMsgToServer[]
  clientId: ClientId
  sessionId: SessionId
}

export type IServerTransport<T extends { MsgToClient: any; MsgToServer: any }> = {
  toClient: PubSub<ToClientPayload<T['MsgToClient']>>
  toClientBroadcast: PubSub<T['MsgToClient'][]>
  fromClient: PubSub<ToServerPayload<T['MsgToServer']>>
  wire: PubSub<ServerTransportMsg>
}

export const initServerTransport = <MsgToServer, MsgToClient>(): IServerTransport<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}> => {
  return {
    toClient: PubSub.create(),
    toClientBroadcast: PubSub.create(),
    fromClient: PubSub.create(),
    wire: PubSub.create(),
  }
}
