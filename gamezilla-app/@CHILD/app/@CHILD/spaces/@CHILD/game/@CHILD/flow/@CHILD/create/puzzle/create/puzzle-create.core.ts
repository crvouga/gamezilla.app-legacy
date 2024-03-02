import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  Result,
  RemoteResult,
  notAsked,
  Posix,
} from "gamezilla-app/@SHARED/core"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"

//
//
//
//
//

export type ModelClient = {
  puzzleCreateRequest: RemoteResult<string, null>
  puzzleCreateRequestedAt: Posix
}

export const initClient: ModelClient = {
  puzzleCreateRequest: notAsked,
  puzzleCreateRequestedAt: Posix.now(),
}

export type ModelServer = {}

//
//
//
//

export type MsgClient = {
  t: "puzzle-create.user-clicked-create-button"
}

export type MsgServer = { t: "noop" }

export type MsgToServer = { t: "puzzle-create.user-clicked-create-button" }

export type MsgToClient = {
  t: "created-puzzle"
  created: Result<string, FlowPuzzle>
}

//
//
//
//
//

export type MsgSync = {
  t: "user-created-puzzle"
  created: Result<string, FlowPuzzle>
  userId: UserId
}
