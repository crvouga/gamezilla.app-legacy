import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/schema'
import { IUserSessionDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  userSessionDb: IUserSessionDb
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_session (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    session_id TEXT,
    client_session_id TEXT NOT NULL,
    created_at_posix BIGINT NOT NULL,
    ended_at_posix BIGINT
  );
  `,
]

export const UserSessionDb = (config: Config): IUserSessionDb => {
  for (const query of queries) {
    config.dbConnSql
      .query({
        parser: p.unknown,
        sql: query,
        vars: {},
      })
      .then(() => {
        //
      })
  }
  return config.userSessionDb
}
