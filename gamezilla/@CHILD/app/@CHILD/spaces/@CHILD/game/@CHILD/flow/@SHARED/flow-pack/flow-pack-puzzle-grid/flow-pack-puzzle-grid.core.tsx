import { RequestResponse } from "gamezilla/@SHARED/core"
import { FlowPuzzle } from "../../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"
import { FlowPack } from "../flow-pack"

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

export type MsgClient = { t: "noop" }

export type MsgServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

export type MsgToServer = { t: "noop" }
