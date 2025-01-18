import { p } from '~/@/parser'
import { NotAsked, Result, type RemoteResult } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export type ModelFrontend = {
  puzzleDeleteForeverRequest: RemoteResult<string, null>
}

export const initFrontend: ModelFrontend = {
  puzzleDeleteForeverRequest: NotAsked,
}

export type MsgFrontend =
  | { t: 'delete-forever.user-clicked-delete-button' }
  | { t: 'delete-forever.user-closed-drawer' }
  | { t: 'delete-forever.user-clicked-confirm-button' }
  | { t: 'delete-forever.user-clicked-cancel-button' }
  | {
      t: 'delete-forever.db-zapped-puzzle'
      deleted: Result<string, null>
      userId: UserId
      puzzleId: PuzzleId
    }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgBackend = { t: 'noop' }

export const MsgSpace = p.obj({
  t: p.l('user-deleted-puzzle'),
  deleted: Result.parser(p.str, p.l(null)),
  puzzleId: PuzzleId,
  userId: UserId,
})
export type MsgSpace = p.Infer<typeof MsgSpace>
