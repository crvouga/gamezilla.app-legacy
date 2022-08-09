import * as TicTacToe from "./TicTacToe"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"

//
//
//
// Model
//
//
//

export type GameModel =
  | ["TicTacToe", TicTacToe.GameModel]
  | ["ConnectFour", ConnectFour.GameModel]
  | ["Snake", Snake.GameModel]

export type FrontendModel = GameModel

export type BackendModel = GameModel

//
//
//
// Msg
//
//
//

export type BackendMsg =
  | ["TicTacToe", TicTacToe.BackendMsg]
  | ["ConnectFour", ConnectFour.BackendMsg]

export type FrontendMsg =
  | ["TicTacToe", TicTacToe.FrontendMsg]
  | ["ConnectFour", ConnectFour.FrontendMsg]
  | ["Snake", Snake.FrontendMsg]

//
//
//
// Helpers
//
//
//

export type GameName = GameModel[0]

export const gameNameToString = (game: GameName): string => {
  switch (game) {
    case "ConnectFour":
      return "Connect Four"

    case "TicTacToe":
      return "Tic Tac Toe"

    case "Snake":
      return "Snake"
  }
}

export const initGame = (gameName: GameName): GameModel => {
  switch (gameName) {
    case "ConnectFour": {
      return ["ConnectFour", ConnectFour.initGame]
    }

    case "Snake": {
      return ["Snake", Snake.initGame]
    }

    case "TicTacToe": {
      return ["TicTacToe", TicTacToe.initGame]
    }
  }
}
