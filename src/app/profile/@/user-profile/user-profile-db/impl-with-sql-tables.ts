import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { IProfileDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  profileDb: IProfileDb
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar_seed TEXT,
    avatar_style TEXT,
    created_at_posix BIGINT NOT NULL,
    updated_at_posix BIGINT NOT NULL
  );
  `,
]

export const ProfileDb = (config: Config): IProfileDb => {
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
  return config.profileDb
}
