import { Option, RemoteData, Unit } from "../Core"
import { UserId } from "../Data"
import * as RoomId from "./RoomId"
import * as Rooms from "./Rooms"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: RoomsModel
}

export type FrontendModel = {
  rooms: RoomsModel
  createRoom: RemoteData.Model<Rooms.CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<Rooms.LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<Rooms.JoinRoomProblem, Unit>
  changeGame: RemoteData.Model<Rooms.ChangeGameProblem, Unit>
}

//
//
//
// Msg
//
//
//

export type ToFrontend =
  | ["Sync", RoomsModel]
  | CreateRoomResulted
  | LeaveRoomResulted
  | JoinRoomResulted
  | ChangeGameResulted

export type ToBackend =
  | ["Init"]
  | CreateRoom
  | LeaveRoom
  | JoinRoom
  | ChangeGame

export type BackendMsg = ["Noop"]

export type FrontendMsg = ["Noop"]

export type LeaveRoom = ["LeaveRoom", { userId: UserId.UserId }]
export type LeaveRoomResulted = ["LeaveRoomResulted", Rooms.LeaveRoomResult]

export type CreateRoomResulted = ["CreateRoomResulted", Rooms.CreateRoomResult]
export type CreateRoom = [
  "CreateRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]

export type JoinRoom = [
  "JoinRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]
export type JoinRoomResulted = ["JoinRoomResulted", Rooms.JoinRoomResult]

export type ChangeGameResulted = ["ChangeGameResulted", Rooms.ChangeGameResult]
export type ChangeGame = [
  "ChangeGame",
  { gameName: GameName; userId: UserId.UserId },
]

//
//
//
// Rooms
//
//
//

export type RoomsModel = {
  rooms: {
    [roomId: RoomId.RoomId]: Room
  }
  users: {
    [userId: UserId.UserId]: User
  }
}

export type User = {
  userId: UserId.UserId
  roomId: RoomId.RoomId
}

export type Room = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  events: RoomEvent[]
  game: Option.Option<GameModel>
}

export type RoomEvent =
  | ["Created", { userId: UserId.UserId; roomId: RoomId.RoomId }]
  | ["Joined", { userId: UserId.UserId }]
  | ["Left", { userId: UserId.UserId }]

export const initRooms: RoomsModel = {
  rooms: {},
  users: {},
}

//
//
//
//
// Game
//
//
//

export type GameModel =
  | ["TicTacToe", TicTacToe.Game.Model]
  | ["ConnectFour", ConnectFour.Game.Model]
  | ["Snake", Snake.Game.Model]

export type GameName = GameModel[0]

export const initGame = (gameName: GameName): GameModel => {
  switch (gameName) {
    case "ConnectFour":
      return ["ConnectFour", ConnectFour.Game.init]

    case "Snake":
      return ["Snake", Snake.Game.init]

    case "TicTacToe":
      return ["TicTacToe", TicTacToe.Game.init]
  }
}
