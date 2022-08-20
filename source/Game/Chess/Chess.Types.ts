import * as ChessTs from "chess.ts"
import { Audio, Browser, Option, RemoteData, Result, Unit } from "../../Core"
import { remove } from "../../Core/Record"
import { UserId } from "../../Data"

//
//
//
// Chess
//
//
//

export const getInitialFen = () => {
  return new ChessTs.Chess().fen()
}

export const fenToBoard = (fen: string) => {
  return new ChessTs.Chess(fen).board()
}

export const move = (
  moveData: ChessTs.PartialMove,
  model: SharedModel,
): MoveResult => {
  const chess = new ChessTs.Chess(model.fen)

  const moved = chess.move(moveData)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  const modelNew: SharedModel = {
    ...model,
    fen: chess.fen(),
  }

  return Result.Ok(modelNew)
}

export const inCheck = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inCheck()
}

export const inDraw = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inDraw()
}

export const inCheckmate = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inCheckmate()
}

export const inStalemate = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inStalemate()
}

export type Mode =
  | ["GameSetup", { White?: UserId.UserId; Black?: UserId.UserId }]
  | ["GameStarted", { White: UserId.UserId; Black: UserId.UserId }]

export type PlayerType = "White" | "Black"

//
//
//
// Model
//
//
//

export type SharedModel = {
  fen: string
  mode: Mode
}

export type Player = ["User", { userId: UserId.UserId }] | ["None"]

export type FrontendModel = SharedModel & {
  boardWidth: number
  startGame: RemoteData.RemoteData<StartGameProblem, Unit>
  playAs: RemoteData.RemoteData<PlayAsProblem, Unit>
  stopPlaying: RemoteData.RemoteData<StopPlayingProblem, Unit>
  menu: ["Closed"] | ["Opened", { menuId: string }]
}

export type BackendModel = SharedModel

//
//
//
// Init
//
//
//

export const initSharedModel: SharedModel = {
  fen: getInitialFen(),
  mode: ["GameSetup", {}],
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["GetElementResulted", Browser.GetElementByIdResult]
  | ["BrowserResized", Browser.Resize]
  | ["AudioResulted", Audio.PlayResult]
  | ["PressedPlayerSlot", PlayerType]
  | ["ClosedMenu"]
  | Request

export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | Response

export type ToBackend = Request

//
//
//
//
//
//

export type Request = Move | PlayAs | StopPlaying | StartGame

export type Response =
  | MoveResulted
  | PlayAsResulted
  | StopPlayingResulted
  | StartGameResulted

//
//
//

export type Move = ["Move", ChessTs.PartialMove & { userId: UserId.UserId }]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = Result.Result<"invalid_move", SharedModel>

//
//
//

export type PlayAs = [
  "PlayAs",
  { userId: UserId.UserId; playerType: PlayerType },
]
export type PlayAsResulted = ["PlayAsResulted", PlayAsResult]
export type PlayAsProblem = "game_must_be_in_setup_mode" | "player_is_taken"
export type PlayAsResult = Result.Result<PlayAsProblem, SharedModel>

export const playAs = (
  { userId, playerType }: PlayAs[1],
  model: SharedModel,
): PlayAsResult => {
  if (model.mode[0] !== "GameSetup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const playerId = model.mode[1][playerType]

  if (playerId) {
    return Result.Err("player_is_taken")
  }

  const modelNew: SharedModel = {
    ...model,
    mode: ["GameSetup", { ...model.mode[1], [playerType]: userId }],
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//

export type StopPlaying = [
  "StopPlaying",
  { userId: UserId.UserId; playerType: PlayerType },
]
export type StopPlayingResulted = ["StopPlayingResulted", StopPlayingResult]
export type StopPlayingResult = Result.Result<StopPlayingProblem, SharedModel>
export type StopPlayingProblem =
  | "game_must_be_in_setup_mode"
  | "player_is_not_playing"
  | "user_is_not_the_player"

export const stopPlaying = (
  { userId, playerType }: StopPlaying[1],
  model: SharedModel,
): StopPlayingResult => {
  if (model.mode[0] !== "GameSetup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const playerId = model.mode[1][playerType]

  if (!playerId) {
    return Result.Err("player_is_not_playing")
  }

  if (playerId !== userId) {
    return Result.Err("user_is_not_the_player")
  }

  const modelNew: SharedModel = {
    ...model,
    mode: ["GameSetup", remove(playerType, model.mode[1])],
  }

  return Result.Ok(modelNew)
}

//
//
//
//

export type StartGame = ["StartGame"]
export type StartGameResulted = ["StartGameResulted", StartGameResult]
export type StartGameProblem = "can_not_start_game"
export type StartGameResult = Result.Result<StartGameProblem, SharedModel>

export const canStartGame = (model: SharedModel): boolean => {
  return (
    model.mode[0] === "GameSetup" &&
    model.mode[1].White !== undefined &&
    model.mode[1].Black !== undefined
  )
}

export const startGame = (model: SharedModel): StartGameResult => {
  const { mode } = model
  const { White, Black } = mode[1]

  if (mode[0] === "GameSetup" && White && Black) {
    const modelNew: SharedModel = {
      ...model,
      mode: ["GameStarted", { White, Black }],
    }

    return Result.Ok(modelNew)
  }

  return Result.Err("can_not_start_game")
}
