import { UserId } from "../../Data"
import * as UserVsUser from "./UserVsUser/UserVsUser.Types"

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
    type: "UserVsUser",
    child: UserVsUser.FrontendModel
  }
  | {
    type: "UserVsBot"
  }

export type BackendModel =
  | {
    type: "None"
  }
  | {
    type: "UserVsUser",
    child: UserVsUser.BackendModel
  }
  | {
    type: "UserVsBot"
  }

type Mode = BackendModel['type']

//
//
//
// Msg
//
//
//

export type FrontendMsg = ["UserVsUser", UserVsUser.FrontendMsg] | InputMode

export type BackendMsg = ["UserVsUser", UserVsUser.BackendMsg]

export type ToFrontend = ["UserVsUser", UserVsUser.ToFrontend] | InputMode_Done

export type ToBackend = ["UserVsUser", UserVsUser.ToBackend] | InputMode

// 
// 
// 
// 
// 

type InputMode = ["InputMode", { mode: Mode, userId: UserId.UserId }]
type InputMode_Done = ["InputMode_Done", BackendModel]

