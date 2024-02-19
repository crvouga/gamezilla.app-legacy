import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { Result } from "gamezilla/@SHARED/core"

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

export type MsgClient =
  | {
      t: "pack-builder.user-clicked-exit-button"
    }
  | {
      t: "pack-builder.user-clicked-open-puzzle-picker-button"
    }
  | {
      t: "pack-builder.user-clicked-puzzle-grid-item"
      index: number
    }
  | {
      t: "pack-builder.user-closed-puzzle-picker"
    }
  | {
      t: "pack-builder.user-clicked-puzzle-picker-item"
      puzzle: FlowPuzzle
    }

export type MsgServer = { t: "noop" }

export type MsgToServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

//
//
//
//
//

export type MsgGame =
  | {
      t: "pack-builder.user-clicked-exit-button"
      userId: UserId
    }
  | {
      t: "pack-builder.saved-pack"
      saved: Result<string, FlowPack>
    }
  | {
      t: "pack-builder.user-clicked-open-puzzle-picker-button"
      userId: UserId
    }
  | {
      t: "pack-builder.user-closed-puzzle-picker"
    }
  | {
      t: "pack-builder.user-clicked-puzzle-picker-item"
      puzzle: FlowPuzzle
      userId: UserId
    }
  | {
      t: "pack-builder.user-clicked-puzzle-grid-item"
      index: number
    }
