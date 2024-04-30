import { RemoteResult, Result } from "gamezilla-app/@/core"
import { UserId } from "gamezilla-app/app/@shared/data"
import { FlowPuzzle } from "../../../@shared/flow-puzzle/flow-puzzle"

//
//
//

export type ModelClient = {
  puzzleSaveChangesRequest?: RemoteResult<string, null>
  puzzleSaveChangesIsExiting?: boolean
}

export type ModelServer = {}

//
//
//

export type MsgClient =
  | { t: "puzzle-save-changes.user-clicked-save-button" }
  | { t: "puzzle-save-changes.user-clicked-cancel-exit" }
  | { t: "puzzle-save-changes.user-clicked-save-and-exit" }
  | { t: "puzzle-save-changes.user-clicked-discard-and-exit" }

export type MsgServer = { t: "noop" }

export type MsgToServer =
  | { t: "puzzle-save-changes.user-clicked-save-button"; puzzle: FlowPuzzle }
  | {
      t: "puzzle-save-changes.user-clicked-save-and-exit"
      puzzle: FlowPuzzle
    }

export type MsgToClient = { t: "noop" }

//
//
//

export type MsgSync = {
  t: "puzzle-builder.saved-puzzle"
  saved: Result<string, FlowPuzzle>
  userId: UserId
}
