import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import type { Posix } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { ClientId, SessionId } from '../@/data'
import type { ClientTransportEvent } from './transport-client'
import type { IServerTransport, ServerTransportMsg } from './transport-server'
import { IWireSessionDb } from './wire-session-db'
import { AppServerCtx } from '../@/server'

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

export type ModelClient = {
  state:
    | { t: 'server-connecting' }
    | {
        t: 'server-connect-error'
        errorCount: number
      }
    | { t: 'server-disconnected' }
    | { t: 'server-connected' }

  serverTime: {
    serverNow: Posix
    recordedAt: Posix
  } | null
}

export type MsgClient =
  | ClientTransportEvent
  //
  | { t: 'clicked-try-reconnect' }
  | { t: 'sent-to-server'; toServer: unknown }

const clientId = p.custom(ClientId.is, 'Invalid client id')

export const Client = p.obj({
  sessionId: p.custom(SessionId.is, 'Invalid session id'),
  clientIds: CappedOrderedDict.parser(clientId, clientId)
})

export type Client = p.Infer<typeof Client>

export type MsgServer = ServerTransportMsg

//
//
//
//
//
//

export type MsgToServer = { t: null }

export type MsgToClient = { t: 'server-restarted' }
