import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"

//
//
//
//
//

export type ModelClient = {
  packBuilderOpen?: "puzzle-picker" | null
}

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
      t: "pack-builder.clicked-add-puzzle-button"
    }
  | {
      t: "pack-builder.closed-puzzle-picker-drawer"
    }

export type MsgServer = { t: "noop" }

export type MsgToServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

//
//
//
//
//

export type MsgGame = {
  t: "user-exited-pack-builder"
  userId: UserId
}
