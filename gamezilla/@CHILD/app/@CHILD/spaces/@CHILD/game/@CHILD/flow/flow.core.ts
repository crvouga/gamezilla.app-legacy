import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { WithEventMeta } from "../../../../@SHARED/event"
import { GameMainMenu } from "../../@SHARED/game"
import * as Build from "./@CHILD/build/build.core"
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
  | { t: "build"; c: Build.ModelClient }
  | { t: "play"; c: Play.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

export type ModelServer =
  | { t: "none" }
  | { t: "build"; c: Build.ModelServer }
  | { t: "play"; c: Play.ModelServer }

//
//
// Msg
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: "msgSync"; c: MsgSync }
  | { t: "build"; c: Build.MsgClient }
  | { t: "play"; c: Play.MsgClient }

export type MsgServer =
  | { t: "build"; c: Build.MsgServer }
  | { t: "play"; c: Play.MsgServer }

export type MsgToServer =
  | { t: "build"; c: Build.MsgToServer }
  | { t: "play"; c: Play.MsgToServer }

export type MsgToClient =
  | { t: "build"; c: Build.MsgToClient }
  | { t: "play"; c: Play.MsgToClient }

export type Mode = "build" | "play"

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
  | { t: "build"; c: Build.MsgSync }

export type ModelSync =
  | { t: null }
  | { t: "build"; c: Build.ModelSync }
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

    case "build": {
      switch (modelSync.t) {
        case "build": {
          return {
            t: "build",
            c: Build.reducer({
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

        case "build": {
          return {
            t: "build",
            c: Build.initSync({ ctx }),
          }
        }
      }
    }
  }
}
