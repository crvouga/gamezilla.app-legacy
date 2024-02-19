import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow"

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

export type MsgGame =
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
