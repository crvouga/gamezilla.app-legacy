import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  FlowGrid,
  FlowGridUIEdit,
  FlowGridUIPlay,
} from "../../../../@SHARED/flow"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"

export type ModelClient = {}

export const initClient: ModelClient = {}

export type ModelServer = {}

export type MsgServer = { t: "noop" }

export type MsgClient =
  | { t: "puzzle-builder.flow-grid-ui-edit"; c: FlowGridUIEdit.Msg }
  | { t: "puzzle-builder.flow-grid-ui-play"; c: FlowGridUIPlay.Msg }
  | { t: "puzzle-builder.user-clicked-more-button" }
  | { t: "puzzle-builder.user-closed-more-drawer" }
  | { t: "puzzle-builder.user-clicked-exit-button" }
  | { t: "puzzle-builder.user-clicked-edit-mode-button" }
  | { t: "puzzle-builder.user-clicked-play-mode-button" }

export type MsgToClient = { t: "noop" }

export type MsgToServer = { t: "noop" }

//
//
//
//
//
//

type Mode =
  | {
      t: "play"
    }
  | {
      t: "edit"
    }

export type ModelSync = {
  t: "puzzle-builder"
  puzzle: FlowPuzzle
  mode: Mode
  gridPlay: FlowGridUIPlay.Model
  gridEdit: FlowGridUIEdit.Model
}

export const toCurrentGrid = (modelSync: ModelSync): FlowGrid.Model => {
  switch (modelSync.mode.t) {
    case "edit": {
      return FlowGridUIEdit.toCurrentGrid({
        model: modelSync.gridEdit,
      })
    }

    case "play": {
      return FlowGridUIPlay.toCurrentGrid({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelSync.gridEdit,
        }),
        model: modelSync.gridPlay,
      })
    }
  }
}

export type MsgSync =
  | {
      t: "puzzle-builder.grid-ui-play"
      c: FlowGridUIPlay.Msg
    }
  | {
      t: "puzzle-builder.grid-ui-edit"
      c: FlowGridUIEdit.Msg
    }
  | {
      t: "puzzle-builder.user-clicked-edit-mode-button"
      userId: UserId
    }
  | {
      t: "puzzle-builder.user-clicked-play-mode-button"
      userId: UserId
    }
  | {
      t: "puzzle-builder.user-clicked-exit-button"
      userId: UserId
    }
