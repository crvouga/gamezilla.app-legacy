import { SessionId } from "gamezilla-app/app/@SHARED/data"
import { IDbConnKv } from "gamezilla-app/app/@SHARED/server/db-conn-kv"
import { Task, isOk } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { Client } from "../wire.core"
import { IWireSessionDb } from "./wire-session-db"

export const WireSessionDbKv = ({
  dbConnKv,
}: {
  dbConnKv: IDbConnKv
}): IWireSessionDb => {
  const clientsKv = IDbConnKv.instance(
    dbConnKv,
    ["wire-session-db", "clients-by-session-id"],
    Client,
  )
  const sessionIdsKv = IDbConnKv.instance(
    dbConnKv,
    ["wire-session-db", "session-ids-by-user-id"],
    p.arr(p.custom(SessionId.is, "Invalid session id")),
  )
  return {
    clients: {
      async findBySessionIds(sessionIds) {
        const got = await Promise.all(
          sessionIds.map((sessionId) => clientsKv.get(sessionId)),
        )
        const clients = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(clients)
      },
      async set(sessionId, client) {
        return Task.p(clientsKv.set(sessionId, client), () => Task.ok(null))
      },
    },
    sessionIds: {
      async findByUserIds(userIds) {
        const got = await Promise.all(
          userIds.map((userId) => sessionIdsKv.get(userId)),
        )
        const sessionIds = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(sessionIds)
      },
      async set(userId, sessionId) {
        return Task.p(sessionIdsKv.set(userId, sessionId), () => Task.ok(null))
      },
    },
  }
}
