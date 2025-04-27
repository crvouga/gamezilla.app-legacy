import { Result } from '~/@/result'
import { p } from '~/@/parser'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import type { IDbConnSql } from '~/@/db-conn-sql'
import type { IUserSessionDb } from './interface'
import { ILogger, Logger } from '~/@/logger'
import { Uuid } from '~/@/uuid/uuid'

//
//
//
//
//

export const Row = p.obj({
  session_id: SessionId,
  user_id: UserId,
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
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'SELECT * FROM user_session WHERE ended_at IS NULL AND user_id = :user_id',
        vars: {
          user_id: userId,
        },
      })

      return Result.mapOk(queried, (rows) => rows.map((row) => row.session_id))
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      logger.debug(`findUserIdBySessionId: sessionId=${sessionId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'SELECT * FROM user_session WHERE ended_at IS NULL AND session_id = :session_id',
        vars: {
          session_id: sessionId,
        },
      })

      return Result.mapOk(queried, (rows) => {
        return rows[0]?.user_id ?? null
      })
    },

    async insert({ sessionId, userId }) {
      const userSessionId = `user-session:${Uuid.generate()}`
      logger.debug(`insert: userSessionId=${userSessionId} sessionId=${sessionId} userId=${userId}`)

      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'INSERT INTO user_session (id, session_id, user_id) VALUES (:id, :session_id, :user_id)',
        vars: {
          id: userSessionId,
          session_id: sessionId,
          user_id: userId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapByUserId(userId) {
      logger.debug(`zapByUserId: userId=${userId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'UPDATE user_session SET ended_at = :ended_at WHERE user_id = :user_id',
        vars: {
          ended_at: new Date().toISOString(),
          user_id: userId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapBySessionId(sessionId) {
      logger.debug(`zapBySessionId: sessionId=${sessionId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'UPDATE user_session SET ended_at = :ended_at WHERE session_id = :session_id',
        vars: {
          ended_at: new Date().toISOString(),
          session_id: sessionId,
        },
      })
      return Result.mapOk(queried, () => null)
    },
  }
}
