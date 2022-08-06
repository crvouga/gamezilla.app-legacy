import { Option, RemoteData, Unit } from "../Core"
import { UserId } from "../Data"
import * as Games from "../Games"
import * as RoomId from "./RoomId"
import * as GameRooms from "./Rooms"

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
  createRoom: RemoteData.Model<GameRooms.CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<GameRooms.LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<GameRooms.JoinRoomProblem, Unit>
  changeGame: RemoteData.Model<GameRooms.ChangeGameProblem, Unit>
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
export type LeaveRoomResulted = ["LeaveRoomResulted", GameRooms.LeaveRoomResult]

export type CreateRoomResulted = [
  "CreateRoomResulted",
  GameRooms.CreateRoomResult,
]
export type CreateRoom = [
  "CreateRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]

export type JoinRoom = [
  "JoinRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]
export type JoinRoomResulted = ["JoinRoomResulted", GameRooms.JoinRoomResult]

export type ChangeGameResulted = [
  "ChangeGameResulted",
  GameRooms.ChangeGameResult,
]
export type ChangeGame = [
  "ChangeGame",
  { gameName: Games.Name; userId: UserId.UserId },
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
    [roomId: RoomId.RoomId]: RoomModel
  }
  users: {
    [userId: UserId.UserId]: User
  }
}

export type User = {
  userId: UserId.UserId
  roomId: RoomId.RoomId
}

export type RoomModel = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  events: RoomEvent[]
  game: Option.Option<GameModel>
}

export type RoomEvent =
  | ["Created", { userId: UserId.UserId; roomId: RoomId.RoomId }]
  | ["Joined", { userId: UserId.UserId }]
  | ["Left", { userId: UserId.UserId }]

//
//
//
// Game
//
//
//

export type GameModel =
  | ["TicTacToe", Games.TicTacToe.Model]
  | ["ConnectFour", Games.ConnectFour.Model]
  | ["Snake", Games.Snake.Model]

export type GameName = "ConnectFour" | "TicTacToe" | "Snake"

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
