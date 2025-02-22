import { type RemoteResult, Result } from '~/@/result'
import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../../../@/puzzle/puzzle'

//
//
//

export type ModelFrontend = {
  puzzleSaveChangesRequest?: RemoteResult<string, unknown>
  puzzleSaveChangesIsExiting?: boolean
}

export const initFrontend: ModelFrontend = {}

export type ModelBackend = {}

export type MsgFrontend =
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-save-button'
    }
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit'
    }
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit'
    }
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit'
    }
  | {
      t: 'screen-puzzle-builder.save-changed.db-saved-puzzle'
      saved: Result<string, Puzzle>
      userId: UserId
    }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export const MsgSpace = p.obj({
  t: p.l('screen-puzzle-builder.saved-puzzle'),
  saved: Result.parser(p.str, Puzzle),
  userId: UserId,
})
export type MsgSpace = p.Infer<typeof MsgSpace>
