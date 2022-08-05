import { RemoteData, Unit } from "../Core"
import { UserId } from "../Data"
import * as Rooms from "./Rooms"
import * as RoomId from "./RoomId"

export type BackendModel = {
  rooms: Rooms.Model
}

export type FrontendModel = {
  rooms: Rooms.Model
  createRoom: RemoteData.Model<Rooms.CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<Rooms.LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<Rooms.JoinRoomProblem, Unit>
  startGame: RemoteData.Model<Rooms.StartGameProblem, Unit>
}

export type ToFrontend =
  | ["Sync", Rooms.Model]
  | CreateRoomResulted
  | LeaveRoomResulted
  | JoinRoomResulted
  | StartGameResulted

export type ToBackend = ["Init"] | CreateRoom | LeaveRoom | JoinRoom | StartGame

export type BackendMsg = ["Noop"]

export type FrontendMsg = ["Noop"]

export type GameName = "TicTacToe" | "ConnectFour" | "Chess" | "Snake"

//
//
//
// Events
//
//
//

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

export type StartGameResulted = ["StartGameResulted", Rooms.StartGameResult]
export type StartGame = [
  "StartGame",
  { gameName: GameName; userId: UserId.UserId },
]
