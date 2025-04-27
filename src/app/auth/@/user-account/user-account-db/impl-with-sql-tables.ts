import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { IUserAccountDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  userAccountDb: IUserAccountDb
}

const queries: string[] = [
  `
  CREATE TABLE user_account (
    id TEXT NOT NULL PRIMARY KEY,
    created_at_posix BIGINT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('super', 'normal', 'guest')),
    phone_number TEXT
  );
  `,
]

export const UserAccountDb = (config: Config): IUserAccountDb => {
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
  return config.userAccountDb
}
