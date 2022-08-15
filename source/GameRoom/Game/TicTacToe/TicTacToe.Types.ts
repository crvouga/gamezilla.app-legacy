import { UserId } from "../../../Data"
import * as TicTacToe from "./TicTacToe"

//
//
//
// Model
//
//
//

export type SharedModel = {
  board: TicTacToe.Board
  players: {
    [player in TicTacToe.Player]:
      | { type: "None" }
      | { type: "User"; userId: UserId.UserId }
  }
}

export const initSharedModel: SharedModel = {
  board: TicTacToe.emptyBoard,
  players: {
    O: { type: "None" },
    X: { type: "None" },
  },
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

export type FrontendMsg = ["Noop"]

export type ToBackend = ["Noop"]

export type ToFrontend = ["Noop"]

export type BackendMsg = ["Noop"]

export type GameMsg = ["ClickedBoard", TicTacToe.Position]
