import { PubSub } from '~/@/sub'

export type ClientTransportEvent =
  | {
      t: 'server-connected'
    }
  | {
      t: 'server-disconnected'
    }
  | {
      t: 'server-connect-error'
    }
  | {
      t: 'got-bad-msgs'
      reason: 'codebase-version-mismatch'
    }

export type ClientTransportCommand = { t: 'try-reconnect' }

export type IClientTransport<T extends { MsgToClient: any; MsgToBackend: any }> = {
  toBackend: PubSub<T['MsgToBackend'][]>
  fromBackend: PubSub<T['MsgToClient'][]>
  msgEvt: PubSub<ClientTransportEvent>
  msgCmd: PubSub<ClientTransportCommand>
  start: () => Promise<void>
}

export const initClientTransport = <MsgToBackend, MsgToClient>(): IClientTransport<{
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
}> => {
  return {
    fromBackend: PubSub.create(),
    toBackend: PubSub.create(),
    msgEvt: PubSub.create(),
    msgCmd: PubSub.create(),
    start: async () => {},
  }
}
