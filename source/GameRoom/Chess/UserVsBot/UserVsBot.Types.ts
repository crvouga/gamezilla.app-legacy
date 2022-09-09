import { Audio, Option, Result } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"

//
//
//
// Model
//
//
//

export type FrontendModel = {
  sharedModel: SharedModel
  openedMenuId: Option.Option<string>
  openedModal: "None"
  isFlipped: boolean
}

export type BackendModel = SharedModel

export type SharedModel = SetupModel | GameModel | GameOverModel

export type SetupModel = {
  type: "Setup"
  userColor: Board.Color
  userId: Option.Option<UserId.UserId>
  botDifficulty: BotDifficulty
}

export type GameModel = {
  type: "Game"
  userColor: Board.Color
  userId: UserId.UserId
  board: Board.Model
  botDifficulty: BotDifficulty
}

export type GameOverModel = {
  type: "GameOver"
  gameOver: GameOver
  userColor: Board.Color
  userId: UserId.UserId
  board: Board.Model
  botDifficulty: BotDifficulty
}

export type GameOver =
  | {
      type: "Resignation"
      resigner: Board.Color
    }
  | {
      type: "Checkmate"
      winner: Board.Color
    }
  | {
      type: "Stalemate"
    }

export type BotDifficulty = "Easy" | "Medium" | "Hard"

export const initShared: SharedModel = {
  type: "Setup",
  userColor: "w",
  userId: Option.None,
  botDifficulty: "Medium",
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["Audio_Done", Audio.PlayResult]
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | Req

export type BackendMsg = ["None"]

export type ToBackend = ["Init"] | Req

export type ToFrontend = ["Sync", SharedModel] | ["GameOver"] | Res

export type Req = InputUser | InputColor | InputBot | StartGame | StopGame

export type Res =
  | InputUser_Done
  | InputColor_Done
  | InputBot_Done
  | StartGame_Done
  | StopGame_Done

//
//
//
//

export type InputUser = ["InputUser", { userId: Option.Option<UserId.UserId> }]
export type InputUser_Done = [
  "InputUser_Done",
  Result.Result<"must_be_in_setup_mode", SharedModel>,
]
export const inputUser = (
  { userId }: InputUser[1],
  model: SharedModel,
): InputUser_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  const modelNew: SharedModel = {
    ...model,
    userId,
  }

  return Result.Ok(modelNew)
}

export type InputColor = [
  "InputColor",
  { userColor: Board.Color; userId: UserId.UserId },
]
export type InputColor_Done = [
  "InputColor_Done",
  Result.Result<"must_be_in_setup_mode", SharedModel>,
]
export const inputColor = (
  { userColor, userId }: InputColor[1],
  model: SharedModel,
): InputColor_Done[1] => {
  const modelNew: SharedModel = {
    ...model,
    userColor,
  }
  return Result.Ok(modelNew)
}

export type InputBot = [
  "InputBot",
  { botDifficulty: BotDifficulty; userId: UserId.UserId },
]
export type InputBot_Done = [
  "InputBot_Done",
  Result.Result<"must_be_in_setup_mode", SharedModel>,
]
export const inputBot = (
  { botDifficulty, userId }: InputBot[1],
  model: SharedModel,
): InputColor_Done[1] => {
  const modelNew: SharedModel = {
    ...model,
    botDifficulty,
  }
  return Result.Ok(modelNew)
}

export const canStartGame = (model: SharedModel): boolean => {
  return model.type === "Setup" && model.userId.type === "Some"
}

export type StartGame = ["StartGame", { userId: UserId.UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result.Result<
    "must_be_in_setup_mode" | "user_is_missing" | "must_be_the_player",
    SharedModel
  >,
]
export const startGame = (
  { userId }: StartGame[1],
  model: SharedModel,
): StartGame_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  if (model.userId.type === "None") {
    return Result.Err("user_is_missing")
  }

  if (model.userId.value !== userId) {
    return Result.Err("must_be_the_player")
  }

  const modelNew: SharedModel = {
    type: "Game",
    board: Board.init(),
    botDifficulty: model.botDifficulty,
    userColor: model.userColor,
    userId: model.userId.value,
  }

  return Result.Ok(modelNew)
}

//
//
//
//

export type StopGame = ["StopGame", { userId: UserId.UserId }]
export type StopGame_Done = [
  "StopGame_Done",
  Result.Result<"must_be_in_game_mode" | "must_be_the_player", SharedModel>,
]
export const stopGame = (
  { userId }: StopGame[1],
  model: SharedModel,
): StopGame_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("must_be_in_game_mode")
  }

  if (model.userId !== userId) {
    return Result.Err("must_be_the_player")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    botDifficulty: model.botDifficulty,
    userColor: model.userColor,
    userId: Option.Some(model.userId),
  }

  return Result.Ok(modelNew)
}
