import { Result } from "../../Core/Result"
import { UserId } from "../../Data"
import * as UserVsBot from "./UserVsBot/UserVsBot.Types"
import * as VsUser from "./VsUser/VsUser.Types"

//
//
//
// Model
//
//
//

export type FrontendModel =
  | { mode: "None" }
  | { mode: "VsUser"; child: VsUser.FrontendModel }
  | { mode: "UserVsBot"; child: UserVsBot.FrontendModel }

export type BackendModel =
  | { mode: "None" }
  | { mode: "VsUser"; child: VsUser.BackendModel }
  | { mode: "UserVsBot"; child: UserVsBot.BackendModel }

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

export type ToBackend =
  | ["VsUser", VsUser.ToBackend]
  | ["UserVsBot", UserVsBot.ToBackend]
  | InputMode

export type ToFrontend =
  | ["VsUser", VsUser.ToFrontend]
  | ["UserVsBot", UserVsBot.ToFrontend]
  | InputMode_Done

//
//
//
//
//
//

type InputMode = ["InputMode", { mode: BackendModel["mode"]; userId: UserId }]
type InputMode_Done = ["InputMode_Done", Result<InputModeProblem, BackendModel>]
type InputModeProblem = "unknown"
