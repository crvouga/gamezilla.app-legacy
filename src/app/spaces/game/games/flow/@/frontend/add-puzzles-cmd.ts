import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { Puzzle } from '../puzzle/puzzle'
import { PuzzleId } from '../puzzle/puzzle-id'

export const parser = p.or(
  p.obj({
    t: p.l('flow-cmd.add-puzzles'),
    puzzles: p.dict(PuzzleId, Puzzle),
    causedBy: p.any,
  }),
)

export type AddPuzzlesCmd = p.Infer<typeof parser>

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
