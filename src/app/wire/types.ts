import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AppBackendCtx } from '../@/backend/ctx'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendInstanceTypes } from './backend-instance'
import type { BackendTransportMsg } from './transport/backend'
import type { FrontendTransportEvent } from './transport/frontend'
import { IWireSessionDb } from './wire-session-db'
import { Topic } from '~/@/topic'
import { s } from '~/@/schema'

//
//
//
//
//
//

export type BackendCtx = AppBackendCtx & {
  wireSessionDb: IWireSessionDb
  backendInstance: BackendInstanceTypes.BackendCtx
}

type State =
  | {
      t: 'backend-connecting'
    }
  | {
      t: 'backend-connect-error'
      errorCount: number
    }
  | {
      t: 'backend-disconnected'
    }
  | {
      t: 'backend-connected'
    }

type BackendTime = {
  backendNow: Posix
  recordedAt: Posix
}

export type ModelFrontend = {
  state: State
  backendTime: BackendTime | null
  backendInstance: BackendInstanceTypes.ModelFrontend
}

export type MsgFrontend =
  | FrontendTransportEvent
  | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgBackend }
  //
  | { t: 'clicked-try-reconnect' }
  | { t: 'sent-to-backend'; toBackend: unknown }

export type MsgBackend = BackendTransportMsg | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgBackend }

//
//
//
//
//
//

export type MsgToBackend = { t: null } | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgToBackend }

export type MsgToFrontend =
  | { t: 'backend-restarted' }
  | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgFrontend }

//
//
//
//
//

export const rpcContract = RPC.initContract({
  backendInstance: BackendInstanceTypes.rpcContract,
})

export const topic = Topic.initContract({
  ping: {
    params: s.l(null),
    msg: s.obj({
      id: s.str(),
    }),
  },
  pong: {
    params: s.l(null),
    msg: s.obj({
      id: s.str(),
    }),
  },
})

export type FrontendCtxModule = AppFrontendCtxBase & {
  rpc: RPC.Client<typeof rpcContract>
}
