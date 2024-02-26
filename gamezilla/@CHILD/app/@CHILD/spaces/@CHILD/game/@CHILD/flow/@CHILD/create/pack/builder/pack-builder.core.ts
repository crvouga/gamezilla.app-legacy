import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla/@SHARED/core"
import { FlowVariantUIPlay } from "../../../../@SHARED/flow"
import { FlowPackPuzzleGrid } from "../../../../@SHARED/flow-pack"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"

//
//
//
//
//

export type ModelClient = {
  packBuilder: {
    flowPackPuzzleGrid: FlowPackPuzzleGrid.ModelClient
  }
}

export const initClient: ModelClient = {
  packBuilder: {
    flowPackPuzzleGrid: FlowPackPuzzleGrid.initClient,
  },
}

export type ModelServer = {}

export const initServer: ModelServer = {}

//
//
//
//

export type MsgClient =
  | MsgSync
  | {
      t: "pack-builder.flow-pack-puzzle-grid"
      c: FlowPackPuzzleGrid.MsgClient
    }

export type MsgServer = {
  t: "pack-builder.flow-pack-puzzle-grid"
  c: FlowPackPuzzleGrid.MsgServer
}

export type MsgToServer = {
  t: "pack-builder.flow-pack-puzzle-grid"
  c: FlowPackPuzzleGrid.MsgToServer
}

export type MsgToClient = {
  t: "pack-builder.flow-pack-puzzle-grid"
  c: FlowPackPuzzleGrid.MsgToClient
}

//
//
//
//
//

export type ModelSync = {
  t: "pack-builder"
  pack: FlowPack
  screen:
    | {
        t: "add-puzzle"
      }
    | {
        t: "screen-puzzle-grid"
        pageIndex: number
      }
    | {
        t: "screen-puzzle"
        puzzleIndex: number
        puzzle: FlowPuzzle
        playUI: FlowVariantUIPlay.Model
      }
}

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
      t: "pack-builder.flow-play-ui"
      c: FlowVariantUIPlay.Msg
    }
  | {
      t: "pack-builder.user-clicked-exit-puzzle-button"
      userId: UserId
    }
  | {
      t: "pack-builder.user-clicked-next-puzzle-button"
      userId: UserId
    }
  | {
      t: "pack-builder.user-clicked-previous-puzzle-button"
      userId: UserId
    }
