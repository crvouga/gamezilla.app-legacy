import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { WithEventMeta } from "../../../../@SHARED/event"
import * as Play from "./@CHILD/play/play.core"
import * as Builder from "./@CHILD/builder/builder.core"
import { FlowPuzzle } from "./@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "./@SHARED/flow-puzzle/flow-puzzle-id"
import { GameMainMenu } from "../../@SHARED/game"

//
//
// Model
//
//

export type BaseModelClient = {
  puzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
}

export type VariantModelClient =
  | { t: "none" }
  | { t: "builder"; c: Builder.ModelClient }
  | { t: "play"; c: Play.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

export type ModelServer =
  | { t: "none" }
  | { t: "builder"; c: Builder.ModelServer }
  | { t: "play"; c: Play.ModelServer }

//
//
// Msg
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: "msgSync"; c: MsgSync }
  | { t: "builder"; c: Builder.MsgClient }
  | { t: "play"; c: Play.MsgClient }

export type MsgServer =
  | { t: "builder"; c: Builder.MsgServer }
  | { t: "play"; c: Play.MsgServer }

export type MsgToServer =
  | { t: "builder"; c: Builder.MsgToServer }
  | { t: "play"; c: Play.MsgToServer }

export type MsgToClient =
  | { t: "builder"; c: Builder.MsgToClient }
  | { t: "play"; c: Play.MsgToClient }

export type Mode = "builder" | "play"

//
//
//
//
//
//
//

export type MsgSync =
  | { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
  | { t: "play"; c: Play.MsgSync }
  | { t: "builder"; c: Builder.MsgSync }

export type ModelSync =
  | { t: null }
  | { t: "builder"; c: Builder.ModelSync }
  | { t: "play"; c: Play.ModelSync }

export const initSync = () => {
  return { t: null }
}

export const reducer = ({
  ctx,
  msgSync,
  modelSync,
}: {
  ctx: SpaceCtx
  msgSync: WithEventMeta<MsgSync>
  modelSync: ModelSync
}): ModelSync => {
  switch (msgSync.t) {
    case "play": {
      switch (modelSync.t) {
        case "play": {
          return {
            t: "play",
            c: Play.reducer({
              ctx,
              msgSync: msgSync.c,
              modelSync: modelSync.c,
            }),
          }
        }
        default: {
          return modelSync
        }
      }
    }

    case "builder": {
      switch (modelSync.t) {
        case "builder": {
          return {
            t: "builder",
            c: Builder.reducer({
              ctx,
              msgSync: msgSync.c,
              modelSync: modelSync.c,
            }),
          }
        }
        default: {
          return modelSync
        }
      }
    }

    case "user-changed-mode": {
      if (msgSync.userId !== ctx.space.hostId) {
        return modelSync
      }

      switch (msgSync.mode) {
        case null: {
          return { t: null }
        }

        case "play": {
          return {
            t: "play",
            c: Play.initSync({ ctx }),
          }
        }

        case "builder": {
          return {
            t: "builder",
            c: Builder.initSync({ ctx }),
          }
        }
      }
    }
  }
}
