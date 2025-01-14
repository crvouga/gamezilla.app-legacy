import * as ImplPostgres from './impl-postgres'
import * as ImplPglight from './impl-pglite'
import * as ImplNoop from './impl-noop'
import type { IDbConnSql } from './interface'

type DbConnSqlImpl = ImplPostgres.Config | ImplNoop.Config | ImplPglight.Config

export const DbConnSql = async (config: DbConnSqlImpl): Promise<IDbConnSql> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    case 'postgres': {
      return ImplPostgres.DbConnSql(config)
    }
    case 'pglite': {
      return ImplPglight.DbConnSql(config)
    }
  }
}
