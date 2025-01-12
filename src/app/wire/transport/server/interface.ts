import { PubSub } from '~/@/sub'
import type { ClientId } from '~/app/@/data/client-id'
import type { SessionId } from '~/app/@/data/session-id'

export type BackendTransportMsg =
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

export type ToBackendPayload<TMsgToBackend> = {
  msgs: TMsgToBackend[]
  clientId: ClientId
  sessionId: SessionId
}

export type IBackendTransport<T extends { MsgToClient: any; MsgToBackend: any }> = {
  toClient: PubSub<ToClientPayload<T['MsgToClient']>>
  toClientBroadcast: PubSub<T['MsgToClient'][]>
  fromClient: PubSub<ToBackendPayload<T['MsgToBackend']>>
  wire: PubSub<BackendTransportMsg>
}

export const initBackendTransport = <MsgToBackend, MsgToClient>(): IBackendTransport<{
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
}> => {
  return {
    toClient: PubSub.create(),
    toClientBroadcast: PubSub.create(),
    fromClient: PubSub.create(),
    wire: PubSub.create(),
  }
}
