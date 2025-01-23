import { Result, isOk } from '~/@/result'
import { p } from '~/@/parser'
import { SessionId } from '~/app/@/data/session-id'
import { UserId } from '~/app/@/data/user-id'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { IUserSessionDb } from './interface'

//
//
//
//
//

export type Config = {
  keyValueDb: IKeyValueDb
  userSessionDb: IUserSessionDb
}

export const WithCache = ({ userSessionDb, keyValueDb }: Config): IUserSessionDb => {
  const userIdBySessionId = KeyValueDb.withNamespace<SessionId, UserId>({
    keyValueDb,
    namespace: ['auth-session', 'user-id-by-session-id'],
    parser: UserId,
  })

  const sessionIdsByUserId = KeyValueDb.withNamespace<UserId, SessionId[]>({
    keyValueDb,
    namespace: ['auth-session', 'session-ids-by-user-id'],
    parser: p.arr(SessionId),
  })

  return {
    async findSessionIdsByUserId(userId: UserId) {
      const cachedSessionIds = Result.unwrapOr(await sessionIdsByUserId.get(userId), []) ?? []

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
      const cachedUserId = Result.unwrapOr(await userIdBySessionId.get(sessionId), null)

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
        userId,
      })

      if (isOk(queried)) {
        await userIdBySessionId.set(sessionId, userId)
        const cachedSessionIds = Result.unwrapOr(await sessionIdsByUserId.get(userId), [])
        if (cachedSessionIds) {
          await sessionIdsByUserId.set(userId, [...cachedSessionIds, sessionId])
        }
      }

      return queried
    },

    async zapByUserId(userId) {
      const queried = await userSessionDb.zapByUserId(userId)

      if (isOk(queried)) {
        const sessionIds = Result.unwrapOr(await sessionIdsByUserId.get(userId), []) ?? []

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
        const userId = Result.unwrapOr(await userIdBySessionId.get(sessionId), null)
        await userIdBySessionId.zap(sessionId)

        if (userId) {
          await sessionIdsByUserId.zap(userId)
        }
      }

      return queried
    },
  }
}
