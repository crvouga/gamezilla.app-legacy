import type { ILogger } from '~/@/logger'
import { Err } from '~/@/result'
// import { pgLite } from '~/app/@/pglite/pglite'
import { Sub } from '~/@/sub'
import type { IPuzzleDb } from './interface'

// pgLite.live.query('SELECT * FROM game_flow_puzzle OFFSET 1', null, (x: unknown) => {
//   console.log('pgLite.live.query', x)
// })

export const PuzzleDbElectric = (_config: { logger: ILogger }): IPuzzleDb => {
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

    subscribe(_input) {
      return Sub.create()
    },
  }
}
