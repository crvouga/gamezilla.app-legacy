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

export type Player = ["User", {userId: UserId.UserId}] | [ "None" ]

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
  | ToggleStatus
  | ["AudioFailed"]
  | ["AudioSucceeded"]
  | ["MouseDownBoard"]
  | ["MouseUpBoard"]
  | ["PressedKeyDown", Keyboard.Key]
  | ["MouseMovedBoard", Snake.Position.Position]
  | ["TouchMoveBoard", Snake.Position.Position]

export type BackendMsg = ["Tick"]

export type ToBackend = 
  | ChangeDirection 
  | ToggleStatus

export type ToFrontend =  
  | ["Sync", SharedModel] 
  | ChangeDirectionResulted 
  | ToggleStatusResulted

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
  if(model.player[0] === 'None') {
    return Result.Err("user_must_be_the_current_player")
  }

  if(model.player[1].userId !== userId ) {
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

export type ToggleStatus = [
  "ToggleStatus",
  {userId: UserId.UserId}
]

export type ToggleStatusResulted = ["ToggleStatusResulted", ToggleStatusResult]

export type ToggleStatusResult = Result.Result<"user_must_be_the_current_player", SharedModel>

export const toggleStatus = ({ userId }: ToggleStatus[1], model: SharedModel): ToggleStatusResult => {
  if(model.player[0] === 'None') {
    return Result.Err("user_must_be_the_current_player")
  }

  if(model.player[1].userId !== userId) {
    return Result.Err("user_must_be_the_current_player")
  }


  const modelNew: SharedModel = {
    ...model,
    status: model.status === 'Paused' ?  "Paused" :  "Playing"
  }

  return Result.Ok(modelNew)
}


// 
// 
// 
// 

// export const step = (model: SharedModel): StepResult => 