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
  | ["None"]
  | ["VsUser", VsUser.FrontendModel]
  | ["VsBot", VsBot.FrontendModel]

  requests: {
    InputMode: RemoteData<InputModeProblem, Unit>
  }
}

export type BackendModel =
  | ["None"]
  | ["VsUser", VsUser.BackendModel]
  | ["VsBot", VsBot.BackendModel]

type Mode = BackendModel[0]

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
  | ["PreloadAudio_Done"]

export type BackendMsg =
  | ["VsUser", VsUser.BackendMsg]
  | ["VsBot", VsBot.BackendMsg]

export type ToFrontend =
  | ["VsUser", VsUser.ToFrontend]
  | ["VsBot", VsBot.ToFrontend]
  | InputMode_Done

export type ToBackend =
  | ["VsUser", VsUser.ToBackend]
  | ["VsBot", VsBot.ToBackend]
  | InputMode

//
//
//
//
//
//

export type InputMode = ["InputMode", { mode: Mode; userId: UserId }]
export type InputMode_Done = [
  "InputMode_Done",
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
