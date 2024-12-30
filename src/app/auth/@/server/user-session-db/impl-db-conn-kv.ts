import { Result } from '~/@/result'
import { p } from '~/@/parser'
import { SessionId } from '~/app/@/data/session-id'
import { UserId } from '~/app/@/data/user-id'
import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import type { IUserSessionDb } from './interface'

//
//
//
//
//

export const isRow = p.obj({
  session_id: p.str,
  user_id: p.str
})

export type Row = p.Infer<typeof isRow>

//
//
//
//
//

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  const sessionIdsByUserId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['auth-session', 'session-ids-by-user-id'],
    parser: p.arr(SessionId)
  })
  const userIdBySessionId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['auth-session', 'user-id-by-session-id'],
    parser: UserId
  })

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
      return Result.Err('not implemented')
    },

    async zapByUserId(_userId) {
      return Result.Err('not implemented')
    },

    async zapBySessionId(_sessionId) {
      return Result.Err('not implemented')
    }
  }
}
