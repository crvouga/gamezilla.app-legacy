import { Result } from "../../Core"
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
  | ["None"]
  | ["UserVsUser", UserVsUser.FrontendModel]
  | ["UserVsBot", UserVsBot.FrontendModel]

export type BackendModel =
  | ["None"]
  | ["UserVsUser", UserVsUser.BackendModel]
  | ["UserVsBot", UserVsBot.BackendModel]

type Mode = BackendModel[0]

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
// 

export type InputMode = ['InputMode', { mode: Mode, userId: UserId.UserId }]
export type InputMode_Done = ['InputMode_Done', { mode: Mode, userId: UserId.UserId }, Result.Result<"failed", BackendModel>]
