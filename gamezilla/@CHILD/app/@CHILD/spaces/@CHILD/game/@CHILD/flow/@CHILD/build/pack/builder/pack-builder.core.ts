import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { Result } from "gamezilla/@SHARED/core"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"
import { FlowPuzzleId } from "../../../../@SHARED/flow-puzzle/flow-puzzle-id"

//
//
//
//
//

export type ModelClient = {}

export const initClient: ModelClient = {}

export type ModelServer = {}

//
//
//
//

export type MsgClient = MsgSync | { t: "puzzle-builder.elapsed" }

export type MsgServer = { t: "noop" }

export type MsgToServer = {
  t: "pack-builder.list-puzzles-by-id"
  puzzleIds: FlowPuzzleId[]
}

export type MsgToClient = {
  t: "pack-builder.list-puzzles-by-id"
  listed: Result<string, FlowPuzzle[]>
}

//
//
//
//
//

export type MsgSync =
  | {
      t: "pack-builder.user-clicked-exit-button"
      userId: UserId
    }
  | {
      t: "pack-builder.saved-pack"
      saved: Result<string, FlowPack>
    }
  | {
      t: "pack-builder.user-clicked-open-add-puzzle-button"
      userId: UserId
    }
  | {
      t: "pack-builder.user-closed-add-puzzle"
    }
  | {
      t: "pack-builder.user-clicked-add-puzzle-item"
      puzzle: FlowPuzzle
      userId: UserId
    }
  | {
      t: "pack-builder.user-clicked-pack-item"
      puzzle: FlowPuzzle
      index: number
    }
  | {
      t: "pack-builder.flow-play-grid-ui"
      c: FlowGridUIPlay.Msg
    }
  | {
      t: "pack-builder.user-clicked-exit-puzzle-button"
      userId: UserId
    }
