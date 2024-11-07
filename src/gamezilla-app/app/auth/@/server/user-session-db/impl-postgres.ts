import { Result, Uuid } from '@/core'
import { p } from '@/core/parser'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import type { IUserSessionDb } from './interface'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'

//
//
//
//
//

export const Row = p.obj({
  session_id: p.custom(SessionId.is, 'Invalid session id'),
  user_id: p.custom(UserId.is, 'Invalid user id')
})

export type Row = p.Infer<typeof Row>

//
//
//
//
//

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const UserSessionDb = ({ dbConnSql, ...config }: Config): IUserSessionDb => {
  const logger = Logger.prefix('user-session-db', config.logger)

  return {
    async findSessionIdsByUserId(userId: UserId) {
      logger.debug(`findSessionIdsByUserId: userId=${userId}`)
      const queried = await dbConnSql.query(
        Row,
        'SELECT * FROM user_session WHERE ended_at IS NULL AND user_id = :user_id',
        {
          user_id: userId
        }
      )

      return Result.mapOk(queried, (rows) => rows.map((row) => row.session_id))
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      logger.debug(`findUserIdBySessionId: sessionId=${sessionId}`)
      const queried = await dbConnSql.query(
        Row,
        'SELECT * FROM user_session WHERE ended_at IS NULL AND session_id = :session_id',
        {
          session_id: sessionId
        }
      )

      return Result.mapOk(queried, (rows) => {
        return rows[0]?.user_id ?? null
      })
    },

    async insert({ sessionId, userId }) {
      const userSessionId = `user-session:${Uuid.generate()}`
      logger.debug(`insert: userSessionId=${userSessionId} sessionId=${sessionId} userId=${userId}`)

      const queried = await dbConnSql.query(
        Row,
        'INSERT INTO user_session (user_session_id, session_id, user_id) VALUES (:user_session_id, :session_id, :user_id)',
        {
          user_session_id: userSessionId,
          session_id: sessionId,
          user_id: userId
        }
      )
      return Result.mapOk(queried, () => null)
    },

    async zapByUserId(userId) {
      logger.debug(`zapByUserId: userId=${userId}`)
      const queried = await dbConnSql.query(
        Row,
        'UPDATE user_session SET ended_at = :ended_at WHERE user_id = :user_id',
        {
          ended_at: new Date().toISOString(),
          user_id: userId
        }
      )
      return Result.mapOk(queried, () => null)
    },

    async zapBySessionId(sessionId) {
      logger.debug(`zapBySessionId: sessionId=${sessionId}`)
      const queried = await dbConnSql.query(
        Row,
        'UPDATE user_session SET ended_at = :ended_at WHERE session_id = :session_id',
        {
          ended_at: new Date().toISOString(),
          session_id: sessionId
        }
      )
      return Result.mapOk(queried, () => null)
    }
  }
}
