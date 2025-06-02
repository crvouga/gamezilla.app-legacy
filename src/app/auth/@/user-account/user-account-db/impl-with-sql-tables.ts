import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { IUserAccountDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  sqlDb: ISqlDb
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
  return config.userAccountDb
}
