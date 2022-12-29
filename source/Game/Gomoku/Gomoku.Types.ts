import { Result } from "../../Core"
import { UserId } from "../../Data"
import * as VsBot from "./VsBot/VsBot.Types"
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
        type: "VsBot",
        child: VsBot.FrontendModel
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
        type: "VsBot",
        child: VsBot.BackendModel
    }

export type Mode = BackendModel['type']

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req | ["VsUser", VsUser.FrontendMsg] | ["VsBot", VsBot.FrontendMsg]

export type BackendMsg = ["VsUser", VsUser.BackendMsg] | ["VsBot", VsBot.BackendMsg]

export type ToFrontend = Res | ["VsUser", VsUser.ToFrontend] | ["VsBot", VsBot.ToFrontend]

export type ToBackend = Req | ["VsUser", VsUser.ToBackend] | ["VsBot", VsBot.ToBackend]

// 
// 
// 
// 
// 

export type Req = ['InputMode', { userId: UserId, mode: Mode }]

export type Res = ['InputMode', { userId: UserId, mode: Mode }, Result<Problem, BackendModel>]

export type Problem = "must_be_host"