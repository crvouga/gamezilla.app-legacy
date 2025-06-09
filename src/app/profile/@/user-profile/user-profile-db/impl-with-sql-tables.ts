import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { IUserProfileDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  sqlDb: ISqlDb
  profileDb: IUserProfileDb
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar_seed TEXT,
    avatar_style TEXT,
    created_at_unix_ms BIGINT NOT NULL,
    updated_at_unix_ms BIGINT NOT NULL
  );
  `,
]

export const ProfileDb = (config: Config): IUserProfileDb => {
  for (const query of queries) {
    config.sqlDb
      .query({
        schema: s.unknown,
        sql: query,
        vars: {},
      })
      .then(() => {
        //
      })
  }
  return config.profileDb
}
