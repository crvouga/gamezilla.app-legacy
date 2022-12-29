import { UserId } from "../../Data"
import * as VsUser from "./VsUser/VsUser.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Types"

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
    type: "UserVsBot"
    child: UserVsBot.FrontendModel
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
    type: "UserVsBot"
    child: UserVsBot.BackendModel
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
  | ["UserVsBot", UserVsBot.FrontendMsg]
  | InputMode

export type BackendMsg =
  | ["VsUser", VsUser.BackendMsg]
  | ["UserVsBot", UserVsBot.BackendMsg]

export type ToFrontend =
  | ["VsUser", VsUser.ToFrontend]
  | ["UserVsBot", UserVsBot.ToFrontend]
  | InputMode_Done

export type ToBackend =
  | ["VsUser", VsUser.ToBackend]
  | ["UserVsBot", UserVsBot.ToBackend]
  | InputMode

//
//
//
//
//

type InputMode = ["InputMode", { mode: Mode; userId: UserId }]
type InputMode_Done = ["InputMode_Done", BackendModel]
