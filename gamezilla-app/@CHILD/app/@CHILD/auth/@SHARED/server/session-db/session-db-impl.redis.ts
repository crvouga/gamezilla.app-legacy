import { SessionId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Result } from "gamezilla-app/@SHARED/core"
import { p, P1 } from "gamezilla-app/@SHARED/parsing"
import { ISessionDb } from "./session-db"

//
//
//
//
//

export const isRow = p.obj({
  session_id: p.str,
  user_id: p.str,
})

export type Row = p.Infer<typeof isRow>

//
//
//
//
//

export const SessionDbPostgres = ({
  dbConn,
}: {
  dbConn: DbConnKv
}): ISessionDb => {
  const sessionIdsByUserId = DbConnKv.instance(
    dbConn,
    ["auth-session", "session-ids-by-user-id"],
    P1.arr(SessionId.is),
  )
  const userIdBySessionId = DbConnKv.instance(
    dbConn,
    ["auth-session", "user-id-by-session-id"],
    UserId.is,
  )

  return {
    async findSessionIdsByUserId(userId: UserId) {
      const got = await sessionIdsByUserId.get(userId)
      return Result.mapOk(got, (sessionIds) => sessionIds ?? [])
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const got = await userIdBySessionId.get(sessionId)
      return Result.mapOk(got, (userId) => userId ?? null)
    },

    async insert(_input) {
      return Result.err("not implemented")
    },

    async zapByUserId(_userId) {
      return Result.err("not implemented")
    },

    async zapBySessionId(_sessionId) {
      return Result.err("not implemented")
    },
  }
}
