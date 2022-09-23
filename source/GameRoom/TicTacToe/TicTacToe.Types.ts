import { Option, Result } from "../../Core"
import { UserId } from "../../Data"
import * as TicTacToe from "./TicTacToe"

//
//
//
// Model
//
//
//

export type SharedModel =
  | SetupModel
  | GameModel

export type SetupModel = {
  type: "Setup",
  X: UserId.UserId | "None",
  O: UserId.UserId | "None",
  bestOutOf: BestOutOf
  moveTimeLimit: MoveTimeLimit
}

export type GameModel = {
  type: "Game",
  X: UserId.UserId,
  O: UserId.UserId,
  bestOutOf: BestOutOf
  moveTimeLimit: MoveTimeLimit,
  moveCountDown: number
  board: TicTacToe.Board
  resignation: Resignation,
  round: RoundModel,
}

type RoundModel =
  | {
    type: "Starting",
    countDown: number
  }
  | {
    type: "Started"
  }

type Resignation =
  | { type: "None" }
  | { type: "Resignation"; resigner: UserId.UserId }

export type RoundStatus =
  | {
    type: "Starting",
    countDown: number
  }
  | {
    type: "Started",
  }


export type BestOutOf = 1 | 3 | 5

export const allBestOutOf: BestOutOf[] = [1, 3, 5]

export const bestOutOfToString = (bestOutOf: BestOutOf): string => {
  switch (bestOutOf) {
    case 1: return "One"
    case 3: return "Three"
    case 5: return "Five"
  }
}

export type MoveTimeLimit = 3 | 5 | 10

export const allMoveTimeLimit: MoveTimeLimit[] = [3, 5, 10]

export const moveTimeLimitToString = (moveTimeLimit: MoveTimeLimit): string => {
  switch (moveTimeLimit) {
    case 3: return "3 Sec"
    case 5: return "5 Sec"
    case 10: return "10 Sec"
  }

}

export type GameOver =
  | {
    type: "Resignation"
    resigner: UserId.UserId
  }
  | TicTacToe.GameOver

export const toGameOver = (model: SharedModel): GameOver | { type: "None" } => {
  if (model.type !== "Game") {
    return { type: "None" }
  }

  if (model.resignation.type !== "None") {
    return model.resignation
  }

  const gameOver = TicTacToe.toGameOver(model.board)

  return gameOver
}

export const initSharedModel: SharedModel = {
  type: "Setup",
  O: "None",
  X: "None",
  bestOutOf: 3,
  moveTimeLimit: 5,
}

export type FrontendModel = SharedModel & {
  openedModal: "None" | ModalName
}

export type BackendModel = SharedModel


//
//
//
// Msg
//
//
//

type ModalName = "Resignation"

export type FrontendMsg = Req | ["OpenModal", ModalName] | ["CloseModal"]

export type BackendMsg = RoundCountDown | MoveCountDown

export type ToBackend = Req

export type ToFrontend = Res | RoundCountDown_Done | MoveCountDown_Done

export type GameMsg = ["ClickedBoard", TicTacToe.Position]

export type Req =
  | InputPlayer
  | InputMoveTimeLimit
  | InputBestOutOf
  | StopPlaying
  | StartGame
  | Resign
  | InputMove
  | NewGame

export type Res =
  | InputPlayer_Done
  | InputBestOutOf_Done
  | InputMoveTimeLimit_Done
  | StopPlaying_Done
  | StartGame_Done
  | Resign_Done
  | InputMove_Done
  | NewGame_Done

//
//
//
//
//
//
//

type InputPlayer = [
  "InputPlayer",
  { userId: UserId.UserId; playerType: TicTacToe.PlayerType },
]
type InputPlayer_Done = [
  "InputPlayer_Done",
  Result.Result<InputPlayerProblem, SharedModel>,
]
type InputPlayerProblem = "player_is_taken" | "must_be_in_setup_mode"

export const inputPlayer = (
  { userId, playerType }: InputPlayer[1],
  model: SharedModel,
): InputPlayer_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  const targetPlayer = model[playerType]

  if (targetPlayer !== "None") {
    return Result.Err("player_is_taken")
  }

  const otherPlayer = model[TicTacToe.toOpposite(playerType)]

  const otherPlayerNew =
    otherPlayer !== "None" && otherPlayer === userId ? "None" : otherPlayer

  const modelNew: SharedModel = {
    ...model,
    [playerType]: userId,
    [TicTacToe.toOpposite(playerType)]: otherPlayerNew,
  }

  return Result.Ok(modelNew)
}

