import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { Puzzle } from '../puzzle/puzzle'
import { PuzzleId } from '../puzzle/puzzle-id'

export const parser = s.or(
  s.obj({
    t: s.l('flow-cmd.add-puzzles'),
    puzzles: s.dict(PuzzleId, Puzzle),
    causedBy: s.any,
  }),
)

export type AddPuzzlesCmd = s.Infer<typeof parser>

export const init = (puzzles: { [puzzleId: PuzzleId]: Puzzle }, causedBy: unknown): AddPuzzlesCmd => {
  return {
    t: 'flow-cmd.add-puzzles',
    puzzles,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is AddPuzzlesCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return true
      }
      return false
    }),
  )
}

export const AddPuzzlesCmd = {
  is,
  init,
  did,
}
