import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { IPackDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  sqlDb: ISqlDb
  packDb: IPackDb
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS game_numberlink_pack (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at_unix_ms INT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      last_updated_at_unix_ms INT NOT NULL,
      last_updated_by_user_id TEXT NOT NULL,
      deleted_at_unix_ms INT,
      deleted_by_user_id TEXT
  );
  `,
  `
  CREATE TABLE game_numberlink_pack_item (
      id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      "position" INT NOT NULL,
      created_at_unix_ms INT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      deleted_at_unix_ms INT,
      deleted_by_user_id TEXT
  );
  `,
]
export const PackDb = (config: Config): IPackDb => {
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
  return config.packDb
}
