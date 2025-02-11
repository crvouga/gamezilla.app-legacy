import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../@/puzzle/puzzle'
import { PuzzleQuery } from '../../@/puzzle/puzzle-db/query'
import { CreateNewPuzzleTypes } from './button-create-new-puzzle'

//
//
//
//

export type ModelFrontend = CreateNewPuzzleTypes.ModelFrontend

export const initFrontend: ModelFrontend = {
  ...CreateNewPuzzleTypes.initFrontend,
}

export type MsgFrontend = CreateNewPuzzleTypes.MsgFrontend

export type MsgBackend = CreateNewPuzzleTypes.MsgBackend

export type MsgToBackend = CreateNewPuzzleTypes.MsgToBackend

export type MsgToFrontend = CreateNewPuzzleTypes.MsgToFrontend

export const ModelSpace = p.obj({
  query: PuzzleQuery,
})

export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  CreateNewPuzzleTypes.MsgSpace,
  p.obj({
    t: p.l('screen-puzzle-builder-open.clicked-puzzle-db-query-item'),
    puzzle: Puzzle,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder-open.puzzle-db-query-query-changed'),
    query: PuzzleQuery,
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>
