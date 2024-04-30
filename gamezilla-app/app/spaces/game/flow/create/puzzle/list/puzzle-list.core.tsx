import { FlowPuzzle } from "../../../@shared/flow-puzzle/flow-puzzle"

//
//
//
//

export type ModelClient = {}

export const initClient: ModelClient = {}

export type MsgClient = {
  t: "puzzle-list.clicked-puzzle-list-item"
  puzzle: FlowPuzzle
}

export type MsgServer = { t: "noop" }

export type MsgToServer = { t: "noop" }

export type MsgToClient = {
  t: "noop"
}

export type MsgSync = {
  t: "puzzle-list.clicked-puzzle-list-item"
  puzzle: FlowPuzzle
}
