import { Result } from "../../Core/Result"
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
  | { mode: "UserVsUser", child: UserVsUser.FrontendModel }

export type BackendModel =
  | { mode: "None" }
  | { mode: "UserVsUser", child: UserVsUser.BackendModel }

// 
//
//
// Msg
//
//
//

export type FrontendMsg = ["UserVsUser", UserVsUser.FrontendMsg] | InputMode

export type BackendMsg = ["UserVsUser", UserVsUser.BackendMsg]

export type ToBackend = ["UserVsUser", UserVsUser.ToBackend] | InputMode

export type ToFrontend = ["UserVsUser", UserVsUser.ToFrontend] | InputMode_Done

// 
// 
// 
// 
// 
// 

type InputMode = ["InputMode", { mode: "None" | "UserVsUser" }]
type InputMode_Done = ["InputMode_Done", Result<InputModeProblem, BackendModel>]
type InputModeProblem = "unknown"