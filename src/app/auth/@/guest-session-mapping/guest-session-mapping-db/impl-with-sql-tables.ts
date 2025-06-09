import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { IGuestSessionMappingDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  sqlDb: ISqlDb
  guestSessionMappingDb: IGuestSessionMappingDb
}

const queries: string[] = [
  `
  CREATE TABLE user_guest_session_mapping (
    id text NOT NULL PRIMARY KEY,
    guest_user_id text NOT NULL,
    session_id text,
    client_session_id text NOT NULL,
    created_at_unix_ms bigint NOT NULL
  );
  `,
]

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
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
  return config.guestSessionMappingDb
}
