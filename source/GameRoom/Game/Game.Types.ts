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


export type FrontendModel =
  | ["TicTacToe", TicTacToe.FrontendModel]
  | ['ConnectFour', ConnectFour.FrontendModel] 
  | ["Snake", Snake.FrontendModel] 

export type BackendModel =
  | ["TicTacToe", TicTacToe.BackendModel]
  | ['ConnectFour', ConnectFour.BackendModel] 
  | ["Snake", Snake.BackendModel] 


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
  | ["Snake", Snake.BackendMsg]

export type FrontendMsg =
  | ["TicTacToe", TicTacToe.FrontendMsg]
  | ["ConnectFour", ConnectFour.FrontendMsg]
  | ["Snake", Snake.FrontendMsg]

export type ToFrontend = 
  | ['TicTacToe', TicTacToe.ToFrontend] 
  | ["ConnectFour", ConnectFour.ToFrontend] 
  | ["Snake", Snake.ToFrontend]

export type ToBackend = 
  | ['TicTacToe', TicTacToe.ToBackend]
  | ["ConnectFour", ConnectFour.ToBackend] 
  | ["Snake", Snake.ToBackend]

//
//
//
// Game
//
//
//

export type GameModel =
  | ["TicTacToe", TicTacToe.SharedModel]
  | ["ConnectFour", ConnectFour.SharedModel]
  | ["Snake", Snake.SharedModel]

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
