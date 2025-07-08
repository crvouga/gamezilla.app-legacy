import { ISync } from '~/@/sync-engine/sync-transaction'
import { IPuzzleDb } from './puzzle-db/interface'

export const PuzzleSync = (_config: { numberlinkPuzzleDb: IPuzzleDb }): ISync => {
  return {
    async push() {
      throw new Error('Not implemented')
    },
  }
}
