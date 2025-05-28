import { RPC } from '~/@/wire-rpc'
import { Posix } from '~/@/time/posix'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../@/frontend/ctx'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendInstanceTypes } from './backend-instance'
import type { FrontendTransportEvent } from './transport/frontend'
import type { IBackendTransport, BackendTransportMsg } from './transport/backend'
import { IWireSessionDb } from './wire-session-db'

//
//
//
//
//
//

export type BackendCtx<TMsgToFrontend, TMsgToBackend> = AppBackendCtx & {
  wireSessionDb: IWireSessionDb
  transport: IBackendTransport<{
    MsgToFrontend: TMsgToFrontend
    MsgToBackend: TMsgToBackend
  }>
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

export type FrontendCtx = (AppFrontendCtx | AnonymousFrontendCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}
