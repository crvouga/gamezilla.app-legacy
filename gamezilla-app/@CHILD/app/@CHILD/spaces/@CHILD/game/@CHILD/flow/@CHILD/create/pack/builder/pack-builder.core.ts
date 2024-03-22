import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
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
        opened: "more" | null
      }
}

const userId = p.custom(UserId.is, "Invalid user id")

export const isMsgSync = p.or(
  p.obj({
    t: p.l("pack-builder.user-clicked-exit-button"),
    userId: userId,
  }),
  p.obj({
    t: p.l("pack-builder.saved-pack"),
    saved: p.custom(Result.is(p.is(p.str), p.is(FlowPack.parser)), "invalid"),
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-open-add-puzzle-button"),
    userId: userId,
  }),
  p.obj({
    t: p.l("pack-builder.user-closed-add-puzzle"),
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-add-puzzle-item"),
    puzzle: FlowPuzzle,
    userId: userId,
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-pack-item"),
    puzzle: FlowPuzzle,
    index: p.num,
  }),
  p.obj({
    t: p.l("pack-builder.flow-play-ui"),
    c: p.any,
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-exit-puzzle-button"),
    userId: userId,
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-next-puzzle-button"),
    userId: userId,
    nextPuzzle: FlowPuzzle,
  }),
  p.obj({
    t: p.l("pack-builder.user-clicked-previous-puzzle-button"),
    userId: userId,
    previousPuzzle: FlowPuzzle,
  }),
  p.obj({
    t: p.l("pack-builder.puzzle-screen.user-clicked-more-button"),
    userId: userId,
  }),
  p.obj({
    t: p.l("pack-builder.puzzle-screen.user-closed-more-drawer"),
    userId: userId,
  }),
)

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
      nextPuzzle: FlowPuzzle
    }
  | {
      t: "pack-builder.user-clicked-previous-puzzle-button"
      userId: UserId
      previousPuzzle: FlowPuzzle
    }
  | {
      t: "pack-builder.puzzle-screen.user-clicked-more-button"
      userId: UserId
    }
  | {
      t: "pack-builder.puzzle-screen.user-closed-more-drawer"
      userId: UserId
    }
