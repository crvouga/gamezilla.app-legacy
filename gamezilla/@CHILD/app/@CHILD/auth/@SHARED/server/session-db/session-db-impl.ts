import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { AuthSession, IAuthSessionDb } from "./session-db";
import { Parsing as P } from "gamezilla/@SHARED/parsing";
import { isErr } from "gamezilla/@SHARED/core";
import { SqliteStore } from "gamezilla/@SHARED/immutable-store";
import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data";

type SessionRow = {
  user_id: string;
  session_id: string;
  is_active: boolean;
  created_at: string;
};

const toSessionRow = (row: unknown): SessionRow | null => {
  if (
    P.obj(row) &&
    P.has(row, "user_id", P.str) &&
    P.has(row, "created_at", P.str) &&
    P.has(row, "session_id", P.str) &&
    P.has(row, "is_active", P.bool)
  ) {
    return {
      user_id: row.user_id,
      created_at: row.created_at,
      session_id: row.session_id,
      is_active: row.is_active,
    };
  }
  return null;
};

SqliteStore<SessionId, AuthSession>({
  connectionString: ":memory:",
  keySpace: "test",
  decodeValue: (encoded) => {
    if (!encoded) {
      return null;
    }
    const json = JSON.parse(encoded);
  },
  encodeValue: (value) => JSON.stringify(value),
});

export const AuthSessionDb = ({
  dbConn,
}: {
  dbConn: DbConnSql;
}): IAuthSessionDb => {
  return {
    async assoc(now, session) {
      const queried = await dbConn.query(
        P.nullish,
        `
        INSERT INTO user_session (
          user_id,
          session_id,
          is_active,
          created_at
        ) VALUES (
          :user_id,
          :session_id,
          :is_active,
          :created_at
        )
        `,
        {
          user_id: session.userId,
          session_id: session.sessionId,
          is_active: true,
          create_at: posixToSqlTimestamp(now),
        }
      );

      if (isErr(queried)) {
        console.error(queried.error);
      }

      return null;
    },

    async dissoc(now, session) {
      const queried = await dbConn.query(
        P.is(toSessionRow),
        `
        SELECT
          user_id,
          session_id,
          is_active,
          created_at
        FROM user_session
        WHERE session_id = :session_id
        AND created_at < :now
        ORDER BY created_at DESC
        LIMIT 1
        `,
        {
          session_id: session.sessionId,
          now: posixToSqlTimestamp(now),
        }
      );

      if (isErr(queried)) {
        console.error(queried.error);
      }

      return null;
    },

    async findOneBySessionId(now, sessionId) {
      return null;
    },
  };
};

function posixToSqlTimestamp(posixTime: number): string {
  const date = new Date(posixTime);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
