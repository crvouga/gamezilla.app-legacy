import { UserId } from "../../Data"
import * as Board from "./Board"

//
//
//
// Model
//
//
//

export type Model = {
  board: Board.Board
  players: {
    [player in Board.Player]:
      | { type: "None" }
      | { type: "User"; userId: UserId.UserId }
  }
}

export const init: Model = {
  board: Board.emptyBoard,
  players: {
    O: {
      type: "None",
    },
    X: {
      type: "None",
    },
  },
}
