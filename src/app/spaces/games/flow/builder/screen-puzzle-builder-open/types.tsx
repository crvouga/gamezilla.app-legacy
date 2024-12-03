import { p } from '~/@/core/parser'
import { FlowPuzzle } from '../../@/puzzle/puzzle'
import { CreateNewPuzzleTypes } from './create-new-puzzle'
import { UserId } from '~/app/@/data'

//
//
//
//

export type ModelClient = CreateNewPuzzleTypes.ModelClient

export const initClient: ModelClient = {
  ...CreateNewPuzzleTypes.initClient
}

export type MsgClient = CreateNewPuzzleTypes.MsgClient

export type MsgServer = CreateNewPuzzleTypes.MsgServer

export type MsgToServer = CreateNewPuzzleTypes.MsgToServer

export type MsgToClient = CreateNewPuzzleTypes.MsgToClient

export const ModelCore = p.obj({
  t: p.l('puzzle-list'),
  puzzle: FlowPuzzle
})

export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  CreateNewPuzzleTypes.MsgCore,
  p.obj({
    t: p.l('screen-puzzle-builder-open.clicked-puzzle-list-item'),
    puzzle: FlowPuzzle,
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>
