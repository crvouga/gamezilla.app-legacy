import { type RemoteResult, Result } from '@/core'
import { p } from '@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { FlowPuzzle } from '../../../@/puzzle/puzzle'

//
//
//

export type ModelClient = {
  puzzleSaveChangesRequest?: RemoteResult<string, null>
  puzzleSaveChangesIsExiting?: boolean
}

export const initClient: ModelClient = {}

export type ModelServer = {}

//
//
//

export type MsgClient =
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

export type MsgServer = { t: 'noop' }

export type MsgToServer =
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-save-button'
      puzzle: FlowPuzzle
    }
  | {
      t: 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit'
      puzzle: FlowPuzzle
    }

export type MsgToClient = { t: 'noop' }

//
//
//

export const MsgCore = p.obj({
  t: p.l('screen-puzzle-builder.saved-puzzle'),
  saved: Result.parser(p.str, FlowPuzzle),
  userId: UserId
})
export type MsgCore = p.Infer<typeof MsgCore>
