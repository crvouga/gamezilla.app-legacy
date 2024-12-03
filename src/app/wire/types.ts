import type { Posix } from '~/@/core'
import { AppServerCtx } from '../@/server'
import type { ClientTransportEvent } from './transport/client'
import type { IServerTransport, ServerTransportMsg } from './transport/server'
import { IWireSessionDb } from './wire-session-db'
import { ServerInstanceTypes } from './server-instance'
import { RPC } from '~/@/rpc'
import { AnonymousClientCtx, AppClientCtx } from '../@/client'

//
//
//
//
//
//

export type ServerCtx<TMsgToClient, TMsgToServer> = AppServerCtx & {
  wireSessionDb: IWireSessionDb

  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>

  serverInstance: ServerInstanceTypes.ServerCtx
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

type ServerTime = {
  serverNow: Posix
  recordedAt: Posix
}

export type ModelClient = {
  state: State
  serverTime: ServerTime | null
  serverInstance: ServerInstanceTypes.ModelClient
}

export type MsgClient =
  | ClientTransportEvent
  | { t: 'got-server-instance-msg'; c: ServerInstanceTypes.MsgServer }
  //
  | { t: 'clicked-try-reconnect' }
  | { t: 'sent-to-server'; toServer: unknown }

export type MsgServer = ServerTransportMsg | { t: 'got-server-instance-msg'; c: ServerInstanceTypes.MsgServer }

//
//
//
//
//
//

export type MsgToServer = { t: null } | { t: 'got-server-instance-msg'; c: ServerInstanceTypes.MsgToServer }

export type MsgToClient = { t: 'server-restarted' } | { t: 'got-server-instance-msg'; c: ServerInstanceTypes.MsgClient }

//
//
//
//
//

export const rpcContract = RPC.initContract({
  serverInstance: ServerInstanceTypes.rpcContract
})

export type ClientCtx = (AppClientCtx | AnonymousClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}
