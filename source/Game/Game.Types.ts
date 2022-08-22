import * as TicTacToe from "./TicTacToe/TicTacToe.Types"
import * as ConnectFour from "./ConnectFour/ConnectFour.Types"
import * as Snake from "./Snake/Snake.Types"
import * as Chess from "./Chess/Chess.Types"

//
//
//
// Model
//
//
//

export type FrontendModel =
  | ["TicTacToe", TicTacToe.FrontendModel]
  | ["ConnectFour", ConnectFour.FrontendModel]
  | ["Snake", Snake.FrontendModel]
  | ["Chess", Chess.FrontendModel]

export type BackendModel =
  | ["TicTacToe", TicTacToe.BackendModel]
  | ["ConnectFour", ConnectFour.BackendModel]
  | ["Snake", Snake.BackendModel]
  | ["Chess", Chess.BackendModel]

export type GameName = "TicTacToe" | "ConnectFour" | "Snake" | "Chess"

export const mergeFrontend = (
  frontend: FrontendModel,
  backend: BackendModel,
): FrontendModel => {
  switch (frontend[0]) {
    case "Chess":
      return frontend

    case "ConnectFour":
      return frontend

    case "Snake":
      return frontend

    case "TicTacToe":
      return frontend
  }
}

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
  | ["Chess", Chess.BackendMsg]

export type FrontendMsg =
  | ["TicTacToe", TicTacToe.FrontendMsg]
  | ["ConnectFour", ConnectFour.FrontendMsg]
  | ["Snake", Snake.FrontendMsg]
  | ["Chess", Chess.FrontendMsg]

export type ToFrontend =
  | ["TicTacToe", TicTacToe.ToFrontend]
  | ["ConnectFour", ConnectFour.ToFrontend]
  | ["Snake", Snake.ToFrontend]
  | ["Chess", Chess.ToFrontend]

export type ToBackend =
  | ["TicTacToe", TicTacToe.ToBackend]
  | ["ConnectFour", ConnectFour.ToBackend]
  | ["Snake", Snake.ToBackend]
  | ["Chess", Chess.ToBackend]
