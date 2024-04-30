import { SpaceCtx } from "gamezilla-app/app/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { RemoteResult, Result } from "gamezilla-app/@SHARED/core"
import { GameMainMenu } from "../../@SHARED/game"
import * as Puzzle from "./@CHILD/puzzle/puzzle.core"
import * as VsBot from "./@CHILD/vs-bot/vs-bot.core"
import * as VsUser from "./@CHILD/vs-user/vs-user.core"

export type ModelClient = {
  mode:
    | { t: "none" }
    | { t: "vs-user"; c: VsUser.ModelClient }
    | { t: "vs-bot"; c: VsBot.ModelClient }
    | { t: "puzzle"; c: Puzzle.ModelClient }

  requests?: {
    [req in Req["t"]]?: RemoteResult<Problem, null>
  }
}

export type ModelServer =
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ModelServer }
  | { t: "vs-bot"; c: VsBot.ModelServer }
  | { t: "puzzle"; c: Puzzle.ModelServer }

type Mode = ModelServer["t"]

export type MsgClient =
  | GameMainMenu.Msg
  | Req
  | { t: "vs-user"; c: VsUser.MsgClient }
  | { t: "vs-bot"; c: VsBot.MsgClient }
  | { t: "puzzle"; c: Puzzle.MsgClient }

export type MsgServer =
  | { t: "vs-user"; c: VsUser.MsgServer }
  | { t: "vs-bot"; c: VsBot.MsgServer }
  | { t: "puzzle"; c: Puzzle.MsgServer }

export type MsgToClient =
  | Res
  | { t: "vs-user"; c: VsUser.MsgToClient }
  | { t: "vs-bot"; c: VsBot.MsgToClient }
  | { t: "puzzle"; c: Puzzle.MsgToClient }

export type MsgToServer =
  | Req
  | { t: "vs-user"; c: VsUser.MsgToServer }
  | { t: "vs-bot"; c: VsBot.MsgToServer }
  | { t: "puzzle"; c: Puzzle.MsgToServer }

export type Req = { t: "input-mode"; mode: Mode; userId: UserId }
export type Res = Req & {
  result: Result<Problem, ModelServer>
}
export type Problem = "must_be_the_host"

//
//
//
//
//
//
//
//
//

export type MsgSync = { t: "user-changed-mode"; mode: Mode; userId: UserId }

export type ModelSync =
  | {
      t: "none"
    }
  | {
      t: "vs-user"
    }
  | {
      t: "vs-bot"
    }
  | {
      t: "puzzle"
    }

export const initSync = (): ModelSync => {
  return {
    t: "none",
  }
}

export const reducer = ({
  msgSync,
}: {
  ctx: SpaceCtx
  modelSync: ModelSync
  msgSync: MsgSync
}): ModelSync => {
  switch (msgSync.t) {
    case "user-changed-mode": {
      switch (msgSync.mode) {
        case "none": {
          return { t: "none" }
        }
        case "puzzle": {
          return { t: "none" }
        }
        case "vs-bot": {
          return { t: "none" }
        }
        case "vs-user": {
          return { t: "none" }
        }
      }
    }
  }
}
