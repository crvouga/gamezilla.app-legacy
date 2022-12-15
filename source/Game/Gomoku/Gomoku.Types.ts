import { Result } from "../../Core"
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
    | {
        type: "None"
    }
    | {
        type: "UserVsUser"
        child: UserVsUser.FrontendModel
    }
    | {
        type: "UserVsBot",
        child: UserVsBot.FrontendModel
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
        type: "UserVsBot",
        child: UserVsBot.BackendModel
    }

export type Mode = BackendModel['type']

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req | ["UserVsUser", UserVsUser.FrontendMsg] | ["UserVsBot", UserVsBot.FrontendMsg]

export type BackendMsg = ["UserVsUser", UserVsUser.BackendMsg] | ["UserVsBot", UserVsBot.BackendMsg]

export type ToFrontend = Res | ["UserVsUser", UserVsUser.ToFrontend] | ["UserVsBot", UserVsBot.ToFrontend]

export type ToBackend = Req | ["UserVsUser", UserVsUser.ToBackend] | ["UserVsBot", UserVsBot.ToBackend]

// 
// 
// 
// 
// 

export type Req = ['InputMode', { userId: UserId, mode: Mode }]

export type Res = ['InputMode', { userId: UserId, mode: Mode }, Result<Problem, BackendModel>]

export type Problem = "must_be_host"