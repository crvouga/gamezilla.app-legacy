import type { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import type { IFlowPackDb } from './interface'
import { FlowPackDbHashMap } from './impl-hash-map'
import { FlowPackDbPostgres } from './impl-postgres'

export type Impl =
  | {
      t: 'hash-map'
    }
  | {
      t: 'db-conn-sql'
      dbConnSql: IDbConnSql
    }

export const FlowPackDb = (impl: Impl): IFlowPackDb => {
  switch (impl.t) {
    case 'hash-map': {
      return FlowPackDbHashMap()
    }
    case 'db-conn-sql': {
      return FlowPackDbPostgres(impl)
    }
  }
}
