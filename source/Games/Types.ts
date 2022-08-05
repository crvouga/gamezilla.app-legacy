import * as Chess from "./Chess"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"
import * as Room from "./Room"
import { RemoteData, Unit } from "../Core"

export type BackendModel = Room.Model & {
  ticTacToe: TicTacToe.BackendModel
}

export type FrontendModel = Room.Model & {
  createRoom: RemoteData.Model<Room.CreateRoomProblem, { roomId: string }>
}

export type Closed = { type: "Closed" }

export type Opened = {
  type: "Opened"
  status: "Idle" | "ConfirmingClose"
  game:
    | ["TicTacToe", TicTacToe.FrontendModel]
    | ["ConnectFour", ConnectFour.Model]
    | ["Chess", Chess.Model]
    | ["Snake", Snake.Model]
}

export type ToFrontend =
  | ["TicTacToe", TicTacToe.ToFrontend]
  | ["CreateRoomResulted", Room.CreateRoomResult]
  | ["Sync", BackendModel]

export type ToBackend =
  | ["TicTacToe", TicTacToe.ToBackend]
  | ["Init"]
  | ["CreateRoom", { roomId: string; userId: string }]

export type BackendMsg = ["TicTacToe", TicTacToe.BackendMsg]

export type FrontendMsg = ["Noop"]

export type GameName = "TicTacToe" | "ConnectFour" | "Chess" | "Snake"
