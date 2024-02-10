import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { Result, Uuid } from "gamezilla/@SHARED/core"
import { P } from "gamezilla/@SHARED/parsing"
import { ISessionDb } from "./session-db"

//
//
//
//
//

type Row = {
    session_id: string
    user_id: string
}

const toRow = (x: unknown): Row | null => {
    if (
        P.obj(x) &&
        P.has(x, "session_id", P.str) &&
        P.has(x, "user_id", P.str)
    ) {
        return x
    }
    return null
}

const isRow = P.is(toRow)

//
//
//
//
//

export const SessionDbPostgres = ({
    dbConn,
}: {
    dbConn: DbConnSql
}): ISessionDb => {
    return {
        async findSessionIdsByUserId(userId: UserId) {
            const queried = await dbConn.query(
                isRow,
                `SELECT * FROM user_session WHERE ended_at IS NULL AND user_id = :user_id`,
                { user_id: userId },
            )

            return Result.mapOk(queried, (rows) =>
                rows.flatMap((row): SessionId[] =>
                    SessionId.is(row.session_id) ? [row.session_id] : [],
                ),
            )
        },

        async findUserIdBySessionId(sessionId: SessionId) {
            const queried = await dbConn.query(
                isRow,
                `SELECT * FROM user_session WHERE ended_at IS NULL AND session_id = :session_id`,
                { session_id: sessionId },
            )

            return Result.mapOk(queried, (rows) =>
                rows.length === 1 && UserId.is(rows[0]?.user_id)
                    ? rows[0].user_id
                    : null,
            )
        },

        async insert({ sessionId, userId }) {
            const userSessionId = `user-session:${Uuid.generate()}`

            const queried = await dbConn.query(
                isRow,
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
            const queried = await dbConn.query(
                isRow,
                `UPDATE user_session SET ended_at = :ended_at WHERE user_id = :user_id`,
                {
                    ended_at: new Date().toISOString(),
                    user_id: userId,
                },
            )
            return Result.mapOk(queried, () => null)
        },

        async zapBySessionId(sessionId) {
            const queried = await dbConn.query(
                isRow,
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
