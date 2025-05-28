import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { PuzzleId } from '../puzzle/puzzle-id'

export const schema = s.or(
  s.obj({
    t: s.l('flow-cmd.remove-puzzles'),
    puzzles: s.dict(PuzzleId, PuzzleId),
    causedBy: s.any,
  }),
)

export type RemovePuzzlesCmd = s.Infer<typeof schema>

export const init = (puzzles: { [puzzleId: PuzzleId]: PuzzleId }, causedBy: unknown): RemovePuzzlesCmd => {
  return {
    t: 'flow-cmd.remove-puzzles',
    puzzles,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is RemovePuzzlesCmd => {
  return isOk(schema.parse(cmd))
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
