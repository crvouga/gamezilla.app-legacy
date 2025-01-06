import { NotAsked, Result, type RemoteResult } from '~/@/result'
import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export type ModelClient = {
  puzzleDeleteForeverRequest: RemoteResult<string, null>
}

export const initClient: ModelClient = {
  puzzleDeleteForeverRequest: NotAsked,
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
  flowPuzzleId: PuzzleId,
  userId: UserId,
})
export type MsgCore = p.Infer<typeof MsgCore>
