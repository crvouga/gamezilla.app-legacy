import { Result } from "gamezilla-app/@shared/core"
import { UserId } from "gamezilla-app/app/@shared/data"
import { Puzzle, PuzzleInteraction } from "../puzzle.core"

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
