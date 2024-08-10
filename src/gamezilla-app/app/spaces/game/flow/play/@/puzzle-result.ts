import { p } from 'gamezilla-app/@/core/parser'
import { FlowPuzzle } from '../../@/flow-puzzle'

export const FlowPuzzleResult = p.or(
  p.obj({
    t: p.l('got'),
    c: FlowPuzzle
  }),
  p.obj({
    t: p.l('not-found')
  })
)

export type FlowPuzzleResult = p.Infer<typeof FlowPuzzleResult>
