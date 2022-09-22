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

export type SharedModel = {
  type: "Setup"
  players: {
    [playerType in TicTacToe.PlayerType]: UserId.UserId | "None"
  }
} | {
  type: "Game",
  players: {
    [playerType in TicTacToe.PlayerType]: UserId.UserId
  }
  board: TicTacToe.Board
  gameOver: { type: "None" } | { type: "Resignation", resigner: UserId.UserId }
}

type GameOver = {
  type: "Resignation",
  resigner: UserId.UserId,
} | {
  type: "Win",
  winner: UserId.UserId,
} | {
  type: "Tie"
}


const toGameOver = (model: SharedModel): GameOver | { type: "None" } => {

  if (model.type !== 'Game') {
    return { type: "None" }
  }

  if (model.gameOver.type !== 'None') {
    return model.gameOver
  }

  return { type: "None" }
}

export const initSharedModel: SharedModel = {
  type: "Setup",
  players: {
    O: "None",
    X: "None"
  },
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

export type ToBackend = Req

export type ToFrontend = Res

export type BackendMsg = ["Noop"]

export type GameMsg = ["ClickedBoard", TicTacToe.Position]

export type Req = InputPlayer | StopPlaying | StartGame | Resign | InputMove

export type Res = InputPlayer_Done | StopPlaying_Done | StartGame_Done | Resign_Done | InputMove_Done

// 
// 
// 
// 
// 
// 
// 

type InputPlayer = ['InputPlayer', { userId: UserId.UserId, playerType: TicTacToe.PlayerType, }]
type InputPlayer_Done = ['InputPlayer_Done', Result.Result<InputPlayerProblem, SharedModel>]
type InputPlayerProblem = "player_is_taken" | "must_be_in_setup_mode"

export const inputPlayer = ({ userId, playerType }: InputPlayer[1], model: SharedModel): InputPlayer_Done[1] => {

  if (model.type !== 'Setup') {
    return Result.Err("must_be_in_setup_mode")
  }

  const targetPlayer = model.players[playerType]

  if (targetPlayer !== 'None') {
    return Result.Err("player_is_taken")
  }

  const otherPlayer = model.players[TicTacToe.toOpposite(playerType)]

  const otherPlayerNew = otherPlayer !== 'None' && otherPlayer === userId ? "None" : otherPlayer

  const modelNew: SharedModel = {
    ...model,
    players: {
      ...model.players,
      [playerType]: userId,
      [TicTacToe.toOpposite(playerType)]: otherPlayerNew,
    }
  }

  return Result.Ok(modelNew)
}

type StopPlaying = ["StopPlaying", { userId: UserId.UserId }]
type StopPlaying_Done = ["StopPlaying_Done", Result.Result<StopPlayingProblem, SharedModel>]
type StopPlayingProblem = "must_be_in_setup_mode" | "not_playing"

export const stopPlaying = ({ userId }: StopPlaying[1], model: SharedModel): StopPlaying_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err("must_be_in_setup_mode")
  }

  const isPlayingX = model.players.X === userId
  const isPlayingO = model.players.O === userId

  if (!isPlayingX && !isPlayingO) {
    return Result.Err("not_playing")
  }

  const modelNew: SharedModel = {
    ...model,
    players: {
      X: isPlayingX ? "None" : model.players.X,
      O: isPlayingO ? "None" : model.players.O,
    }
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 

type StartGame = ["StartGame", { userId: UserId.UserId }]
type StartGame_Done = ["StartGame_Done", Result.Result<StartGameProblem, SharedModel>]
type StartGameProblem = "not_in_setup_mode" | "missing_x" | "missing_o" | "missing_both" | "not_playing"

export const startGame = ({ userId }: StartGame[1], model: SharedModel): StartGame_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err("not_in_setup_mode")
  }

  if (model.players.X !== userId && model.players.O !== userId) {
    return Result.Err("not_playing")
  }

  if (model.players.X === 'None' && model.players.O === 'None') {
    return Result.Err("missing_both")
  }

  if (model.players.X === 'None') {
    return Result.Err("missing_x")
  }

  if (model.players.O === 'None') {
    return Result.Err("missing_o")
  }

  const modelNew: SharedModel = {
    type: "Game",
    board: TicTacToe.emptyBoard,
    players: {
      X: model.players.X,
      O: model.players.O,
    },
    gameOver: { type: "None" }
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

export const resign = ({ userId }: Resign[1], model: SharedModel): Resign_Done[1] => {
  if (model.type !== 'Game') {
    return Result.Err("not_in_game_mode")
  }

  const gameOver = toGameOver(model)

  if (gameOver.type !== 'None') {
    return Result.Err("game_is_already_over")
  }

  const modelNew: SharedModel = {
    ...model,
    gameOver: {
      type: "Resignation",
      resigner: userId
    }
  }

  return Result.Ok(modelNew)
}

// 
// 
// 
// 
// 

type InputMove = ["InputMove", { userId: UserId.UserId, position: TicTacToe.Position }]
type InputMove_Done = ["InputMove_Done", Result.Result<InputMoveProblem, SharedModel>]
type InputMoveProblem = TicTacToe.MoveProblem | "not_playing" | "not_game_mode"

export const inputMove = ({ userId, position }: InputMove[1], model: SharedModel): InputMove_Done[1] => {

  if (model.type !== 'Game') {
    return Result.Err("not_game_mode")
  }

  const playerType: TicTacToe.PlayerType | "None" = model.players.O === userId ? 'O' : model.players.X === userId ? 'X' : "None"

  if (playerType === 'None') {
    return Result.Err("not_playing")
  }

  const result = TicTacToe.move(model.board, playerType, position)

  if (result.type === 'Err') {
    return result
  }

  const boardNew = result.value

  const modelNew: SharedModel = {
    ...model,
    board: boardNew
  }

  return Result.Ok(modelNew)
}