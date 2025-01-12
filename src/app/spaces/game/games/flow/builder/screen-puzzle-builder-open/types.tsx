import { p } from '~/@/parser'
import { Puzzle } from '../../@/puzzle/puzzle'
import { CreateNewPuzzleTypes } from './create-new-puzzle'
import { UserId } from '~/app/@/data/user-id'

//
//
//
//

export type ModelClient = CreateNewPuzzleTypes.ModelClient

export const initClient: ModelClient = {
  ...CreateNewPuzzleTypes.initClient,
}

export type MsgClient = CreateNewPuzzleTypes.MsgClient

export type MsgBackend = CreateNewPuzzleTypes.MsgBackend

export type MsgToBackend = CreateNewPuzzleTypes.MsgToBackend

export type MsgToClient = CreateNewPuzzleTypes.MsgToClient

export const ModelCore = p.obj({
  t: p.l('puzzle-list'),
  puzzle: Puzzle,
})

export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  CreateNewPuzzleTypes.MsgCore,
  p.obj({
    t: p.l('screen-puzzle-builder-open.clicked-puzzle-list-item'),
    puzzle: Puzzle,
    userId: UserId,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>
