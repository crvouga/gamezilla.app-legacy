import * as ImplPostgres from './impl-postgres'
import * as ImplNoop from './impl-noop'
import type { IDbConnSql } from './interface'

export type Config = ImplPostgres.Config | ImplNoop.Config

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    case 'postgres': {
      return ImplPostgres.DbConnSql(config)
    }
  }
}
