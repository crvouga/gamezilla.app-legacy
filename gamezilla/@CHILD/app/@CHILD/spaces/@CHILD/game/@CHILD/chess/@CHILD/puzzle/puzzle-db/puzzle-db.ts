import { Result } from "gamezilla/@SHARED/core"
import { Puzzle, PuzzleInteraction } from "../puzzle.core"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"

export type PuzzleDb = {
  interactions: {
    insert: (interaction: PuzzleInteraction) => Promise<Result<string, null>>
  }
  puzzles: {
    replace: (puzzle: Puzzle) => Promise<Result<string, null>>
    findForProfile: (input: {
      userId: UserId
    }) => Promise<Result<string, Puzzle[]>>
  }
  profiles: {
    find: null
    insert: null
    findElseInsert: null
    update: null
  }
}
