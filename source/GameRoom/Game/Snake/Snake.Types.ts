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

export type Player = { type: "User"; userId: UserId.UserId } | { type: "None" }

export type MouseStatus = "active" | "inactive"

//
//
//
// Init
//
//
//

export const initSharedModel: SharedModel = {
  player: { type: "None" },
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
  | ["ClickedToggle"]
  | ["AudioFailed"]
  | ["AudioSucceeded"]
  | ["MouseDownBoard"]
  | ["MouseUpBoard"]
  | ["PressedKeyDown", Keyboard.Key]
  | ["MouseMovedBoard", Snake.Position.Position]
  | ["TouchMoveBoard", Snake.Position.Position]

export type BackendMsg = ["Tick"]

export type ToBackend = ChangeDirection

export type ToFrontend = ["Sync", SharedModel] | ChangeDirectionResulted

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


export const changeDirection = ({direction, userId}: ChangeDirection[1], model: SharedModel): ChangeDirectionResult => {
  if(model.player.type === 'None') {
    return Result.Err("user_must_be_the_current_player")
  }

  if(model.player.userId !== userId ) {
    return Result.Err("user_must_be_the_current_player")
  }


  const modelNew: SharedModel = {
    ...model,
    ...Snake.enqueueDirection(direction, model)
  }

  return Result.Ok(modelNew)  
}


// 
// 
// 
// 
// 
// 


export type ChangeStatus = [
  "ChangeDirection",
  {status: Snake.Status, userId: UserId.UserId}
]

export type ChangeStatusResulted = ["ChangeStatusResulted", ChangeStatusResult]

export type ChangeStatusResult = Result.Result<ChangeStatusProblem, SharedModel>

export type ChangeStatusProblem = "user_must_be_the_current_player"

export const changeStatus = ({status, userId}: ChangeStatus[1], model: SharedModel): ChangeStatusResult => {
  if(model.player.type === 'None') {
    return Result.Err("user_must_be_the_current_player")
  }

  if(model.player.userId !== userId) {
    return Result.Err("user_must_be_the_current_player")
  }

  const modelNew: SharedModel = {
    ...model,
    status: status
  }

  return Result.Ok(modelNew)
}
