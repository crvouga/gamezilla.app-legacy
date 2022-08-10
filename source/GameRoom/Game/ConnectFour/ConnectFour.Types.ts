import { UserId } from "../../../Data"
import { ConnectFour } from "../../../Games"

//
//
//
// Model
//
//
//

export type SharedModel = {
  columns: ConnectFour.Columns
}

export const initSharedModel: SharedModel = {
  columns: ConnectFour.emptyColumns,
}

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

//
//
//
// Msg
//
//
//

export type FrontendMsg = Move

export type BackendMsg = ["None"]

export type ToFrontend = ["None"]

export type ToBackend = Move

export type Move = [
  "Move",
  { userId: UserId.UserId; columnIndex: ConnectFour.ColumnIndex },
]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = ConnectFour.MoveResult
