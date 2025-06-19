import { pipe } from '~/@/function/pipe'
import { ILogger } from '~/@/logger'
import { Result, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { Sql } from '~/@/sql'
import type { ISqlDb } from '~/@/sql-db'
import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import type { IUserSessionDb } from './interface'
import { UserSessionDbQuery } from './interface-query'

export const Row = s.obj({
  id: UserSessionId,
  session_id: s.maybe(SessionId),
  client_session_id: ClientSessionId,
  user_id: UserId,
  created_at_unix_ms: s.or(s.str(), s.num()),
  ended_at_unix_ms: s.maybe(s.or(s.str(), s.num())),
})

export type Row = s.Infer<typeof Row>

const rowToUserSession = (row: Row): UserSession => {
  return {
    userSessionId: row.id,
    sessionId: row.session_id ?? null,
    userId: row.user_id,
    createdAt: UnixMs.init(row.created_at_unix_ms),
    endedAt: row.ended_at_unix_ms ? UnixMs.init(row.ended_at_unix_ms) : null,
    clientSessionId: row.client_session_id,
  }
}

UserSession.fromUnknownRegister((data) => {
  return pipe(
    data,
    (x) => Row.parse(x),
    (x) => Result.mapErr(x, ParseError.toString),
    (x) => Result.mapOk(x, rowToUserSession),
  )
})

export type Config = {
  t: 'sql'
  sqlDb: ISqlDb
  logger: ILogger
  createTable: boolean
}

const CREATE_TABLE_SQL: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_session (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    session_id TEXT,
    client_session_id TEXT NOT NULL,
    created_at_unix_ms BIGINT NOT NULL,
    ended_at_unix_ms BIGINT
  );
  `,
]

export const UserSessionDb = ({ sqlDb, ...config }: Config): IUserSessionDb => {
  const logger = config.logger.child(['impl-sql'])
  if (config.createTable) {
    for (const query of CREATE_TABLE_SQL) {
      sqlDb.query({ schema: s.unknown, sql: query, vars: {} }).then(() => {
        //
      })
    }
  }

  return {
    async findSessionIdsByUserId(userId: UserId) {
      logger.debug(`findSessionIdsByUserId: userId=${userId}`)
      const queried = await sqlDb.query({
        schema: Row,
        sql: 'SELECT * FROM user_session WHERE ended_at_unix_ms IS NULL AND user_id = :user_id',
        vars: {
          user_id: userId,
        },
      })

      return Result.mapOk(queried, (rows) => rows.flatMap((row) => (row.session_id ? [row.session_id] : [])))
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      logger.debug(`findUserIdBySessionId: sessionId=${sessionId}`)
      const queried = await sqlDb.query({
        schema: Row,
        sql: 'SELECT * FROM user_session WHERE ended_at_unix_ms IS NULL AND session_id = :session_id',
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
      const queried = await sqlDb.query({
        schema: Row,
        sql: `
          INSERT INTO user_session (
            id,
            session_id,
            client_session_id,
            user_id,
            created_at_unix_ms
          ) VALUES (
            :id,
            :session_id,
            :client_session_id,
            :user_id,
            :created_at_unix_ms
          )
        `,
        vars: {
          id: userSession.userSessionId,
          session_id: userSession.sessionId,
          client_session_id: userSession.clientSessionId,
          user_id: userSession.userId,
          created_at_unix_ms: userSession.createdAt,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapByUserId(userId) {
      logger.debug(`zapByUserId: userId=${userId}`)
      const queried = await sqlDb.query({
        schema: Row,
        sql: 'UPDATE user_session SET ended_at_unix_ms = :ended_at_unix_ms WHERE user_id = :user_id',
        vars: {
          ended_at_unix_ms: Date.now(),
          user_id: userId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zapBySessionId(sessionId) {
      logger.debug(`zapBySessionId: sessionId=${sessionId}`)
      const queried = await sqlDb.query({
        schema: Row,
        sql: 'UPDATE user_session SET ended_at_unix_ms = :ended_at_unix_ms WHERE session_id = :session_id',
        vars: {
          ended_at_unix_ms: Date.now(),
          session_id: sessionId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async query(input) {
      const { sql, sqlCount, vars } = queryToSql(input)

      const queried = await sqlDb.query({ schema: Row, sql, vars })

      const queriedCount = await sqlDb.query({
        schema: s.obj({ total: s.or(s.num(), s.str()) }),
        sql: sqlCount,
        vars,
      })

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
      const queried = await sqlDb.query({
        schema: Row,
        sql: 'UPDATE user_session SET ended_at_unix_ms = :ended_at_unix_ms WHERE client_session_id = :client_session_id',
        vars: {
          ended_at_unix_ms: Date.now(),
          client_session_id: clientSessionId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    sub(input) {
      const { sql, vars } = queryToSql(input)
      return Sub.map(sqlDb.sub({ schema: Row, sql, vars }), (rows) => rows.map(rowToUserSession))
    },
  }
}

const queryToSql = (query: UserSessionDbQuery) => {
  const whereClauses: string[] = []
  const vars: Sql.Vars = {}

  whereClauses.push('ended_at_unix_ms IS NULL')

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

  const orderStr = query.order.createdAt ? `ORDER BY created_at_unix_ms ${query.order.createdAt.toUpperCase()}` : ''

  const sql = `SELECT * FROM user_session WHERE ${whereStr} ${orderStr} LIMIT :limit OFFSET :offset`
  const sqlCount = `SELECT COUNT(*) AS total FROM user_session WHERE ${whereStr}`

  return {
    sql,
    sqlCount,
    vars,
  }
}
