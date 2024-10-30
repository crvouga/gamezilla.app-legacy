import { Task, isOk } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { SessionId } from 'gamezilla-app/app/@/data'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { Client } from '../wire.types'
import type { IWireSessionDb } from './interface'
import { ILogger } from 'gamezilla-app/app/@/server/logger'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
}

export const WireSessionDb = ({ dbConnKv }: Config): IWireSessionDb => {
  const clientsKv = DbConnKv.withNamespace({
    dbConnKv,
    namespace: ['wire-session-db', 'clients-by-session-id'],
    parser: Client
  })
  const sessionIdsKv = DbConnKv.withNamespace({
    dbConnKv,
    namespace: ['wire-session-db', 'session-ids-by-user-id'],
    parser: p.arr(p.custom(SessionId.is, 'Invalid session id'))
  })
  return {
    clients: {
      async findBySessionIds(sessionIds) {
        const got = await Promise.all(sessionIds.map((sessionId) => clientsKv.get(sessionId)))
        const clients = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(clients)
      },
      async set(sessionId, client) {
        return Task.p(clientsKv.set(sessionId, client), () => Task.ok(null))
      }
    },
    sessionIds: {
      async findByUserIds(userIds) {
        const got = await Promise.all(userIds.map((userId) => sessionIdsKv.get(userId)))
        const sessionIds = got.flatMap((x) => (isOk(x) ? x.value ?? [] : []))
        return Task.ok(sessionIds)
      },
      async set(userId, sessionId) {
        return Task.p(sessionIdsKv.set(userId, sessionId), () => Task.ok(null))
      }
    }
  }
}
