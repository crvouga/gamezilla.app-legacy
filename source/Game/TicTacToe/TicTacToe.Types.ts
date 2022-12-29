import { Result } from "../../Core/Result"
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
  | { mode: "None" }
  | { mode: "VsUser"; child: VsUser.FrontendModel }
  | { mode: "VsBot"; child: VsBot.FrontendModel }

export type BackendModel =
  | { mode: "None" }
  | { mode: "VsUser"; child: VsUser.BackendModel }
  | { mode: "VsBot"; child: VsBot.BackendModel }

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["VsUser", VsUser.FrontendMsg]
  | ["VsBot", VsBot.FrontendMsg]
  | InputMode

export type BackendMsg =
  | ["VsUser", VsUser.BackendMsg]
  | ["VsBot", VsBot.BackendMsg]

export type ToBackend =
  | ["VsUser", VsUser.ToBackend]
  | ["VsBot", VsBot.ToBackend]
  | InputMode

export type ToFrontend =
  | ["VsUser", VsUser.ToFrontend]
  | ["VsBot", VsBot.ToFrontend]
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
