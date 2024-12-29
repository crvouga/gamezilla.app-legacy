import { pipe } from '~/@/core'
import type { IDbConnSql } from '~/app/@/server/db-conn-sql'
import type { ILogger } from '~/app/@/server/logger'
import type { IPuzzleDb } from './interface'
import { PuzzleDbHashMap } from './impl-hash-map'
import { PuzzleDbPostgres } from './impl-postgres'
import { WithSolutions } from './with-solutions'

export type PuzzleDbImpl =
  | { t: 'hash-map' }
  | {
      t: 'db-conn-sql'
      dbConnSql: IDbConnSql
      logger: ILogger
    }

const PuzzleDbBase = (impl: PuzzleDbImpl): IPuzzleDb => {
  switch (impl.t) {
    case 'hash-map': {
      return PuzzleDbHashMap()
    }
    case 'db-conn-sql': {
      return PuzzleDbPostgres(impl)
    }
  }
}

export const PuzzleDb = (impl: PuzzleDbImpl): IPuzzleDb => {
  return pipe(PuzzleDbBase(impl), WithSolutions)
}
