import { RemoteResult } from "gamezilla/@SHARED/core"
import { IFlowPuzzleDb } from "../flow-puzzle-db"
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"

//
//
//
//

export type ModelClient = {
  puzzleListRequest: RemoteResult<string, null>
  puzzles: { [id: FlowPuzzleId]: FlowPuzzle }
}

export const initClient: ModelClient = {
  puzzleListRequest: RemoteResult.notAsked,
  puzzles: {},
}

export type MsgClient = { t: "user-observed-end-of-list" }

export type MsgServer = { t: "noop" }

export type MsgToServer = { t: "list-puzzles"; input: ListPuzzlesInput }

export type MsgToClient = {
  t: "listed-puzzle"
  listed: ListPuzzlesOutput
}

//
//
//
//
//

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0]

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>
