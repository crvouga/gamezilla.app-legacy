import { UserId } from "../../../Data"
import * as Board from "../../../Games/TicTacToe/TicTacToe"

//
//
//
// Model
//
//
//

export type SharedModel = {
  board: Board.Board
  players: {
    [player in Board.Player]:
      | { type: "None" }
      | { type: "User"; userId: UserId.UserId }
  }
}

export const initSharedModel: SharedModel = {
  board: Board.emptyBoard,
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

export type GameMsg = ["ClickedBoard", Board.Position]
