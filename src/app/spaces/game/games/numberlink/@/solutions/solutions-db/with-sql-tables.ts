import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'with-sql-tables'
  sqlDb: ISqlDb
  solutionsDb: ISolutionsDb
}

const query = `
CREATE TABLE IF NOT EXISTS game_flow_solutions (
    id TEXT NOT NULL PRIMARY KEY,
    solutions TEXT NOT NULL,
    created_at_unix_ms INTEGER NOT NULL,
    last_updated_at_unix_ms INTEGER NOT NULL
);
`
export const SolutionsDb = (config: Config): ISolutionsDb => {
  config.sqlDb
    .query({
      schema: s.unknown,
      sql: query,
      vars: {},
    })
    .then(() => {
      //
    })
  return config.solutionsDb
}
