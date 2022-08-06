import { UserId } from "../../../Data"
import { ConnectFour } from "../../../Games"

//
//
//
// Model
//
//
//

export type GameModel = {
  columns: ConnectFour.Columns
}

export const init: GameModel = {
  columns: ConnectFour.emptyColumns,
}

export type FrontendModel = GameModel

export type BackendModel = GameModel

//
//
//
// Msg
//
//
//

export type FrontendMsg = Move

export type ToBackend = Move

export type Move = [
  "Move",
  { userId: UserId.UserId; columnIndex: ConnectFour.ColumnIndex },
]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = ConnectFour.MoveResult
