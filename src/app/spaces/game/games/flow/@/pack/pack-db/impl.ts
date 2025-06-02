import * as ImplHashMap from './impl-hash-map'
import * as ImplSqlDb from './impl-sql-db'
import * as WithSqlTables from './with-sql-tables'
import type { IPackDb } from './interface'

export type Config = ImplHashMap.Config | ImplSqlDb.Config | WithSqlTables.Config

export const PackDb = (config: Config): IPackDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.PackDb(config)
    }
    case 'sql-db': {
      return ImplSqlDb.PackDb(config)
    }
    case 'with-sql-tables': {
      return WithSqlTables.PackDb(config)
    }
  }
}
