import { p } from '~/@/parser'
import { Puzzle } from '../../@/puzzle/puzzle'
import { CreateNewPuzzleTypes } from './create-new-puzzle'
import { UserId } from '~/app/@/data/user-id'

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
  t: p.l('puzzle-list'),
  puzzle: Puzzle,
})

export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  CreateNewPuzzleTypes.MsgSpace,
  p.obj({
    t: p.l('screen-puzzle-builder-open.clicked-puzzle-list-item'),
    puzzle: Puzzle,
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>
