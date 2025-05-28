import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/schema'
import { IKeyValueDb } from './interface'
import { ILogger } from '../logger/interface'

export type Config = {
  t: 'with-sql-tables'
  dbConnSql: IDbConnSql
  keyValueDb: IKeyValueDb
  logger?: ILogger
}

const queries: string[] = [
  `
  CREATE TABLE IF NOT EXISTS key_value (
    id TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
]

export const KeyValueDb = (config: Config): IKeyValueDb => {
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
  return config.keyValueDb
}
