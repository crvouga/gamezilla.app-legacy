import { p } from '~/@/parser'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../../@/puzzle/puzzle'

export const ModelSpace = p.obj({
  screenAddPuzzlePuzzleDbQuery: p.maybe(PuzzleDbQuery),
})

export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed'),
    query: PuzzleDbQuery,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.user-clicked-close'),
  }),
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.user-clicked-puzzle'),
    puzzle: Puzzle,
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
