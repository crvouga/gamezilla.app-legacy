import { SessionId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Result, isOk } from "gamezilla-app/@SHARED/core"
import { ISessionDb } from "./session-db"
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { P } from "gamezilla-app/@SHARED/parsing"

//
//
//
//
//

export const SessionDbWithDbKvCache = ({
  SessionDb,
  dbConnKv,
}: {
  dbConnKv: DbConnKv
  SessionDb: ISessionDb
}): ISessionDb => {
  const userIdBySessionId = DbConnKv.instance<SessionId, UserId>(
    dbConnKv,
    ["auth-session", "user-id-by-session-id"],
    UserId.is,
  )

  const sessionIdsByUserId = DbConnKv.instance<UserId, SessionId[]>(
    dbConnKv,
    ["auth-session", "session-ids-by-user-id"],
    P.arr(SessionId.is),
  )

  return {
    async findSessionIdsByUserId(userId: UserId) {
      const cachedSessionIds =
        Result.withDefault(await sessionIdsByUserId.get(userId), []) ?? []

      if (cachedSessionIds && cachedSessionIds.length > 0) {
        return Result.ok(cachedSessionIds)
      }

      const queried = await SessionDb.findSessionIdsByUserId(userId)

      if (isOk(queried)) {
        sessionIdsByUserId.set(userId, queried.value)
      }

      return queried
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const cachedUserId = Result.withDefault(
        await userIdBySessionId.get(sessionId),
        null,
      )

      if (cachedUserId) {
        return Result.ok(cachedUserId)
      }

      const queried = await SessionDb.findUserIdBySessionId(sessionId)

      if (isOk(queried) && queried.value) {
        userIdBySessionId.set(sessionId, queried.value)
      }

      return queried
    },

    async insert({ sessionId, userId }) {
      const queried = await SessionDb.insert({ sessionId, userId })

      if (isOk(queried)) {
        await userIdBySessionId.set(sessionId, userId)
        const cachedSessionIds = Result.withDefault(
          await sessionIdsByUserId.get(userId),
          [],
        )
        if (cachedSessionIds) {
          await sessionIdsByUserId.set(userId, [...cachedSessionIds, sessionId])
        }
      }

      return queried
    },

    async zapByUserId(userId) {
      const queried = await SessionDb.zapByUserId(userId)

      if (isOk(queried)) {
        const sessionIds =
          Result.withDefault(await sessionIdsByUserId.get(userId), []) ?? []

        await sessionIdsByUserId.zap(userId)

        for (const sessionId of sessionIds) {
          await userIdBySessionId.zap(sessionId)
        }
      }

      return queried
    },

    async zapBySessionId(sessionId) {
      const queried = await SessionDb.zapBySessionId(sessionId)

      if (isOk(queried)) {
        const userId = Result.withDefault(
          await userIdBySessionId.get(sessionId),
          null,
        )
        await userIdBySessionId.zap(sessionId)

        if (userId) {
          await sessionIdsByUserId.zap(userId)
        }
      }

      return queried
    },
  }
}
