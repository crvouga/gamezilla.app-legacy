import { NotAsked, Result, type RemoteResult } from '~/@/result'
import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export type ModelFrontend = {
  puzzleDeleteForeverRequest: RemoteResult<string, null>
}

export const initFrontend: ModelFrontend = {
  puzzleDeleteForeverRequest: NotAsked,
}

export type ModelBackend = {}

//
//
//
//

export type MsgFrontend =
  | { t: 'delete-forever.user-clicked-delete-button' }
  | { t: 'delete-forever.user-closed-drawer' }
  | { t: 'delete-forever.user-clicked-confirm-button' }
  | { t: 'delete-forever.user-clicked-cancel-button' }

export type MsgToBackend = { t: 'delete-forever.user-confirmed' }

export type MsgToFrontend = { t: 'noop' }

export type MsgBackend = { t: 'noop' }

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
