import type { Posix } from 'gamezilla-app/@/core'
import { AppServerCtx } from '../@/server'
import type { ClientTransportEvent } from './transport/client'
import type { IServerTransport, ServerTransportMsg } from './transport/server'
import { IWireSessionDb } from './wire-session-db'

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
}

export type MsgClient =
  | ClientTransportEvent
  //
  | { t: 'clicked-try-reconnect' }
  | { t: 'sent-to-server'; toServer: unknown }

export type MsgServer = ServerTransportMsg

//
//
//
//
//
//

export type MsgToServer = { t: null }

export type MsgToClient = { t: 'server-restarted' }
