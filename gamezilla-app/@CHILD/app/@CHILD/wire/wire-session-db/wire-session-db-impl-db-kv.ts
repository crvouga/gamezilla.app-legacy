import { SessionId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Task, isOk } from "gamezilla-app/@SHARED/core"
import { P } from "gamezilla-app/@SHARED/parsing"
import { isClient } from "../wire.core"
import { IWireSessionDb } from "./wire-session-db"

const toKeyClientsBySessionId = (sessionId: SessionId) =>
  `wire-session-db:clients-by-session-id:${sessionId}`

const toKeySessionIdsByUserId = (userId: UserId) =>
  `wire-session-db:session-ids-by-user-id:${userId}`

export const WireSessionDbKv = ({
  dbConnKv,
}: {
  dbConnKv: DbConnKv
}): IWireSessionDb => {
  return {
    clients: {
      async findBySessionIds(sessionIds) {
        const got = await Promise.all(
          sessionIds.map((sessionId) =>
            dbConnKv.get(P.arr(isClient), toKeyClientsBySessionId(sessionId)),
          ),
        )
        const clients = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(clients)
      },
      async set(sessionId, client) {
        return Task.p(
          dbConnKv.set(toKeyClientsBySessionId(sessionId), client),
          () => Task.ok(null),
        )
      },
    },
    sessionIds: {
      async findByUserIds(userIds) {
        const got = await Promise.all(
          userIds.map((userId) =>
            dbConnKv.get(P.arr(SessionId.is), toKeySessionIdsByUserId(userId)),
          ),
        )
        const sessionIds = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(sessionIds)
      },
      async set(userId, sessionId) {
        return Task.p(
          dbConnKv.set(toKeySessionIdsByUserId(userId), sessionId),
          () => Task.ok(null),
        )
      },
    },
  }
}
