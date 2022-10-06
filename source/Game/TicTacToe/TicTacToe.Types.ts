import { Result } from "../../Core/Result"
import { UserId } from "../../Data"
import * as UserVsBot from "./UserVsBot/UserVsBot.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Types"

//
//
//
// Model
//
//
//

export type FrontendModel =
  | { mode: "None" }
  | { mode: "UserVsUser"; child: UserVsUser.FrontendModel }
  | { mode: "UserVsBot"; child: UserVsBot.FrontendModel }

export type BackendModel =
  | { mode: "None" }
  | { mode: "UserVsUser"; child: UserVsUser.BackendModel }
  | { mode: "UserVsBot"; child: UserVsBot.BackendModel }

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

export type ToBackend =
  | ["UserVsUser", UserVsUser.ToBackend]
  | ["UserVsBot", UserVsBot.ToBackend]
  | InputMode

export type ToFrontend =
  | ["UserVsUser", UserVsUser.ToFrontend]
  | ["UserVsBot", UserVsBot.ToFrontend]
  | InputMode_Done

//
//
//
//
//
//

type InputMode = [
  "InputMode",
  { mode: BackendModel["mode"]; userId: UserId.UserId },
]
type InputMode_Done = ["InputMode_Done", Result<InputModeProblem, BackendModel>]
type InputModeProblem = "unknown"
