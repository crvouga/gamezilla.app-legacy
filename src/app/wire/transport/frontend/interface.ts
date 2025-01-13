import { PubSub } from '~/@/sub'

export type FrontendTransportEvent =
  | {
      t: 'backend-connected'
    }
  | {
      t: 'backend-disconnected'
    }
  | {
      t: 'backend-connect-error'
    }
  | {
      t: 'got-bad-msgs'
      reason: 'codebase-version-mismatch'
    }

export type FrontendTransportCommand = { t: 'try-reconnect' }

export type IFrontendTransport<T extends { MsgToFrontend: any; MsgToBackend: any }> = {
  toBackend: PubSub<T['MsgToBackend'][]>
  fromBackend: PubSub<T['MsgToFrontend'][]>
  msgEvt: PubSub<FrontendTransportEvent>
  msgCmd: PubSub<FrontendTransportCommand>
  start: () => Promise<void>
}

export const initFrontendTransport = <MsgToBackend, MsgToFrontend>(): IFrontendTransport<{
  MsgToFrontend: MsgToFrontend
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
