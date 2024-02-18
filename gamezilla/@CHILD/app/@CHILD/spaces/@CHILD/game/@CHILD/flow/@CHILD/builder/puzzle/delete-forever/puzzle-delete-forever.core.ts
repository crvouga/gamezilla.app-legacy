import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { RemoteResult, notAsked } from "gamezilla/@SHARED/core"
import { IFlowPuzzleDb } from "../../../../@SHARED/flow-puzzle-db"
import { FlowPuzzleId } from "../../../../@SHARED/flow-puzzle/flow-puzzle-id"

export type ModelClient = {
  puzzleDeleteForeverRequest: RemoteResult<string, null>
}

export const initClient: ModelClient = {
  puzzleDeleteForeverRequest: notAsked,
}

export type ModelServer = {}

//
//
//
//

export type MsgClient =
  | { t: "delete-forever/user-clicked-delete-button" }
  | { t: "delete-forever/user-closed-drawer" }
  | { t: "delete-forever/user-clicked-confirm-button" }
  | { t: "delete-forever/user-clicked-cancel-button" }

export type MsgToServer = { t: "delete-forever/user-confirmed" }

export type MsgToClient = { t: "noop" }

export type MsgServer = { t: "noop" }

//
//
//
//

export type MsgGame = {
  t: "user-deleted-puzzle"
  deleted: Deleted
  flowPuzzleId: FlowPuzzleId
  userId: UserId
}

//
//
//
//

type Deleted = Awaited<ReturnType<IFlowPuzzleDb["zap"]>>
