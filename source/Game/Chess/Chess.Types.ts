import { RemoteData, Result, Unit } from "../../Core"
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

export type FrontendModel = {
  mode:
  | ["none"]
  | ["vs-user", VsUser.FrontendModel]
  | ["vs-bot", VsBot.FrontendModel]

  requests: {
    InputMode: RemoteData<InputModeProblem, Unit>
  }
}

export type BackendModel =
  | ["none"]
  | ["vs-user", VsUser.BackendModel]
  | ["vs-bot", VsBot.BackendModel]

type Mode = BackendModel[0]

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
  | ["PreloadAudio_Done"]

export type BackendMsg =
  | ["vs-user", VsUser.BackendMsg]
  | ["vs-bot", VsBot.BackendMsg]

export type ToFrontend =
  | ["vs-user", VsUser.ToFrontend]
  | ["vs-bot", VsBot.ToFrontend]
  | InputMode_Done

export type ToBackend =
  | ["vs-user", VsUser.ToBackend]
  | ["vs-bot", VsBot.ToBackend]
  | InputMode

//
//
//
//
//
//

export type InputMode = ["input-mode", { mode: Mode; userId: UserId }]
export type InputMode_Done = [
  "input-mode-done",
  { mode: Mode; userId: UserId },
  Result<InputModeProblem, BackendModel>,
]
export type InputModeProblem = "must_be_the_host"

export const inputModeProblemToString = (problem: InputModeProblem): string => {
  switch (problem) {
    case "must_be_the_host": {
      return "Must be the host"
    }
  }
}
