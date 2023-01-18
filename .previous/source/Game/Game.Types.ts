import * as Chess from "./Chess/Chess.Types"
import * as ConnectFour from "./connect-four/connect-four.types"
import * as Maze from "./Maze/Maze.Types"
import * as Snake from "./Snake/Snake.Types"
import * as Tetris from "./Tetris/Tetris.Types"
import * as TicTacToe from "./TicTacToe/TicTacToe.Types"
import * as Gomoku from "./Gomoku/Gomoku.Types"

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
  | ["Snake", Snake.FrontendModel]
  | ["Chess", Chess.FrontendModel]
  | ["Tetris", Tetris.FrontendModel]
  | ["Maze", Maze.FrontendModel]
  | ["Gomoku", Gomoku.FrontendModel]

export type BackendModel =
  | ["TicTacToe", TicTacToe.BackendModel]
  | ["connect-four", ConnectFour.BackendModel]
  | ["Snake", Snake.BackendModel]
  | ["Chess", Chess.BackendModel]
  | ["Tetris", Tetris.BackendModel]
  | ["Maze", Maze.BackendModel]
  | ["Gomoku", Gomoku.BackendModel]

export type GameName =
  | "TicTacToe"
  | "connect-four"
  | "Snake"
  | "Chess"
  | "Tetris"
  | "Maze"
  | "Gomoku"

export const gameNames: { [gameName in GameName]: GameName } = {
  TicTacToe: "TicTacToe",
  "connect-four": "connect-four",
  Snake: "Snake",
  Chess: "Chess",
  Tetris: "Tetris",
  Maze: "Maze",
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
  | ["Snake", Snake.BackendMsg]
  | ["Chess", Chess.BackendMsg]
  | ["Tetris", Tetris.BackendMsg]
  | ["Maze", Maze.BackendMsg]
  | ["Gomoku", Gomoku.BackendMsg]

export type FrontendMsg =
  | ["TicTacToe", TicTacToe.FrontendMsg]
  | ["connect-four", ConnectFour.FrontendMsg]
  | ["Snake", Snake.FrontendMsg]
  | ["Chess", Chess.FrontendMsg]
  | ["Tetris", Tetris.FrontendMsg]
  | ["Maze", Maze.FrontendMsg]
  | ["Gomoku", Gomoku.FrontendMsg]

export type ToFrontend =
  | ["TicTacToe", TicTacToe.ToFrontend]
  | ["connect-four", ConnectFour.ToFrontend]
  | ["Snake", Snake.ToFrontend]
  | ["Chess", Chess.ToFrontend]
  | ["Tetris", Tetris.ToFrontend]
  | ["Maze", Maze.ToFrontend]
  | ["Gomoku", Gomoku.ToFrontend]

export type ToBackend =
  | ["TicTacToe", TicTacToe.ToBackend]
  | ["connect-four", ConnectFour.ToBackend]
  | ["Snake", Snake.ToBackend]
  | ["Chess", Chess.ToBackend]
  | ["Tetris", Tetris.ToBackend]
  | ["Maze", Maze.ToBackend]
  | ["Gomoku", Gomoku.ToBackend]
