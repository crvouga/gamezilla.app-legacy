import * as ChessTs from "chess.ts"
import { Audio, Browser, RemoteData, Result } from "../../../Core"
import { UserId } from "../../../Data"

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

export type Status = 
  | ["NotReady"] 
  | ["Ready" , {White: UserId.UserId, Black: UserId.UserId}]

export const toStatus = (model: SharedModel):Status => {
  if(model.White[0] === 'None' || model.Black[0] === 'None') {
    return ["NotReady"]
  }

  return ['Ready', {White: model.White[1].userId, Black: model.Black[1].userId}]
}

export type PlayerType = "White" | "Black"
 
//
//
//
// Model
//
//
//

export type SharedModel = Players & {
  fen: string;
} 

type Players = {
  [player in PlayerType]: Player
}

export type Player = ["User", {userId: UserId.UserId }] | ["None"]

export const initSharedModel: SharedModel = {
  fen: getInitialFen(),
  White: ["None"],
  Black: ["None"],
}

export type FrontendModel = SharedModel & {
  boardWidth: number,
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

export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | MoveResulted | PlayAsResulted

export type ToBackend = Move | PlayAs

// 
// 
// 

export type Move = [
  "Move",
  ChessTs.PartialMove & { userId: UserId.UserId; },
]
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
export type PlayAsResult = Result.Result<`player_type_taken`, SharedModel>

export const playAs = ({userId, playerType}:PlayAs[1], model: SharedModel): PlayAsResult  => {

  if(model[playerType][0] !== 'None') {
    return Result.Err(`player_type_taken`)
  }

  const modelNew: SharedModel = {
    ...model,
    [playerType]: ['User', userId]
  }

  return Result.Ok(modelNew)
}