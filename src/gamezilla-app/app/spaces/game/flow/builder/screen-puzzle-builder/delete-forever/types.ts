import { NotAsked, Result, type RemoteResult } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { FlowPuzzleId } from '../../../@/flow-puzzle/flow-puzzle-id'

export type ModelClient = {
  puzzleDeleteForeverRequest: RemoteResult<string, null>
}

export const initClient: ModelClient = {
  puzzleDeleteForeverRequest: NotAsked
}

export type ModelServer = {}

//
//
//
//

export type MsgClient =
  | { t: 'delete-forever.user-clicked-delete-button' }
  | { t: 'delete-forever.user-closed-drawer' }
  | { t: 'delete-forever.user-clicked-confirm-button' }
  | { t: 'delete-forever.user-clicked-cancel-button' }

export type MsgToServer = { t: 'delete-forever.user-confirmed' }

export type MsgToClient = { t: 'noop' }

export type MsgServer = { t: 'noop' }

//
//
//
//

export const MsgCore = p.obj({
  t: p.l('user-deleted-puzzle'),
  deleted: Result.parser(p.str, p.l(null)),
  flowPuzzleId: FlowPuzzleId,
  userId: UserId
})
export type MsgCore = p.Infer<typeof MsgCore>
