import { WithEventMeta } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { GameMainMenu } from "../../@SHARED/game"
import * as VsBot from "./@CHILD/vs-bot/vs-bot.core"
import * as VsUser from "./@CHILD/vs-user/vs-user.core"
import { p } from "gamezilla-app/@SHARED/core/parser"

//
//
//
// Model
//
//
//

export type ModelClient =
  | { t: "vs-bot"; c: VsBot.ModelClient }
  | { t: "vs-user"; c: VsUser.ModelClient }
  | { t: null }

export type ModelServer =
  | { t: "vs-bot"; c: VsBot.ModelServer }
  | { t: "vs-user"; c: VsUser.ModelServer }
  | { t: null }

export type Mode = "none" | "vs-user" | "vs-bot"

//
//
//
// Msg
//
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | MsgSync
  | { t: "vs-user"; c: VsUser.MsgClient }
  | { t: "vs-bot"; c: VsBot.MsgClient }

export type MsgServer =
  | { t: "vs-user"; c: VsUser.MsgServer }
  | { t: "vs-bot"; c: VsBot.MsgServer }

export type MsgToClient =
  | { t: "vs-user"; c: VsUser.MsgToClient }
  | { t: "vs-bot"; c: VsBot.MsgToClient }

export type MsgToServer =
  | { t: "vs-user"; c: VsUser.MsgToServer }
  | { t: "vs-bot"; c: VsBot.MsgToServer }

//
//
//
//
//

export const MsgSync = p.or(
  p.obj({
    t: p.l("user-changed-mode"),
    mode: p.enumeration(["none", "vs-user", "vs-bot"] as const),
    userId: UserId,
  }),
  p.obj({
    t: p.l("vs-bot"),
    c: VsBot.MsgSync,
  }),
  p.obj({
    t: p.l("vs-user"),
    c: VsUser.MsgSync,
  }),
)
export type MsgSync = p.Infer<typeof MsgSync>

export const ModelSync = p.or(
  p.obj({
    t: p.l("none"),
  }),
  p.obj({
    t: p.l("vs-user"),
    c: VsUser.ModelSync,
  }),
  p.obj({
    t: p.l("vs-bot"),
    c: VsBot.ModelSync,
  }),
)
export type ModelSync = p.Infer<typeof ModelSync>

export const initSync = (): ModelSync => {
  return {
    t: "none",
  }
}

export const reducer = ({
  ctx,
  msgSync,
  modelSync,
}: {
  ctx: SpaceCtx
  modelSync: ModelSync
  msgSync: WithEventMeta<MsgSync>
}): ModelSync => {
  switch (msgSync.t) {
    case "user-changed-mode": {
      switch (msgSync.mode) {
        case "none": {
          return {
            t: "none",
          }
        }

        case "vs-bot": {
          return {
            t: "vs-bot",
            c: VsBot.initSync(ctx),
          }
        }

        case "vs-user": {
          return {
            t: "vs-user",
            c: VsUser.initSync(ctx),
          }
        }
      }
    }

    case "vs-bot": {
      switch (modelSync.t) {
        case "vs-bot": {
          return {
            t: "vs-bot",
            c: VsBot.reducer({
              modelSync: modelSync.c,
              msgSync: { ...msgSync, ...msgSync.c },
            }),
          }
        }
        default: {
          return modelSync
        }
      }
    }

    case "vs-user": {
      switch (modelSync.t) {
        case "vs-user": {
          return {
            t: "vs-user",
            c: VsUser.reducer(modelSync.c, msgSync.c),
          }
        }

        default: {
          return modelSync
        }
      }
    }
  }
}
