import type { IDbConnSql } from '~/@/db-conn-sql'
import type { ILogger } from '~/@/logger'
import { Err } from '~/@/result'
import type { IPuzzleDb } from './interface'

export const PuzzleDbElectric = (_config: { logger: ILogger; dbConnSql: IDbConnSql }): IPuzzleDb => {
  return {
    async get(_flowPuzzleId) {
      return Err('not implemented')
    },

    async count(_input) {
      return Err('not implemented')
    },

    async query(_input) {
      return Err('not implemented')
    },

    async put(_flowPuzzle) {
      return Err('not implemented')
    },

    async zap(_input) {
      return Err('not implemented')
    },

    async subscribe(_input) {
      return Err('not implemented')
    },
  }
}
