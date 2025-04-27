import { PubSub } from '~/@/sub'
import type { ClientId } from '~/@/wire/client-id'
import type { SessionId } from '~/@/wire/session-id'

export type BackendTransportMsg =
  | {
      t: 'frontend-connected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'frontend-disconnected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'backend-started'
      port: number
    }
  | {
      t: 'got-bad-msgs'
      reason: 'unknown-msg-type' | 'codebase-version-id-mismatch'
      clientId: ClientId
      sessionId: SessionId
      msgs: unknown[]
    }

export type ToFrontendPayload<TMsgToFrontend> = {
  [clientId: ClientId]: {
    clientId: ClientId
    msgs: TMsgToFrontend[]
  }
}

export type ToBackendPayload<TMsgToBackend> = {
  msgs: TMsgToBackend[]
  clientId: ClientId
  sessionId: SessionId
}

export type IBackendTransport<T extends { MsgToFrontend: any; MsgToBackend: any }> = {
  toFrontend: PubSub<ToFrontendPayload<T['MsgToFrontend']>>
  toFrontendBroadcast: PubSub<T['MsgToFrontend'][]>
  fromFrontend: PubSub<ToBackendPayload<T['MsgToBackend']>>
  wire: PubSub<BackendTransportMsg>
}

export const initBackendTransport = <MsgToBackend, MsgToFrontend>(): IBackendTransport<{
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
}> => {
  return {
    toFrontend: PubSub.create(),
    toFrontendBroadcast: PubSub.create(),
    fromFrontend: PubSub.create(),
    wire: PubSub.create(),
  }
}
