import { RemoteResult, Result, notAsked } from "gamezilla/@SHARED/core"
import { FlowPuzzleId } from "../../../../@SHARED/flow-puzzle/flow-puzzle-id"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"

//
//
//
//

export type ModelClient = {
  puzzleEditNameRequest: RemoteResult<string, null>
  puzzleEditNameDraft: string
  puzzleEditNameValidationError: EditNameValidationError
}

export const initClient: ModelClient = {
  puzzleEditNameDraft: "",
  puzzleEditNameRequest: notAsked,
  puzzleEditNameValidationError: null,
}

export type EditNameValidationError = "name-cannot-be-empty" | null

export const editNameValidationErrorToString = (
  error?: EditNameValidationError,
) => {
  switch (error) {
    case "name-cannot-be-empty": {
      return "Name cannot be empty"
    }
    default: {
      return null
    }
  }
}

export type ModelServer = {}

//
//
//
//

export type MsgClient =
  | { t: "puzzle.edit-name.user-inputted-draft-name"; draftName: string }
  | { t: "puzzle.edit-name.user-closed-drawer" }
  | { t: "puzzle.edit-name.user-clicked-button" }
  | { t: "puzzle.edit-name.user-clicked-save-button" }
  | { t: "puzzle.edit-name.user-clicked-cancel-button" }

export type MsgServer = { t: "noop" }

export type MsgToServer = {
  t: "puzzle.edit-name.user-clicked-save-button"
  newName: string
  flowPuzzleId: FlowPuzzleId
}

export type MsgToClient = {
  t: "noop"
}

//
//
//
//
//

export type MsgGame = {
  t: "user-edited-puzzle-name"
  edited: Result<string, null>
  flowPuzzleId: FlowPuzzleId
  newName: string
  userId: UserId
}
