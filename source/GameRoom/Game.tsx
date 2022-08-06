import * as Games from "../Games"
import { GameModel } from "./Types"

//
//
//
// Model
//
//
//

type Model = GameModel

export const init = (gameName: Games.Name): Model => {
  switch (gameName) {
    case "ConnectFour":
      return ["ConnectFour", Games.ConnectFour.init]

    case "Snake":
      return ["Snake", Games.Snake.init]

    case "TicTacToe":
      return ["TicTacToe", Games.TicTacToe.init]
  }
}
