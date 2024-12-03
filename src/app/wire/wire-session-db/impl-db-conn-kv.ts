import { DbConnKv, IDbConnKv } from '~/app/@/server/db-conn-kv'
import { ILogger } from '~/app/@/server/logger'
import { WireSession } from '../wire-session'
import type { IWireSessionDb } from './interface'
import { p } from '~/@/core/parser'
import { SessionId } from '~/app/@/data'
import { isErr, unwrapOr } from '~/@/core'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
}

export const WireSessionDb = (config: Config): IWireSessionDb => {
  const wireSessionBySessionId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['wire-session-db', 'wire-sessions-by-session-id'],
    parser: WireSession
  })

  const indexSessionIdsByUserId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['wire-session-db', 'index-session-ids-by-user-id'],
    parser: p.arr(SessionId)
  })

  return {
    async findBySessionIds(sessionIds) {
      const got = await wireSessionBySessionId.getMany(sessionIds)
      return got
    },

    async findByUserIds(userIds) {
      const sessionIds = unwrapOr(await indexSessionIdsByUserId.getMany(userIds), []).flat()
      const got = await wireSessionBySessionId.getMany(sessionIds)
      return got
    },

    async put(wireSessions) {
      const put = await wireSessionBySessionId.setMany(
        wireSessions.map((wireSession) => [wireSession.sessionId, wireSession])
      )

      if (isErr(put)) {
        return put
      }

      await Promise.all(
        wireSessions.map(async (wireSession) => {
          if (wireSession.userId) {
            const sessionIds = unwrapOr(await indexSessionIdsByUserId.getMany([wireSession.userId]), []).flat()
            if (!sessionIds.includes(wireSession.sessionId)) {
              const sessionIdsNew = [...sessionIds, wireSession.sessionId]
              await indexSessionIdsByUserId.set(wireSession.userId, sessionIdsNew)
            }
          }
        })
      )

      return put
    }
  }
}
