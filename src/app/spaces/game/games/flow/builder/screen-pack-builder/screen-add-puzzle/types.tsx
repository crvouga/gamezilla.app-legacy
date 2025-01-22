import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export const ModelSpace = p.obj({
  screenAddPuzzle_puzzleDbQuery: p.maybe(PuzzleDbQuery),
  screenAddPuzzle_selected: p.arr(PuzzleId),
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
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item'),
    puzzleId: PuzzleId,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox'),
    puzzleIds: p.arr(PuzzleId),
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