type StopPlaying = ["StopPlaying", { userId: UserId.UserId }]
type StopPlaying_Done = [
  "StopPlaying_Done",
  Result.Result<StopPlayingProblem, SharedModel>,
]
type StopPlayingProblem = "must_be_in_setup_mode" | "not_playing"

export const stopPlaying = (
  { userId }: StopPlaying[1],
  model: SharedModel,
): StopPlaying_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  const isPlayingX = model.X === userId
  const isPlayingO = model.O === userId

  if (!isPlayingX && !isPlayingO) {
    return Result.Err("not_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    X: isPlayingX ? "None" : model.X,
    O: isPlayingO ? "None" : model.O,
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//

type StartGame = ["StartGame", { userId: UserId.UserId }]
type StartGame_Done = [
  "StartGame_Done",
  Result.Result<StartGameProblem, SharedModel>,
]
type StartGameProblem =
  | "not_in_setup_mode"
  | "missing_x"
  | "missing_o"
  | "missing_both"
  | "not_playing"

export const startGame = (
  { userId }: StartGame[1],
  model: SharedModel,
): StartGame_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("not_in_setup_mode")
  }

  if (model.X !== userId && model.O !== userId) {
    return Result.Err("not_playing")
  }

  if (model.X === "None" && model.O === "None") {
    return Result.Err("missing_both")
  }

  if (model.X === "None") {
    return Result.Err("missing_x")
  }

  if (model.O === "None") {
    return Result.Err("missing_o")
  }


  const modelNew: SharedModel = {
    type: "Game",
    board: TicTacToe.emptyBoard,
    X: model.X,
    O: model.O,
    moveTimeLimit: model.moveTimeLimit,
    moveCountDown: model.moveTimeLimit,
    resignation: { type: "None" },
    bestOutOf: model.bestOutOf,
    round: {
      type: "Starting",
      countDown: 3
    }
  }

  return Result.Ok(modelNew)
}


//
//
//
//
//

type Resign = ["Resign", { userId: UserId.UserId }]
type Resign_Done = ["Resign_Done", Result.Result<ResignProblem, SharedModel>]
type ResignProblem = "not_in_game_mode" | "game_is_already_over"

