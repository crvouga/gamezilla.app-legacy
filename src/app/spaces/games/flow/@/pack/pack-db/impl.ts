import type { IDbConnSql } from '~/@/db-conn-sql'
import type { IPackDb } from './interface'
import { PackDbHashMap } from './impl-hash-map'
import { PackDbPostgres } from './impl-postgres'

export type Impl =
  | {
      t: 'hash-map'
    }
  | {
      t: 'db-conn-sql'
      dbConnSql: IDbConnSql
    }

export const PackDb = (impl: Impl): IPackDb => {
  switch (impl.t) {
    case 'hash-map': {
      return PackDbHashMap()
    }
    case 'db-conn-sql': {
      return PackDbPostgres(impl)
    }
  }
}
