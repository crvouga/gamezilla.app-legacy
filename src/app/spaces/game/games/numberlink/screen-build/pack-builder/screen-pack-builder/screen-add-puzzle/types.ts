import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleQuery } from '../../../../@/puzzle/puzzle-db/interface-query'
import { PuzzleId } from '../../../../@/puzzle/puzzle-id'

export const ModelSpace = s.obj({
  screenAddPuzzle_puzzleQuery: s.maybe(PuzzleQuery),
  screenAddPuzzle_selected: s.arr(PuzzleId),
})

export type ModelSpace = s.Infer<typeof ModelSpace>

export const MsgSpace = s.or(
  s.obj({
    t: s.l('screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed'),
    query: PuzzleQuery,
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.screen-add-puzzle.user-clicked-close'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-menu-item'),
    puzzleId: PuzzleId,
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox'),
    puzzleIds: s.arr(PuzzleId),
    userId: UserId,
  }),
)

export type MsgSpace = s.Infer<typeof MsgSpace>
