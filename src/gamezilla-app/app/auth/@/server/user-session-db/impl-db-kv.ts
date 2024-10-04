import { Result } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
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

export const UserSessionDbKV = (input: { dbConn: IDbConnKv }): IUserSessionDb => {
  const sessionIdsByUserId = DbConnKv.withNamespace(
    input.dbConn,
    ['auth-session', 'session-ids-by-user-id'],
    p.arr(SessionId)
  )
  const userIdBySessionId = DbConnKv.withNamespace(input.dbConn, ['auth-session', 'user-id-by-session-id'], UserId)

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
