import { UserId } from "../../Data"
import * as UserVsUser from "./UserVsUser/UserVsUser.Types"
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
      type: "UserVsUser"
      child: UserVsUser.FrontendModel
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
      type: "UserVsUser"
      child: UserVsUser.BackendModel
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
  | ["UserVsUser", UserVsUser.FrontendMsg]
  | ["UserVsBot", UserVsBot.FrontendMsg]
  | InputMode

export type BackendMsg =
  | ["UserVsUser", UserVsUser.BackendMsg]
  | ["UserVsBot", UserVsBot.BackendMsg]

export type ToFrontend =
  | ["UserVsUser", UserVsUser.ToFrontend]
  | ["UserVsBot", UserVsBot.ToFrontend]
  | InputMode_Done

export type ToBackend =
  | ["UserVsUser", UserVsUser.ToBackend]
  | ["UserVsBot", UserVsBot.ToBackend]
  | InputMode

//
//
//
//
//

type InputMode = ["InputMode", { mode: Mode; userId: UserId }]
type InputMode_Done = ["InputMode_Done", BackendModel]
