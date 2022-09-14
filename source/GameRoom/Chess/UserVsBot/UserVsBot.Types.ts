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

export const isBotTurn = (model: SharedModel) => {
  return model.type === 'Game' && Board.toTurn(model.board) !== model.userColor
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

export type BackendMsg = BotMoved

export type ToBackend = ["Init"] | Req

export type ToFrontend = ["Sync", SharedModel] | ["GameOver"] | Res | BotMoved_Done

export type Req = InputUser | InputColor | InputBot | StartGame | StopGame | InputMove

export type Res =
  | InputUser_Done
  | InputColor_Done
  | InputBot_Done
  | StartGame_Done
  | StopGame_Done
  | InputMove_Done


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
  Result.Result<InputColorProblem, SharedModel>,
]

export type InputColorProblem = "must_be_playing" | "must_be_in_setup_mode"

export const inputColorProblemToString = (
  problem: InputColorProblem,
): string => {
  switch (problem) {
    case "must_be_in_setup_mode": {
      return "Must be in setup mode"
    }

    case "must_be_playing": {
      return "Must be playing to change color"
    }
  }
}

export const inputColor = (
  { userColor, userId }: InputColor[1],
  model: SharedModel,
): InputColor_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  if (model.userId.type === "None") {
    return Result.Err("must_be_playing")
  }

  if (model.userId.value !== userId) {
    return Result.Err("must_be_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    userColor,
  }

  return Result.Ok(modelNew)
}

//
//
//
//

export type InputBot = [
  "InputBot",
  { botDifficulty: BotDifficulty; userId: UserId.UserId },
]
export type InputBot_Done = [
  "InputBot_Done",
  Result.Result<InputBotProblem, SharedModel>,
]
export type InputBotProblem = "must_be_in_setup_mode" | "must_be_playing"

export const inputBotProblemToString = (problem: InputBotProblem): string => {
  switch (problem) {
    case "must_be_in_setup_mode": {
      return "Must be in setup mode"
    }

    case "must_be_playing": {
      return "Must be playing to change bot"
    }
  }
}

export const inputBot = (
  { botDifficulty, userId }: InputBot[1],
  model: SharedModel,
): InputBot_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  if (model.userId.type === "None") {
    return Result.Err("must_be_playing")
  }

  if (model.userId.value !== userId) {
    return Result.Err("must_be_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    botDifficulty,
  }
  return Result.Ok(modelNew)
}

export type StartGame = ["StartGame", { userId: UserId.UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result.Result<StartGameProblem, SharedModel>,
]
export type StartGameProblem =
  | "must_be_in_setup_mode"
  | "user_is_missing"
  | "must_be_the_player"

export const startGameProblemToString = (problem: StartGameProblem): string => {
  switch (problem) {
    case "must_be_in_setup_mode": {
      return "Game must be in setup mode"
    }

    case "must_be_the_player": {
      return "Must be playing to start game"
    }

    case "user_is_missing": {
      return "Nobody is playing"
    }
  }
}

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
  Result.Result<"must_be_started" | "must_be_playing", SharedModel>,
]
export const stopGame = (
  { userId }: StopGame[1],
  model: SharedModel,
): StopGame_Done[1] => {

  if (model.type !== "Game") {
    return Result.Err("must_be_started")
  }

  if (model.userId !== userId) {
    return Result.Err("must_be_playing")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    botDifficulty: model.botDifficulty,
    userColor: model.userColor,
    userId: Option.Some(model.userId),
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 
// 
// 

export type InputMove = ["InputMove", Board.MoveInput & { userId: UserId.UserId }]

export type InputMove_Done = [
  "InputMove_Done",
  Result.Result<InputMoveProblem, SharedModel & { didCapture: boolean }>,
]

export type InputMoveProblem =
  | Board.MoveProblem
  | "must_be_started"
  | "must_be_playing"
  | "must_be_turn"

export const inputMove = (
  { userId, ...moveInput }: InputMove[1],
  model: SharedModel,
): InputMove_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("must_be_started")
  }

  if (model.userId !== userId) {
    return Result.Err("must_be_playing")
  }


  if (Board.toTurn(model.board) !== model.userColor) {
    return Result.Err("must_be_turn")
  }

  const result = Board.move(moveInput, model.board)

  if (result.type === "Err") {
    return result
  }

  const boardNew = result.value

  if (Board.inCheckmate(boardNew)) {
    const modelNew: SharedModel = {
      ...model,
      type: "GameOver",
      gameOver: {
        type: "Checkmate",
        winner: Board.toTurn(boardNew)
      }
    }

    return Result.Ok({
      ...modelNew,
      didCapture: boardNew.didCapture,
    })
  }

  const modelNew: SharedModel = {
    ...model,
    board: boardNew,
  }

  return Result.Ok({
    ...modelNew,
    didCapture: boardNew.didCapture,
  })
}

// 
// 
// 
// Bot Moved
// 
// 
// 

export type BotMoved = ['BotMoved', Board.MoveInput]
export type BotMoved_Done = ['BotMoved_Done', Result.Result<BotMovedProblem, SharedModel>]
export type BotMovedProblem =
  | Board.MoveProblem
  | "must_be_started"
  | "must_be_turn"

export const botMoved = (moveInput: BotMoved[1], model: SharedModel): BotMoved_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("must_be_started")
  }

  if (Board.toTurn(model.board) !== model.userColor) {
    return Result.Err("must_be_turn")
  }

  const result = Board.move(moveInput, model.board)

  if (result.type === "Err") {
    return result
  }

  return Result.Ok(model)
}