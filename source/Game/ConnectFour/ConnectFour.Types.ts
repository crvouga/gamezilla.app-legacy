import { UserId } from "../../Data"
import { ColumnIndex, Columns, emptyColumns, MoveResult } from "./ConnectFour"

//
//
//
// Model
//
//
//

export type SharedModel = {
  columns: Columns
}

export const initSharedModel: SharedModel = {
  columns: emptyColumns,
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

export type Move = ["Move", { userId: UserId.UserId; columnIndex: ColumnIndex }]
export type MoveResulted = ["MovedResulted", MoveResult]
