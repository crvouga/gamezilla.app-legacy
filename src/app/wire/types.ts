import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AnonymousClientCtx, AppClientCtx } from '../@/client/ctx'
import { AppBackendCtx } from '../@/server/ctx'
import { BackendInstanceTypes } from './server-instance'
import type { ClientTransportEvent } from './transport/client'
import type { IBackendTransport, BackendTransportMsg } from './transport/server'
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
  serverInstance: BackendInstanceTypes.BackendCtx
}

type State =
  | {
      t: 'server-connecting'
    }
  | {
      t: 'server-connect-error'
      errorCount: number
    }
  | {
      t: 'server-disconnected'
    }
  | {
      t: 'server-connected'
    }

type BackendTime = {
  serverNow: Posix
  recordedAt: Posix
}

export type ModelClient = {
  state: State
  serverTime: BackendTime | null
  serverInstance: BackendInstanceTypes.ModelClient
}

export type MsgClient =
  | ClientTransportEvent
  | { t: 'got-server-instance-msg'; c: BackendInstanceTypes.MsgBackend }
  //
  | { t: 'clicked-try-reconnect' }
  | { t: 'sent-to-server'; toBackend: unknown }

export type MsgBackend = BackendTransportMsg | { t: 'got-server-instance-msg'; c: BackendInstanceTypes.MsgBackend }

//
//
//
//
//
//

export type MsgToBackend = { t: null } | { t: 'got-server-instance-msg'; c: BackendInstanceTypes.MsgToBackend }

export type MsgToClient =
  | { t: 'server-restarted' }
  | { t: 'got-server-instance-msg'; c: BackendInstanceTypes.MsgClient }

//
//
//
//
//

export const rpcContract = RPC.initContract({
  serverInstance: BackendInstanceTypes.rpcContract,
})

export type ClientCtx = (AppClientCtx | AnonymousClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}
