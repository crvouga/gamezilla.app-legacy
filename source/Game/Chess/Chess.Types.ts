import { RemoteData, Result, Unit } from "../../Core"
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

export type FrontendModel = {
  mode:
    | ["None"]
    | ["UserVsUser", UserVsUser.FrontendModel]
    | ["UserVsBot", UserVsBot.FrontendModel]

  requests: {
    InputMode: RemoteData.RemoteData<InputModeProblem, Unit>
  }
}

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
  | ["PreloadAudio_Done"]

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

export type InputMode = ["InputMode", { mode: Mode; userId: UserId.UserId }]
export type InputMode_Done = [
  "InputMode_Done",
  { mode: Mode; userId: UserId.UserId },
  Result.Result<InputModeProblem, BackendModel>,
]
export type InputModeProblem = "must_be_the_host"

export const inputModeProblemToString = (problem: InputModeProblem): string => {
  switch (problem) {
    case "must_be_the_host": {
      return "Must be the host"
    }
  }
}
