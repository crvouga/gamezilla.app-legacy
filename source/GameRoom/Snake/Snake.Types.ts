import { Keyboard, Option, Result } from "../../Core"
import { UserId } from "../../Data"
import * as Direction from "./Direction"
import * as Snake from "./Snake"

//
//
//
// Model
//
//
//

export type BackendModel = SharedModel

export type FrontendModel = SharedModel & {
  openedMenuId: Option.Option<string>
}

export type SharedModel = Snake.Model & {
  gameStatus:
  | {
    type: "GameSetup"
    player: Option.Option<Player>
  }
  | {
    type: "GameStarted"
    player: Player
  }
}

export type Player = ["User", UserId.UserId]

export type MouseStatus = "Active" | "Inactive"

//
//
// Init
//
//

export const initSharedModel: SharedModel = {
  ...Snake.init,
  gameStatus: {
    type: "GameSetup",
    player: Option.None,
  },
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
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | Request

export type BackendMsg = ["Tick"]

export type ToBackend = Request

export type ToFrontend = ["Sync", SharedModel] | Response

export type Request = ToggleStatus | InputPlayer | InputDirection | StartGame

export type Response =
  | InputDirection_Done
  | ToggleStatus_Done
  | InputPlayer_Done
  | StartGame_Done

//
//
//

export type InputDirection = [
  "InputDirection",
  { direction: Direction.Direction; userId: UserId.UserId },
]

export type InputDirection_Done = [
  "InputDirection_Done",
  Result.Result<InputDirectionProblem, SharedModel>,
]

export type InputDirectionProblem =
  | "user_must_be_the_current_player"
  | "must_be_in_game_started"

//
//
//

export type ToggleStatus = ["ToggleStatus", { userId: UserId.UserId }]

export type ToggleStatus_Done = ["ToggleStatus_Done", ToggleStatusResult]

export type ToggleStatusResult = Result.Result<
  "user_must_be_the_current_player" | "must_be_in_game_started",
  SharedModel
>

//
//
//
//

export type InputPlayer = ["InputPlayer", Option.Option<Player>]

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result.Result<"must_be_in_game_setup", SharedModel>,
]

export type StartGame = ["StartGame"]
export type StartGame_Done = [
  "StartGame_Done",
  Result.Result<"must_be_in_game_setup" | "missing_player", SharedModel>,
]

export const canStartGame = (model: SharedModel): boolean => {
  return (
    model.gameStatus.type === "GameSetup" &&
    model.gameStatus.player.type === "Some"
  )
}

export const startGame = (model: SharedModel): StartGame_Done[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.Err("must_be_in_game_setup")
  }

  if (model.gameStatus.player.type === "None") {
    return Result.Err("missing_player")
  }

  const playerUserId = model.gameStatus.player.value[1]

  const modelNew: SharedModel = {
    ...model,
    gameStatus: {
      type: "GameStarted",
      player: ["User", playerUserId],
    },
  }

  return Result.Ok(modelNew)
}
