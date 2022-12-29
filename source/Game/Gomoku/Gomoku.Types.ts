import { Result } from "../../Core"
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
    | {
        type: "None"
    }
    | {
        type: "VsUser"
        child: VsUser.FrontendModel
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
        type: "VsUser",
        child: VsUser.BackendModel
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

export type FrontendMsg = Req | ["VsUser", VsUser.FrontendMsg] | ["UserVsBot", UserVsBot.FrontendMsg]

export type BackendMsg = ["VsUser", VsUser.BackendMsg] | ["UserVsBot", UserVsBot.BackendMsg]

export type ToFrontend = Res | ["VsUser", VsUser.ToFrontend] | ["UserVsBot", UserVsBot.ToFrontend]

export type ToBackend = Req | ["VsUser", VsUser.ToBackend] | ["UserVsBot", UserVsBot.ToBackend]

// 
// 
// 
// 
// 

export type Req = ['InputMode', { userId: UserId, mode: Mode }]

export type Res = ['InputMode', { userId: UserId, mode: Mode }, Result<Problem, BackendModel>]

export type Problem = "must_be_host"