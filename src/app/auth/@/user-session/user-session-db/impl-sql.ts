import type { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { p } from '~/@/parser'
import { Result, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Posix } from '~/@/time/posix'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import type { IUserSessionDb } from './interface'

export const Row = p.obj({
  id: UserSessionId,
  session_id: SessionId,
  user_id: UserId,
  created_at_posix: p.or(p.str, p.num),
  ended_at_posix: p.maybe(p.or(p.str, p.num)),
})

export type Row = p.Infer<typeof Row>

const rowToUserSession = (row: Row): UserSession => ({
  userSessionId: row.id,
  sessionId: row.session_id,
  userId: row.user_id,
  createdAt: Posix.init(row.created_at_posix),
  endedAt: row.ended_at_posix ? Posix.init(row.ended_at_posix) : null,
})

// const userSessionToRow = (userSession: UserSession): Row => ({
//   id: userSession.userSessionId,
//   session_id: userSession.sessionId,
//   user_id: userSession.userId,
//   created_at_posix: userSession.createdAt,
//   ended_at_posix: userSession.endedAt,
// })

export type Config = {
  t: 'sql'
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
        sql: 'SELECT * FROM user_session WHERE ended_at_posix IS NULL AND user_id = :user_id',
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
        sql: 'SELECT * FROM user_session WHERE ended_at_posix IS NULL AND session_id = :session_id',
        vars: {
          session_id: sessionId,
        },
      })

      return Result.mapOk(queried, (rows) => {
        return rows[0]?.user_id ?? null
      })
    },

    async insert(userSession) {
      logger.debug(
        `insert: userSession=${userSession.userSessionId} sessionId=${userSession.sessionId} userId=${userSession.userId}`,
      )
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'INSERT INTO user_session (id, session_id, user_id, created_at_posix) VALUES (:id, :session_id, :user_id, :created_at_posix)',
        vars: {
          id: userSession.userSessionId,
          session_id: userSession.sessionId,
          user_id: userSession.userId,
          created_at_posix: userSession.createdAt,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapByUserId(userId) {
      logger.debug(`zapByUserId: userId=${userId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'UPDATE user_session SET ended_at_posix = :ended_at_posix WHERE user_id = :user_id',
        vars: {
          ended_at_posix: Date.now(),
          user_id: userId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapBySessionId(sessionId) {
      logger.debug(`zapBySessionId: sessionId=${sessionId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'UPDATE user_session SET ended_at_posix = :ended_at_posix WHERE session_id = :session_id',
        vars: {
          ended_at_posix: Date.now(),
          session_id: sessionId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async query(input) {
      const whereClauses: string[] = []
      const vars: Sql.Vars = {}

      if (input.where.userId?.equals) {
        whereClauses.push('user_id = :user_id')
        vars.user_id = input.where.userId.equals
      }

      if (input.where.sessionId?.equals) {
        whereClauses.push('session_id = :session_id')
        vars.session_id = input.where.sessionId.equals
      }

      vars.offset = input.pagination.offset
      vars.limit = input.pagination.limit

      const whereStr = whereClauses.join(' AND ')

      const sql = `SELECT * FROM user_session WHERE ${whereStr} ORDER BY created_at_posix DESC LIMIT :limit OFFSET :offset`
      const sqlCount = `SELECT COUNT(*) AS total FROM user_session WHERE ${whereStr}`

      const queried = await dbConnSql.query({
        parser: Row,
        sql,
        vars,
      })

      const queriedCount = await dbConnSql.query({
        parser: p.obj({
          total: p.num,
        }),
        sql: sqlCount,
        vars,
      })

      const total = unwrapOr(
        Result.mapOk(queriedCount, (rows) => rows[0]?.total ?? 0),
        0,
      )

      return Result.mapOk(queried, (rows) => {
        return {
          items: rows.map(rowToUserSession),
          total: total,
          limit: input.pagination.limit,
          offset: input.pagination.offset,
        }
      })
    },
  }
}
