import { IDbConnSql } from '~/@/db-conn-sql'
import { s } from '~/@/schema'
import { IPackDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  packDb: IPackDb
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS game_flow_pack (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at_posix INT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      last_updated_at_posix INT NOT NULL,
      last_updated_by_user_id TEXT NOT NULL,
      deleted_at_posix INT,
      deleted_by_user_id TEXT
  );
  `,
  `
  CREATE TABLE game_flow_pack_item (
      id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      "position" INT NOT NULL,
      created_at_posix INT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      deleted_at_posix INT,
      deleted_by_user_id TEXT
  );
  `,
]
export const PackDb = (config: Config): IPackDb => {
  for (const query of queries) {
    config.dbConnSql
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
