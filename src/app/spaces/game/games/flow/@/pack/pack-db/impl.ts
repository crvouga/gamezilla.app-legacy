import * as ImplHashMap from './impl-hash-map'
import * as ImplDbConnSql from './impl-db-conn-sql'
import * as WithSqlTables from './with-sql-tables'
import type { IPackDb } from './interface'

export type Config = ImplHashMap.Config | ImplDbConnSql.Config | WithSqlTables.Config

export const PackDb = (config: Config): IPackDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.PackDb(config)
    }
    case 'db-conn-sql': {
      return ImplDbConnSql.PackDb(config)
    }
    case 'with-sql-tables': {
      return WithSqlTables.PackDb(config)
    }
  }
}
