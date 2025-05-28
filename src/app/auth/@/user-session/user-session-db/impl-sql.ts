import type { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { p } from '~/@/schema'
import { Result, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import type { IUserSessionDb } from './interface'
import { UserSessionDbQuery } from './query'

export const Row = p.obj({
  id: UserSessionId,
  session_id: p.maybe(SessionId),
  client_session_id: ClientSessionId,
  user_id: UserId,
  created_at_posix: p.or(p.str, p.num),
  ended_at_posix: p.maybe(p.or(p.str, p.num)),
})

export type Row = p.Infer<typeof Row>

const rowToUserSession = (row: Row): UserSession => ({
  userSessionId: row.id,
  sessionId: row.session_id ?? null,
  userId: row.user_id,
  createdAt: Posix.init(row.created_at_posix),
  endedAt: row.ended_at_posix ? Posix.init(row.ended_at_posix) : null,
  clientSessionId: row.client_session_id,
})

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

      return Result.mapOk(queried, (rows) => rows.flatMap((row) => (row.session_id ? [row.session_id] : [])))
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
        `insert: userSession=${userSession.userSessionId} sessionId=${userSession.sessionId} clientSessionId=${userSession.clientSessionId} userId=${userSession.userId}`,
      )
      const queried = await dbConnSql.query({
        parser: Row,
        sql: `
          INSERT INTO user_session (
            id,
            session_id,
            client_session_id,
            user_id,
            created_at_posix
          ) VALUES (
            :id,
            :session_id,
            :client_session_id,
            :user_id,
            :created_at_posix
          )
        `,
        vars: {
          id: userSession.userSessionId,
          session_id: userSession.sessionId,
          client_session_id: userSession.clientSessionId,
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
      const { sql, sqlCount, vars } = queryToSql(input)

      const queried = await dbConnSql.query({ parser: Row, sql, vars })

      const queriedCount = await dbConnSql.query({ parser: p.obj({ total: p.or(p.num, p.str) }), sql: sqlCount, vars })

      const total = unwrapOr(
        Result.mapOk(queriedCount, (rows) => {
          const total = rows[0]?.total
          if (typeof total === 'number') {
            return total
          }
          if (typeof total === 'string') {
            return parseInt(total)
          }
          return 0
        }),
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

    async zapByClientSessionId(clientSessionId) {
      logger.debug(`zapByClientSessionId: clientSessionId=${clientSessionId}`)
      const queried = await dbConnSql.query({
        parser: Row,
        sql: 'UPDATE user_session SET ended_at_posix = :ended_at_posix WHERE client_session_id = :client_session_id',
        vars: {
          ended_at_posix: Date.now(),
          client_session_id: clientSessionId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    sub(input) {
      const { sql, vars } = queryToSql(input)
      return Sub.map(dbConnSql.sub({ parser: Row, sql, vars }), (rows) => rows.map(rowToUserSession))
    },
  }
}

const queryToSql = (query: UserSessionDbQuery) => {
  const whereClauses: string[] = []
  const vars: Sql.Vars = {}

  whereClauses.push('ended_at_posix IS NULL')

  if (query.whereAnd.userId?.equals) {
    whereClauses.push('user_id = :user_id')
    vars.user_id = query.whereAnd.userId.equals
  }

  if (query.whereAnd.sessionId?.equals) {
    whereClauses.push('session_id = :session_id')
    vars.session_id = query.whereAnd.sessionId.equals
  }

  if (query.whereAnd.clientSessionId?.equals) {
    whereClauses.push('client_session_id = :client_session_id')
    vars.client_session_id = query.whereAnd.clientSessionId.equals
  }

  vars.offset = query.pagination.offset
  vars.limit = query.pagination.limit

  const whereStr = whereClauses.join(' AND ')

  const orderStr = query.order.createdAt ? `ORDER BY created_at_posix ${query.order.createdAt.toUpperCase()}` : ''

  const sql = `SELECT * FROM user_session WHERE ${whereStr} ${orderStr} LIMIT :limit OFFSET :offset`
  const sqlCount = `SELECT COUNT(*) AS total FROM user_session WHERE ${whereStr}`

  return {
    sql,
    sqlCount,
    vars,
  }
}
