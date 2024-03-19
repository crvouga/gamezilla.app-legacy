import { Posix } from "gamezilla-app/@SHARED/core"
import { CappedOrderedDict } from "gamezilla-app/@SHARED/data-structures/capped-ordered-dict"
import { P1 } from "gamezilla-app/@SHARED/parsing"
import { ClientId, SessionId } from "../../@SHARED/data"
import { ClientTransportEvent } from "./transport-client"
import { ServerTransportMsg } from "./transport-server"

//
//
//
//
//
//

export type ModelClient = {
  state:
    | { t: "server-connecting" }
    | { t: "server-connect-error"; errorCount: number }
    | { t: "server-disconnected" }
    | { t: "server-connected" }

  serverTime: {
    serverNow: Posix
    recordedAt: Posix
  } | null
}

export type MsgClient = ClientTransportEvent | { t: "clicked-try-reconnect" }

export type ModelServer = null

export type Client = {
  sessionId: SessionId
  clientIds: CappedOrderedDict<ClientId, ClientId>
}

export const toClient = (x: unknown): Client | null => {
  if (
    P1.obj(x) &&
    P1.has(x, "sessionId", SessionId.is) &&
    P1.has(x, "clientIds", CappedOrderedDict.is(ClientId.is, ClientId.is))
  ) {
    return x
  }
  return null
}

export const isClient = P1.is(toClient)

export type MsgServer = ServerTransportMsg

//
//
//
//
//
//

export type MsgToServer = { t: null }

export type MsgToClient = { t: "server-restarted" }
