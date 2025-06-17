import { Err, isErr, Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { Puzzle } from './puzzle'
import { IPuzzleDb } from './puzzle-db/interface'
import { PuzzleId } from './puzzle-id'

export const UploadDataPuzzle = (_config: { numberlinkPuzzleDb: IPuzzleDb }): IUploadData => {
  return {
    match: (entry) => {
      return PuzzleId.is(entry.id)
    },
    upload: async (entry) => {
      const puzzle = Puzzle.fromUnknown(entry.newData)

      if (isErr(puzzle)) {
        return Err(puzzle.error)
      }

      return Ok(null)
    },
  }
}
