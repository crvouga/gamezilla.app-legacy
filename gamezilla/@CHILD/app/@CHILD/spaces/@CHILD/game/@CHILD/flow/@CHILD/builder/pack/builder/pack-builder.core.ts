import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { Result } from "gamezilla/@SHARED/core"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"

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

export type MsgClient = MsgGame

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
  | {
      t: "pack-builder.flow-play-grid-ui"
      c: FlowGridUIPlay.Msg
    }
