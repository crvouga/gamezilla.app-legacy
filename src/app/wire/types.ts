import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AnonymousClientCtx, AppClientCtx } from '../@/client/ctx'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendInstanceTypes } from './backend-instance'
import type { ClientTransportEvent } from './transport/client'
import type { IBackendTransport, BackendTransportMsg } from './transport/backend'
import { IWireSessionDb } from './wire-session-db'

//
//
//
//
//
//

export type BackendCtx<TMsgToClient, TMsgToBackend> = AppBackendCtx & {
  wireSessionDb: IWireSessionDb
  transport: IBackendTransport<{
    MsgToClient: TMsgToClient
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

export type ModelClient = {
  state: State
  backendTime: BackendTime | null
  backendInstance: BackendInstanceTypes.ModelClient
}

export type MsgClient =
  | ClientTransportEvent
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

export type MsgToClient =
  | { t: 'backend-restarted' }
  | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgClient }

//
//
//
//
//

export const rpcContract = RPC.initContract({
  backendInstance: BackendInstanceTypes.rpcContract,
})

export type ClientCtx = (AppClientCtx | AnonymousClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}
