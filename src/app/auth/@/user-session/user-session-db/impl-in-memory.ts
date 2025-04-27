import { Sleep } from '~/@/promise/sleep'
import { Ok } from '~/@/result'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import type { IUserSessionDb } from './interface'

const userSessions = new Map<string, UserSession>()

export type Config = {
  t: 'in-memory'
  simulateLatency: Sleep
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      await config.simulateLatency()
      const hits: SessionId[] = Array.from(userSessions.values())
        .filter((userSession) => userSession.userId === userId)
        .map((userSession) => userSession.sessionId)
      return Ok(hits)
    },
    async findUserIdBySessionId(sessionId: SessionId) {
      await config.simulateLatency()
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.sessionId === sessionId)
      return Ok(hits[0]?.userId ?? null)
    },
    async insert(input) {
      await config.simulateLatency()
      userSessions.set(input.userSessionId, input)
      return Ok(null)
    },
    async zapByUserId(userId) {
      await config.simulateLatency()
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.userId === userId)
      for (const hit of hits) {
        userSessions.delete(hit.userSessionId)
      }
      return Ok(null)
    },
    async zapBySessionId(sessionId) {
      await config.simulateLatency()
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.sessionId === sessionId)
      for (const hit of hits) {
        userSessions.delete(hit.userSessionId)
      }
      return Ok(null)
    },
    async query(input) {
      await config.simulateLatency()
      const hits: UserSession[] = []
      for (const userSession of userSessions.values()) {
        if (
          (input.where.userId ? input.where.userId.equals === userSession.userId : true) &&
          (input.where.sessionId ? input.where.sessionId.equals === userSession.sessionId : true)
        ) {
          hits.push(userSession)
        }
      }
      const sliced = hits.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)
      return Ok({
        items: sliced,
        total: hits.length,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },
  }
}
