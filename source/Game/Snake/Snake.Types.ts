import { Keyboard, Result } from "../../Core"
import { UserId } from "../../Data"
import * as Snake from "./Snake"
import * as Direction from "./Direction"

//
//
//
// Model
//
//
//

export type BackendModel = SharedModel

export type FrontendModel = SharedModel

export type SharedModel = Snake.Model & {
  player: Player
}

export type Player = ["User", UserId.UserId] | ["None"]

export type MouseStatus = "Active" | "Inactive"

//
//
//
// Init
//
//
//

export const initSharedModel: SharedModel = {
  player: ["None"],
  ...Snake.init,
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["ClickedBack"]
  | ["PressedKeyDown", Keyboard.Key]
  | ["ClickedDirection", Direction.Direction]
  | ToggleStatus
  | ChangePlayer

export type BackendMsg = ["Tick"]

export type ToBackend = ChangeDirection | ToggleStatus | ChangePlayer

export type ToFrontend =
  | ["Sync", SharedModel]
  | ChangeDirectionResulted
  | ToggleStatusResulted
  | ChangePlayerResulted

//
//
//

export type ChangeDirection = [
  "ChangeDirection",
  { direction: Direction.Direction; userId: UserId.UserId },
]

export type ChangeDirectionResulted = [
  "ChangeDirectionResulted",
  ChangeDirectionResult,
]

export type ChangeDirectionProblem = "user_must_be_the_current_player"

export type ChangeDirectionResult = Result.Result<
  ChangeDirectionProblem,
  SharedModel
>

//
//
//

export type ToggleStatus = ["ToggleStatus", { userId: UserId.UserId }]

export type ToggleStatusResulted = ["ToggleStatusResulted", ToggleStatusResult]

export type ToggleStatusResult = Result.Result<
  "user_must_be_the_current_player",
  SharedModel
>

//
//
//
//

export type ChangePlayer = ["ChangePlayer", { player: Player }]

export type ChangePlayerResulted = ["ChangePlayerResulted", ChangePlayerResult]

export type ChangePlayerResult = Result.Result<
  "user_must_be_the_host",
  SharedModel
>
