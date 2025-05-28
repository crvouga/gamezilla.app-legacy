import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/schema'
import { IPuzzleDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  puzzleDb: IPuzzleDb
}

const query = `
CREATE TABLE IF NOT EXISTS game_flow_puzzle (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    flow TEXT NOT NULL,
    created_at_posix INTEGER NOT NULL,
    created_by_user_id TEXT NOT NULL,
    last_updated_at_posix INTEGER NOT NULL,
    last_updated_by_user_id TEXT NOT NULL,
    deleted_at_posix INTEGER,
    deleted_by_user_id TEXT,
    solutions TEXT NOT NULL
);
`
export const PuzzleDb = (config: Config): IPuzzleDb => {
  config.dbConnSql
    .query({
      parser: p.unknown,
      sql: query,
      vars: {},
    })
    .then(() => {
      //
    })
  return config.puzzleDb
}
