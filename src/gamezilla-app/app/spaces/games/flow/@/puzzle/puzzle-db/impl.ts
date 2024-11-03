import { pipe } from 'gamezilla-app/@/core'
import type { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import type { ILogger } from 'gamezilla-app/app/@/server/logger'
import type { IFlowPuzzleDb } from './interface'
import { FlowPuzzleDbHashMap } from './impl-hash-map'
import { FlowPuzzleDbPostgres } from './impl-postgres'
import { WithSolutions } from './with-solutions'

export type FlowPuzzleDbImpl =
  | { t: 'hash-map' }
  | {
      t: 'db-conn-sql'
      dbConnSql: IDbConnSql
      logger: ILogger
    }

const FlowPuzzleDbBase = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
  switch (impl.t) {
    case 'hash-map': {
      return FlowPuzzleDbHashMap()
    }
    case 'db-conn-sql': {
      return FlowPuzzleDbPostgres(impl)
    }
  }
}

export const FlowPuzzleDb = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
  return pipe(FlowPuzzleDbBase(impl), WithSolutions)
}
