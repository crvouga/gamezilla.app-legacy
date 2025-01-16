import type { IDbConnSql } from '~/@/db-conn-sql'
import type { ILogger } from '~/@/logger'
import { PuzzleDbHashMap } from './impl-hash-map'
import { PuzzleDbSql } from './impl-sql'
import type { IPuzzleDb } from './interface'

export type PuzzleDbImpl =
  | {
      t: 'hash-map'
    }
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
      return PuzzleDbSql(impl)
    }
  }
}

export const PuzzleDb = (impl: PuzzleDbImpl): IPuzzleDb => {
  return PuzzleDbBase(impl)
}
