import { UserId } from "../../Data"
import * as VsUser from "./vs-user/vs-user.types"
import * as VsBot from "./vs-bot/vs-bot.types"

//
//
//
// Model
//
//
//

export type FrontendModel =
  | {
    type: "None"
  }
  | {
    type: "VsUser"
    child: VsUser.FrontendModel
  }
  | {
    type: "VsBot"
    child: VsBot.FrontendModel
  }

export type BackendModel =
  | {
    type: "None"
  }
  | {
    type: "VsUser"
    child: VsUser.BackendModel
  }
  | {
    type: "VsBot"
    child: VsBot.BackendModel
  }

export type Mode = BackendModel["type"]

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["VsUser", VsUser.FrontendMsg]
  | ["VsBot", VsBot.FrontendMsg]
  | InputMode

export type BackendMsg =
  | ["VsUser", VsUser.BackendMsg]
  | ["VsBot", VsBot.BackendMsg]

export type ToFrontend =
  | ["VsUser", VsUser.ToFrontend]
  | ["VsBot", VsBot.ToFrontend]
  | InputMode_Done

export type ToBackend =
  | ["VsUser", VsUser.ToBackend]
  | ["VsBot", VsBot.ToBackend]
  | InputMode

//
//
//
//
//

type InputMode = ["InputMode", { mode: Mode; userId: UserId }]
type InputMode_Done = ["InputMode_Done", BackendModel]
