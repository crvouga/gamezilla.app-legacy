import * as Chess from "@gamezilla/game/chess"
import * as ConnectFour from "@gamezilla/game/connect-four"
import * as Gomoku from "@gamezilla/game/gomoku"
import * as TicTacToe from "@gamezilla/game/tic-tac-toe"

//
//
//
// Model
//
//
//

export type FrontendModel =
  | ["TicTacToe", TicTacToe.FrontendModel]
  | ["connect-four", ConnectFour.FrontendModel]
  | ["Chess", Chess.FrontendModel]
  | ["Gomoku", Gomoku.FrontendModel]

export type BackendModel =
  | ["TicTacToe", TicTacToe.BackendModel]
  | ["connect-four", ConnectFour.BackendModel]
  | ["Chess", Chess.BackendModel]
  | ["Gomoku", Gomoku.BackendModel]

export type GameName =
  | "TicTacToe"
  | "connect-four"
  | "Chess"
  | "Gomoku"

export const gameNames: { [gameName in GameName]: GameName } = {
  TicTacToe: "TicTacToe",
  "connect-four": "connect-four",
  Chess: "Chess",
  Gomoku: "Gomoku",
}

export const gameNameList: GameName[] = [
  "Chess",
  "connect-four",
  "TicTacToe",
  "Gomoku"
]

//
//
//
// Msg
//
//
//

export type BackendMsg =
  | ["TicTacToe", TicTacToe.BackendMsg]
  | ["connect-four", ConnectFour.BackendMsg]
  | ["Chess", Chess.BackendMsg]
  | ["Gomoku", Gomoku.BackendMsg]

export type FrontendMsg =
  | ["TicTacToe", TicTacToe.FrontendMsg]
  | ["connect-four", ConnectFour.FrontendMsg]
  | ["Chess", Chess.FrontendMsg]
  | ["Gomoku", Gomoku.FrontendMsg]

export type ToFrontend =
  | ["TicTacToe", TicTacToe.ToFrontend]
  | ["connect-four", ConnectFour.ToFrontend]
  | ["Chess", Chess.ToFrontend]
  | ["Gomoku", Gomoku.ToFrontend]

export type ToBackend =
  | ["TicTacToe", TicTacToe.ToBackend]
  | ["connect-four", ConnectFour.ToBackend]
  | ["Chess", Chess.ToBackend]
  | ["Gomoku", Gomoku.ToBackend]
