import * as ChessTs from "chess.ts"
import { Browser, Result } from "../../../Core"
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

export const move =(moveData: ChessTs.PartialMove, model: SharedModel): MoveResult => {

  const chess= new ChessTs.Chess(model.fen)

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


//
//
//
// Model
//
//
//

export type SharedModel = {
  fen: string
}

export const initSharedModel: SharedModel = {
  fen: getInitialFen()
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

export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | MoveResulted

export type ToBackend = Move

export type Move = [
  "Move",
  { userId: UserId.UserId; } & ChessTs.PartialMove,
]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = Result.Result<"invalid_move", SharedModel>

