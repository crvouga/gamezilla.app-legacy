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
  | { mode: "none" }
  | { mode: "vs-user"; child: VsUser.FrontendModel }
  | { mode: "vs-bot"; child: VsBot.FrontendModel }

export type BackendModel =
  | { mode: "none" }
  | { mode: "vs-user"; child: VsUser.BackendModel }
  | { mode: "vs-bot"; child: VsBot.BackendModel }

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["vs-user", VsUser.FrontendMsg]
  | ["vs-bot", VsBot.FrontendMsg]
  | InputMode

export type BackendMsg =
  | ["vs-user", VsUser.BackendMsg]
  | ["vs-bot", VsBot.BackendMsg]

export type ToBackend =
  | ["vs-user", VsUser.ToBackend]
  | ["vs-bot", VsBot.ToBackend]
  | InputMode

export type ToFrontend =
  | ["vs-user", VsUser.ToFrontend]
  | ["vs-bot", VsBot.ToFrontend]
  | InputMode_Done

//
//
//
//
//
//

type InputMode = ["input-mode", { mode: BackendModel["mode"]; userId: UserId }]
type InputMode_Done = ["input-mode-done", Result<InputModeProblem, BackendModel>]
type InputModeProblem = "unknown"
