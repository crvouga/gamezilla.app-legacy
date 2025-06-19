import { Sleep } from '~/@/promise/sleep'
import { Ok } from '~/@/result'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import type { IUserSessionDb } from './interface'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { ILogger } from '~/@/logger'
const userSessions = new Map<string, UserSession>()

export type Config = {
  t: 'in-memory'
  simulateLatency: Sleep
  logger: ILogger
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits: SessionId[] = Array.from(userSessions.values())
        .filter((userSession) => userSession.userId === userId)
        .flatMap((userSession) => (userSession.sessionId ? [userSession.sessionId] : []))
      return Ok(hits)
    },
    async findUserIdBySessionId(sessionId: SessionId) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.sessionId === sessionId)
      return Ok(hits[0]?.userId ?? null)
    },
    async insert(input) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      userSessions.set(input.userSessionId, input)
      return Ok(null)
    },
    async zapByUserId(userId) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.userId === userId)
      for (const hit of hits) {
        userSessions.delete(hit.userSessionId)
      }
      return Ok(null)
    },
    async zapBySessionId(sessionId) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits = Array.from(userSessions.values()).filter((userSession) => userSession.sessionId === sessionId)
      for (const hit of hits) {
        userSessions.delete(hit.userSessionId)
      }
      return Ok(null)
    },
    async query(input) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits: UserSession[] = []
      for (const userSession of userSessions.values()) {
        if (
          (input.whereAnd.userId ? input.whereAnd.userId.equals === userSession.userId : true) &&
          (input.whereAnd.sessionId ? input.whereAnd.sessionId.equals === userSession.sessionId : true) &&
          (input.whereAnd.clientSessionId
            ? input.whereAnd.clientSessionId.equals === userSession.clientSessionId
            : true)
        ) {
          hits.push(userSession)
        }
      }
      hits.sort((a, b) => {
        if (input.order.createdAt === 'asc') {
          return a.createdAt - b.createdAt
        }
        return b.createdAt - a.createdAt
      })
      const sliced = hits.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)
      return Ok({
        items: sliced,
        total: hits.length,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },
    async zapByClientSessionId(clientSessionId) {
      await config.simulateLatency(TimeSpan.milliseconds(100))
      const hits = Array.from(userSessions.values()).filter(
        (userSession) => userSession.clientSessionId === clientSessionId,
      )
      for (const hit of hits) {
        userSessions.delete(hit.userSessionId)
      }
      return Ok(null)
    },
    sub(_input) {
      return Sub.none()
    },
  }
}
