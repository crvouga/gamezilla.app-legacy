import { Keyboard, Option, Result } from "../../../Core"
import { UserId } from "../../../Data"
import * as Snake from "../../../Games/Snake"

//
//
//
// Model
//
//
//

export type BackendModel = SharedModel

export type FrontendModel = SharedModel & {
  mouseStatus: MouseStatus
  touched: Option.Option<Snake.Position.Position>
}


export type SharedModel = Snake.Model & {
  player: Player
}

export type Player = ["User", UserId.UserId] | [ "None" ]

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
 ...Snake.init
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
  | ["ClickedRestart"]
  | ["AudioFailed"]
  | ["AudioSucceeded"]
  | ["MouseDownBoard"]
  | ["MouseUpBoard"]
  | ["PressedKeyDown", Keyboard.Key]
  | ["MouseMovedBoard", Snake.Position.Position]
  | ["TouchMoveBoard", Snake.Position.Position]
  | ToggleStatus
  | ChangePlayer

export type BackendMsg = ["Tick"]

export type ToBackend = 
  | ChangeDirection 
  | ToggleStatus
  | ChangePlayer

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
  {direction: Snake.Direction.Direction, userId: UserId.UserId}
]

export type ChangeDirectionResulted = ["ChangeDirectionResulted", ChangeDirectionResult]

export type ChangeDirectionProblem = "user_must_be_the_current_player"

export type ChangeDirectionResult = Result.Result<ChangeDirectionProblem, SharedModel>

// 
// 
// 

export type ToggleStatus = [
  "ToggleStatus",
  {userId: UserId.UserId}
]

export type ToggleStatusResulted = ["ToggleStatusResulted", ToggleStatusResult]

export type ToggleStatusResult = Result.Result<"user_must_be_the_current_player", SharedModel>

// 
// 
// 
// 

export type ChangePlayer = [
  "ChangePlayer",
  {player: Player}
]

export type ChangePlayerResulted = ["ChangePlayerResulted", ChangePlayerResult]

export type ChangePlayerResult = Result.Result<"user_must_be_the_host", SharedModel>

