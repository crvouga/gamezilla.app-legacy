import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  solutionsDb: ISolutionsDb
}

const query = `
CREATE TABLE IF NOT EXISTS game_flow_solutions (
    id TEXT NOT NULL PRIMARY KEY,
    solutions TEXT NOT NULL,
    created_at_posix INTEGER NOT NULL,
    last_updated_at_posix INTEGER NOT NULL
);
`
export const SolutionsDb = (config: Config): ISolutionsDb => {
  config.dbConnSql
    .query({
      parser: p.unknown,
      sql: query,
      vars: {},
    })
    .then(() => {
      //
    })
  return config.solutionsDb
}
