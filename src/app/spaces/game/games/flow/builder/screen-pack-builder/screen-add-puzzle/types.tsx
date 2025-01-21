import { p } from '~/@/parser'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import { UserId } from '~/app/@/data/user-id'

export const ModelSpace = p.obj({
  puzzleDbQuery: p.maybe(PuzzleDbQuery),
})

export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  p.obj({
    t: p.l('puzzle-db-query-query-changed'),
    query: PuzzleDbQuery,
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
