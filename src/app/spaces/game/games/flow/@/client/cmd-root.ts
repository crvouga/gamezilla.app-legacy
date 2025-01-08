import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import { Puzzle } from '../puzzle/puzzle'
import { PuzzleId } from '../puzzle/puzzle-id'
import { Solutions } from '../solutions/solutions'

export type FlowClientCmdRoot =
  | {
      t: 'flow-cmd.add-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: Puzzle
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.remove-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: PuzzleId
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.add-packs'
      packs: {
        [packId: PackId]: Pack
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.add-solutions'
      solutions: Solutions
      causedBy: unknown
    }

const addPuzzles = (puzzles: { [puzzleId: PuzzleId]: Puzzle }, causedBy: unknown): FlowClientCmdRoot => {
  return {
    t: 'flow-cmd.add-puzzles',
    puzzles,
    causedBy,
  }
}

const addSolutions = (solutions: Solutions, causedBy: unknown): FlowClientCmdRoot => {
  return {
    t: 'flow-cmd.add-solutions',
    solutions,
    causedBy,
  }
}

export const FlowClientCmdRoot = {
  addPuzzles,
  addSolutions,
}
