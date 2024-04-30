import { RequestResponse } from "gamezilla-app/@shared/core/request-response"
import { ListPuzzlesOutput } from "../../flow-puzzle"
import { FlowPuzzle } from "../../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"

export type ModelClient = {
  request: RequestResponse<string, null>
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
}

export const initClient: ModelClient = {
  request: RequestResponse.notAsked,
  puzzles: {},
}

export type ModelServer = {}

export type MsgClient =
  | {
      t: "user-observed-grid"
    }
  | {
      t: "elapsed"
    }

export type MsgServer = {
  t: "noop"
}

export type MsgToClient = {
  t: "listed-puzzles-by-id"
  listed: ListPuzzlesOutput
}

export type MsgToServer = {
  t: "list-puzzles-by-id"
  puzzleIds: FlowPuzzleId[]
}
