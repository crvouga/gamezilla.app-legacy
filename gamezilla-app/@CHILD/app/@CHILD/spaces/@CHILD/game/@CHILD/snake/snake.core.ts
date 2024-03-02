import { Keyboard, Option, Result } from "gamezilla-app/@SHARED/core"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import * as Direction from "./@SHARED/direction"
import * as Snake from "./@SHARED/snake"

//
//
//
// Model
//
//
//

export type ModelServer = CoreModel

export type ModelClient = CoreModel & {
  openedMenuId: Option<string>
}

export type CoreModel = Snake.Model & {
  gameStatus:
    | {
        type: "GameSetup"
        player: Option<Player>
      }
    | {
        type: "GameStarted"
        player: Player
      }
}

export type Player = ["User", UserId]

export type MouseStatus = "Active" | "Inactive"

//
//
// Init
//
//

export const initCoreModel: CoreModel = {
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

export type MsgClient =
  | ["PressedKeyDown", Keyboard.Key]
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | Request

export type MsgServer = ["tick"]

export type MsgToServer = Request

export type MsgToClient = ["tick", CoreModel] | Response

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
  "input-direction",
  { direction: Direction.Direction; userId: UserId },
]

export type InputDirection_Done = [
  "InputDirection_Done",
  Result<InputDirectionProblem, CoreModel>,
]

export type InputDirectionProblem =
  | "user_must_be_the_current_player"
  | "must_be_in_game_started"

//
//
//

export type ToggleStatus = ["ToggleStatus", { userId: UserId }]

export type ToggleStatus_Done = ["ToggleStatus_Done", ToggleStatusResult]

export type ToggleStatusResult = Result<
  "user_must_be_the_current_player" | "must_be_in_game_started",
  CoreModel
>

//
//
//
//

export type InputPlayer = ["InputPlayer", Option<Player>]

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result<"must_be_in_game_setup", CoreModel>,
]

export type StartGame = ["start-game"]
export type StartGame_Done = [
  "StartGame_Done",
  Result<"must_be_in_game_setup" | "missing_player", CoreModel>,
]

export const canStartGame = (model: CoreModel): boolean => {
  return (
    model.gameStatus.type === "GameSetup" &&
    model.gameStatus.player.type === "Some"
  )
}

export const startGame = (model: CoreModel): StartGame_Done[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.err("must_be_in_game_setup")
  }

  if (model.gameStatus.player.type === "none") {
    return Result.err("missing_player")
  }

  const playerUserId = model.gameStatus.player.value[1]

  const modelNew: CoreModel = {
    ...model,
    gameStatus: {
      type: "GameStarted",
      player: ["User", playerUserId],
    },
  }

  return Result.ok(modelNew)
}
