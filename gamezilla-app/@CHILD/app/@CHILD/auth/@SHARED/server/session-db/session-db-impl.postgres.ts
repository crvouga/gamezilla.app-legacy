import { SessionId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { Result, Uuid } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parser"
import { ISessionDb } from "./session-db"

//
//
//
//
//

export const Row = p.obj({
  session_id: p.custom(SessionId.is, "Invalid session id"),
  user_id: p.custom(UserId.is, "Invalid user id"),
})

export type Row = p.Infer<typeof Row>

//
//
//
//
//

export const SessionDbPostgres = ({
  dbConnSql,
}: {
  dbConnSql: DbConnSql
}): ISessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      const queried = await dbConnSql.query(
        Row,
        `SELECT * FROM user_session WHERE ended_at IS NULL AND user_id = :user_id`,
        { user_id: userId },
      )

      return Result.mapOk(queried, (rows) => rows.map((row) => row.session_id))
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const queried = await dbConnSql.query(
        Row,
        `SELECT * FROM user_session WHERE ended_at IS NULL AND session_id = :session_id`,
        { session_id: sessionId },
      )

      return Result.mapOk(queried, (rows) => {
        return rows[0]?.user_id ?? null
      })
    },

    async insert({ sessionId, userId }) {
      const userSessionId = `user-session:${Uuid.generate()}`

      const queried = await dbConnSql.query(
        Row,
        `INSERT INTO user_session (user_session_id, session_id, user_id) VALUES (:user_session_id, :session_id, :user_id)`,
        {
          user_session_id: userSessionId,
          session_id: sessionId,
          user_id: userId,
        },
      )
      return Result.mapOk(queried, () => null)
    },

    async zapByUserId(userId) {
      const queried = await dbConnSql.query(
        Row,
        `UPDATE user_session SET ended_at = :ended_at WHERE user_id = :user_id`,
        {
          ended_at: new Date().toISOString(),
          user_id: userId,
        },
      )
      return Result.mapOk(queried, () => null)
    },

    async zapBySessionId(sessionId) {
      const queried = await dbConnSql.query(
        Row,
        `UPDATE user_session SET ended_at = :ended_at WHERE session_id = :session_id`,
        {
          ended_at: new Date().toISOString(),
          session_id: sessionId,
        },
      )
      return Result.mapOk(queried, () => null)
    },
  }
}
