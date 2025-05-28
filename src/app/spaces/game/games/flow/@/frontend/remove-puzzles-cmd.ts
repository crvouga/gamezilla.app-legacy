import { p } from '~/@/schema'
import { isOk } from '~/@/result'
import { PuzzleId } from '../puzzle/puzzle-id'

export const parser = p.or(
  p.obj({
    t: p.l('flow-cmd.remove-puzzles'),
    puzzles: p.dict(PuzzleId, PuzzleId),
    causedBy: p.any,
  }),
)

export type RemovePuzzlesCmd = p.Infer<typeof parser>

export const init = (puzzles: { [puzzleId: PuzzleId]: PuzzleId }, causedBy: unknown): RemovePuzzlesCmd => {
  return {
    t: 'flow-cmd.remove-puzzles',
    puzzles,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is RemovePuzzlesCmd => {
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

export const RemovePuzzlesCmd = {
  is,
  init,
  did,
}
