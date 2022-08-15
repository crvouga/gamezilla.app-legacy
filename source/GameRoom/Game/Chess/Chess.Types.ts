import * as ChessTs from "chess.ts"
import { Audio, Browser, Result } from "../../../Core"
import { UserId } from "../../../Data"

// 
// 
// 
// Chess
// 
// 
// 

export const getInitialFen = () => {
  return  new ChessTs.Chess().fen()
}


export const fenToBoard = (fen:string) => {
  return  new ChessTs.Chess(fen).board()
}

export const move = (moveData: ChessTs.PartialMove, model: SharedModel): MoveResult => {
  const chess = new ChessTs.Chess(model.fen)

  const moved = chess.move(moveData)

  if(!moved) {
    return Result.Err("invalid_move")
  }

  const modelNew: SharedModel = {
    ...model,
    fen: chess.fen()
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

//
//
//
// Model
//
//
//

export type SharedModel = {
  fen: string
  players: {
    one: Player,
    two: Player
  }
  
}

export type Player = ["User", {userId: UserId.UserId }] | ["None"]

export const initSharedModel: SharedModel = {
  fen: getInitialFen(),
  players: {
    one: ["None"],
    two: ["None"],
  }
}

export type FrontendModel = SharedModel & {
  boardWidth: number
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
| Move 
| ["GetElementResulted", Browser.GetElementByIdResult] 
| ["BrowserResized", Browser.Resize]
| ["AudioResulted", Audio.PlayResult]

export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | MoveResulted

export type ToBackend = Move

export type Move = [
  "Move",
  { userId: UserId.UserId; } & ChessTs.PartialMove,
]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = Result.Result<"invalid_move", SharedModel>

