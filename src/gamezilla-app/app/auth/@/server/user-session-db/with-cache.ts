import { Result, isOk } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import type { IUserSessionDb } from './interface'

//
//
//
//
//

export type Config = {
  dbConnKv: IDbConnKv
  userSessionDb: IUserSessionDb
}

export const WithCache = ({ userSessionDb, dbConnKv }: Config): IUserSessionDb => {
  const userIdBySessionId = DbConnKv.withNamespace<SessionId, UserId>(
    dbConnKv,
    ['auth-session', 'user-id-by-session-id'],
    UserId
  )

  const sessionIdsByUserId = DbConnKv.withNamespace<UserId, SessionId[]>(
    dbConnKv,
    ['auth-session', 'session-ids-by-user-id'],
    p.arr(SessionId)
  )

  return {
    async findSessionIdsByUserId(userId: UserId) {
      const cachedSessionIds = Result.withDefault(await sessionIdsByUserId.get(userId), []) ?? []

      if (cachedSessionIds && cachedSessionIds.length > 0) {
        return Result.Ok(cachedSessionIds)
      }

      const queried = await userSessionDb.findSessionIdsByUserId(userId)

      if (isOk(queried)) {
        await sessionIdsByUserId.set(userId, queried.value)
      }

      return queried
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const cachedUserId = Result.withDefault(await userIdBySessionId.get(sessionId), null)

      if (cachedUserId) {
        return Result.Ok(cachedUserId)
      }

      const queried = await userSessionDb.findUserIdBySessionId(sessionId)

      if (isOk(queried) && queried.value) {
        await userIdBySessionId.set(sessionId, queried.value)
      }

      return queried
    },

    async insert({ sessionId, userId }) {
      const queried = await userSessionDb.insert({
        sessionId,
        userId
      })

      if (isOk(queried)) {
        await userIdBySessionId.set(sessionId, userId)
        const cachedSessionIds = Result.withDefault(await sessionIdsByUserId.get(userId), [])
        if (cachedSessionIds) {
          await sessionIdsByUserId.set(userId, [...cachedSessionIds, sessionId])
        }
      }

      return queried
    },

    async zapByUserId(userId) {
      const queried = await userSessionDb.zapByUserId(userId)

      if (isOk(queried)) {
        const sessionIds = Result.withDefault(await sessionIdsByUserId.get(userId), []) ?? []

        await sessionIdsByUserId.zap(userId)

        for (const sessionId of sessionIds) {
          await userIdBySessionId.zap(sessionId)
        }
      }

      return queried
    },

    async zapBySessionId(sessionId) {
      const queried = await userSessionDb.zapBySessionId(sessionId)

      if (isOk(queried)) {
        const userId = Result.withDefault(await userIdBySessionId.get(sessionId), null)
        await userIdBySessionId.zap(sessionId)

        if (userId) {
          await sessionIdsByUserId.zap(userId)
        }
      }

      return queried
    }
  }
}