export const resign = (
  { userId }: Resign[1],
  model: SharedModel,
): Resign_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("not_in_game_mode")
  }

  const gameOver = toGameOver(model)

  if (gameOver.type !== "None") {
    return Result.Err("game_is_already_over")
  }

  const modelNew: SharedModel = {
    ...model,
    resignation: {
      type: "Resignation",
      resigner: userId,
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//

type InputMove = [
  "InputMove",
  { userId: UserId.UserId; position: TicTacToe.Position },
]
type InputMove_Done = [
  "InputMove_Done",
  Result.Result<InputMoveProblem, SharedModel>,
]
type InputMoveProblem = TicTacToe.MoveProblem | "not_playing" | "not_game_mode" | "round_not_started"

export const inputMove = (
  { userId, position }: InputMove[1],
  model: SharedModel,
): InputMove_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("not_game_mode")
  }

  if (model.round.type !== 'Started') {
    return Result.Err("round_not_started")
  }

  const playerType: TicTacToe.PlayerType | "None" =
    model.O === userId ? "O" : model.X === userId ? "X" : "None"

  if (playerType === "None") {
    return Result.Err("not_playing")
  }

  const result = TicTacToe.move(model.board, playerType, position)

  if (result.type === "Err") {
    return result
  }

  const boardNew = result.value

  const modelNew: SharedModel = {
    ...model,
    board: boardNew,
    moveCountDown: model.moveTimeLimit
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 
// 

type NewGame = ['NewGame', { userId: UserId.UserId }]
type NewGame_Done = ['NewGame_Done', Result.Result<NewGameProblem, SharedModel>]
type NewGameProblem = "not_playing" | "not_game_over" | "not_in_game_mode"

export const newGame = ({ userId }: NewGame[1], model: SharedModel): NewGame_Done[1] => {
  const gameOver = toGameOver(model)

  if (gameOver.type === 'None') {
    return Result.Err("not_game_over")
  }

  if (model.type !== 'Game') {
    return Result.Err("not_in_game_mode")
  }

  if (model.X !== userId && model.O !== userId) {
    return Result.Err("not_playing")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    moveTimeLimit: model.moveTimeLimit,
    O: model.O,
    X: model.X,
    bestOutOf: model.bestOutOf
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 
// 

type InputBestOutOf = ["InputBestOutOf", { userId: UserId.UserId, bestOutOf: BestOutOf }]
type InputBestOutOf_Done = ["InputBestOutOf_Done", Result.Result<InputBestOutOfProblem, SharedModel>]
type InputBestOutOfProblem = "not_in_setup_mode" | "not_playing"

export const inputBestOutOf = ({ userId, bestOutOf }: InputBestOutOf[1], model: SharedModel): InputBestOutOf_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err("not_in_setup_mode")
  }

  if (model.X !== userId && model.O !== userId) {
    return Result.Err("not_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    bestOutOf
  }

  return Result.Ok(modelNew)
}

export const inputBestOutOfToString = (result: InputBestOutOf_Done[1]): string => {
  if (result.type === 'Ok') {
    return ""
  }

  switch (result.error) {
    case 'not_in_setup_mode': {
      return "Must be in setup mode to change"
    }

    case 'not_playing': {
      return "Must be playing to change"
    }
  }
}

// 
// 
// 
// 
// 
// 

type InputMoveTimeLimit = ["InputMoveTimeLimit", { userId: UserId.UserId, moveTimeLimit: MoveTimeLimit }]
type InputMoveTimeLimit_Done = ["InputMoveTimeLimit_Done", Result.Result<InputMoveTimeLimitProblem, SharedModel>]
type InputMoveTimeLimitProblem = "not_in_setup_mode" | "not_playing"

export const inputMoveTimeLimit = ({ userId, moveTimeLimit }: InputMoveTimeLimit[1], model: SharedModel): InputMoveTimeLimit_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err("not_in_setup_mode")
  }

  if (model.X !== userId && model.O !== userId) {
    return Result.Err("not_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    moveTimeLimit
  }

  return Result.Ok(modelNew)
}

export const inputMoveTimeLimitToString = (result: InputMoveTimeLimit_Done[1]): string => {
  if (result.type === 'Ok') {
    return ""
  }

  switch (result.error) {
    case 'not_in_setup_mode': {
      return "Must be in setup move to change"
    }

    case 'not_playing': {
      return "Must be playing to change"
    }
  }
}


// 
// 
// 
// Round Count Down Elapsed
// 
// 
// 

type RoundCountDown = ['RoundCountDown']
type RoundCountDown_Done = ['RoundCountDown_Done', Result.Result<RoundCountDownProblem, SharedModel>]
type RoundCountDownProblem = "not_in_game_mode" | "round_not_starting"

export const roundCountDown = (model: SharedModel): RoundCountDown_Done[1] => {

  if (model.type !== 'Game') {
    return Result.Err("not_in_game_mode")
  }

  if (model.round.type !== 'Starting') {
    return Result.Err("round_not_starting")
  }

  const countDownNew = Math.max(model.round.countDown - 1, 0)

  if (countDownNew === 0) {
    const modelNew: SharedModel = {
      ...model,
      round: {
        type: "Started"
      }
    }

    return Result.Ok(modelNew)
  }


  const modelNew: SharedModel = {
    ...model,
    round: {
      type: "Starting",
      countDown: countDownNew
    }
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 
// 

type MoveCountDown = ['MoveCountDown']
type MoveCountDown_Done = ['MoveCountDown_Done', Result.Result<MoveCountDownProblem, SharedModel>]
type MoveCountDownProblem = "not_in_game_mode" | "round_not_started" | "no_empty_positions" | TicTacToe.MoveProblem

export const moveCountDown = (model: SharedModel): MoveCountDown_Done[1] => {
  if (model.type !== 'Game') {
    return Result.Err("not_in_game_mode")
  }

  if (model.round.type !== 'Started') {
    return Result.Err("round_not_started")
  }

  const countDownNew = Math.max(model.moveCountDown - 1, 0)

  if (countDownNew > 0) {
    const modelNew: SharedModel = {
      ...model,
      moveCountDown: countDownNew
    }

    return Result.Ok(modelNew)
  }

  const emptyPositions = TicTacToe.toEmptyPositions(model.board)

  const randomPosition = emptyPositions[Math.floor(emptyPositions.length * Math.random())]

  if (!randomPosition) {
    return Result.Err("no_empty_positions")
  }

  const turn = TicTacToe.toTurn(model.board)

  const result = TicTacToe.move(model.board, turn, randomPosition)

  if (result.type === 'Err') {
    return result
  }

  const modelNew: SharedModel = {
    ...model,
    board: result.value,
    moveCountDown: model.moveTimeLimit
  }

  return Result.Ok(modelNew)

}