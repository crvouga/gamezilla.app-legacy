import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { IPuzzleDb } from './interface'

export type Config = {
  t: 'with-ensure-tables'
  dbConnSql: IDbConnSql
  puzzleDb: IPuzzleDb
}

const query = `
CREATE TABLE IF NOT EXISTS game_flow_puzzle (
    id TEXT NOT NULL,
    flow_puzzle_name TEXT NOT NULL,
    flow TEXT NOT NULL,
    created_at_posix INTEGER NOT NULL,
    created_by_user_id TEXT NOT NULL,
    last_updated_at_posix INTEGER NOT NULL,
    last_updated_by_user_id TEXT NOT NULL,
    deleted_at INTEGER,
    deleted_by_user_id TEXT,
    flow_solutions TEXT NOT NULL
);
`
export const PuzzleDb = (config: Config): IPuzzleDb => {
  // config.dbConnSql
  //   .query({
  //     parser: p.unknown,
  //     sql: query,
  //     vars: {},
  //   })
  //   .then(() => {
  //     //
  //   })
  return config.puzzleDb
}
