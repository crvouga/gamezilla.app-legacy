import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { Puzzle } from './puzzle'
import { IPuzzleDb } from './puzzle-db/interface'
import { PuzzleId } from './puzzle-id'

export const PuzzleSync = (_config: { numberlinkPuzzleDb: IPuzzleDb }): ISync => {
  return {
    match({ entry }) {
      return PuzzleId.is(entry.id)
    },
    async push({ entry }) {
      const puzzle = Puzzle.fromUnknown(entry.newData)

      if (isErr(puzzle)) {
        return Err(puzzle.error)
      }

      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
