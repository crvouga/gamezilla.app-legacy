import * as TicTacToe from "./TicTacToe/TicTacToe.Types"
import * as ConnectFour from "./ConnectFour/ConnectFour.Types"
import * as Snake from "./Snake/Snake.Types"

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