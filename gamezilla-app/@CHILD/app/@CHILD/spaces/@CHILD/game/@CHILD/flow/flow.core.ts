import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { WithEventMeta } from "../../../../@SHARED/event"
import { GameMainMenu } from "../../@SHARED/game"
import * as Create from "./@CHILD/create/create.core"
import * as Play from "./@CHILD/play/play.core"
import { FlowPuzzle } from "./@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "./@SHARED/flow-puzzle/flow-puzzle-id"

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
  | { t: "create"; c: Create.ModelClient }
  | { t: "play"; c: Play.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

export type ModelServer =
  | { t: "none" }
  | { t: "create"; c: Create.ModelServer }
  | { t: "play"; c: Play.ModelServer }

//
//
// Msg
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: "msgSync"; c: MsgSync }
  | { t: "create"; c: Create.MsgClient }
  | { t: "play"; c: Play.MsgClient }

export type MsgServer =
  | { t: "create"; c: Create.MsgServer }
  | { t: "play"; c: Play.MsgServer }

export type MsgToServer =
  | { t: "create"; c: Create.MsgToServer }
  | { t: "play"; c: Play.MsgToServer }

export type MsgToClient =
  | { t: "create"; c: Create.MsgToClient }
  | { t: "play"; c: Play.MsgToClient }

export type Mode = "create" | "play"

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
  | { t: "create"; c: Create.MsgSync }

export type ModelSync =
  | { t: null }
  | { t: "create"; c: Create.ModelSync }
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
          console.error("Invalid modelSync", modelSync)
          return modelSync
        }
      }
    }

    case "create": {
      switch (modelSync.t) {
        case "create": {
          return {
            t: "create",
            c: Create.reducer({
              ctx,
              msgSync: msgSync.c,
              modelSync: modelSync.c,
            }),
          }
        }
        default: {
          console.error("Invalid modelSync", modelSync)
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

        case "create": {
          return {
            t: "create",
            c: Create.initSync({ ctx }),
          }
        }
      }
    }
  }
}
