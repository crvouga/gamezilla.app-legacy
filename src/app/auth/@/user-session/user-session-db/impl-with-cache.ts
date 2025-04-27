import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { p } from '~/@/parser'
import { Result, isOk } from '~/@/result'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
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
    namespace: ['auth', 'user-session', 'user-id-by-session-id'],
    parser: UserId,
  })

  const sessionIdsByUserId = KeyValueDb.withNamespace<UserId, SessionId[]>({
    keyValueDb,
    namespace: ['auth', 'user-session', 'session-ids-by-user-id'],
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

    async insert(userSession) {
      const queried = await userSessionDb.insert(userSession)

      if (isOk(queried) && userSession.sessionId) {
        await userIdBySessionId.set(userSession.sessionId, userSession.userId)
        const cachedSessionIds = Result.unwrapOr(await sessionIdsByUserId.get(userSession.userId), [])
        if (cachedSessionIds) {
          await sessionIdsByUserId.set(userSession.userId, [...cachedSessionIds, userSession.sessionId])
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

    async query(input) {
      return userSessionDb.query(input)
    },

    sub(input) {
      return userSessionDb.sub(input)
    },
  }
}
