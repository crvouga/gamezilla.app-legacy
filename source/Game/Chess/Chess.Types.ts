import * as ChessTs from "chess.ts"
import { Audio, Browser, RemoteData, Result, Unit } from "../../Core"
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

export type Status =
  | ["GameNotReady", { White?: UserId.UserId; Black?: UserId.UserId }]
  | ["GameStarted", { White: UserId.UserId; Black: UserId.UserId }]
  | ["GameOver", { White: UserId.UserId; Black: UserId.UserId }]

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
  status: Status
}

export type Player = ["User", { userId: UserId.UserId }] | ["None"]

export const initSharedModel: SharedModel = {
  fen: getInitialFen(),
  status: ["GameNotReady", {}],
}

export type FrontendModel = SharedModel & {
  boardWidth: number
  startGame: RemoteData.RemoteData<StartGameProblem, Unit>
  playAs: RemoteData.RemoteData<PlayAsProblem, Unit>
}

export type BackendModel = SharedModel

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
  | Move
  | PlayAs
  | StartGame

export type BackendMsg = ["None"]

export type ToFrontend =
  | ["Sync", SharedModel]
  | MoveResulted
  | PlayAsResulted
  | StartGameResulted

export type ToBackend = Move | PlayAs | StartGame

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
export type PlayAsProblem = "player_type_taken" | "game_started"
export type PlayAsResult = Result.Result<PlayAsProblem, SharedModel>

export const playAs = (
  { userId, playerType }: PlayAs[1],
  model: SharedModel,
): PlayAsResult => {
  if (model.status[0] !== "GameNotReady") {
    return Result.Err("game_started")
  }

  const partialPlayers = model.status[1]

  if (partialPlayers[playerType]) {
    return Result.Err(`player_type_taken`)
  }

  const modelNew: SharedModel = {
    ...model,
    status: ["GameNotReady", { ...model.status[1], [playerType]: userId }],
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
    model.status[0] === "GameNotReady" &&
    model.status[1].White !== undefined &&
    model.status[1].Black !== undefined
  )
}

export const startGame = (model: SharedModel): StartGameResult => {
  const { status } = model
  const { White, Black } = status[1]

  if (status[0] === "GameNotReady" && White && Black) {
    const modelNew: SharedModel = {
      ...model,
      status: ["GameStarted", { White, Black }],
    }

    return Result.Ok(modelNew)
  }

  return Result.Err("can_not_start_game")
}
