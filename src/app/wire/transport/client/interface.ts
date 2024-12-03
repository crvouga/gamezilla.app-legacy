import { PubSub } from '@/core/sub'

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

export type IClientTransport<T extends { MsgToClient: any; MsgToServer: any }> = {
  toServer: PubSub<T['MsgToServer'][]>
  fromServer: PubSub<T['MsgToClient'][]>
  msgEvt: PubSub<ClientTransportEvent>
  msgCmd: PubSub<ClientTransportCommand>
  start: () => Promise<void>
}

export const initClientTransport = <MsgToServer, MsgToClient>(): IClientTransport<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}> => {
  return {
    fromServer: PubSub.create(),
    toServer: PubSub.create(),
    msgEvt: PubSub.create(),
    msgCmd: PubSub.create(),
    start: async () => {}
  }
}
