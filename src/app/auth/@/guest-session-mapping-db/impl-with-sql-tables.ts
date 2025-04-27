import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { IGuestSessionMappingDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  guestSessionMappingDb: IGuestSessionMappingDb
}

const queries: string[] = [
  `
  CREATE TABLE user_guest_session_mapping (
    id text NOT NULL PRIMARY KEY,
    guest_user_id text NOT NULL,
    session_id text NOT NULL,
    created_at_posix bigint NOT NULL
  );
  `,
]

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
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
  return config.guestSessionMappingDb
}
