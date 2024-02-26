import { RequestResponse } from "gamezilla/@SHARED/core"
import { FlowPuzzle } from "../../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"
import { FlowPack } from "../flow-pack"
import { ListPuzzlesOutput } from "../../flow-puzzle"

export type ModelClient = {
  request: RequestResponse<string, null>
  pack: FlowPack
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
}

export const initClient = (pack: FlowPack): ModelClient => {
  return {
    request: RequestResponse.notAsked,
    puzzles: {},
    pack,
  }
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
