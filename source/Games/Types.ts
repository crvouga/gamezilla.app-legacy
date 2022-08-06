import { RemoteData, Unit } from "../Core"
import { UserId } from "../Data"
import * as RoomId from "./RoomId"
import * as Rooms from "./Rooms"
import * as Game from "./Game"

export type BackendModel = {
  rooms: Rooms.Model
}

export type FrontendModel = {
  rooms: Rooms.Model
  createRoom: RemoteData.Model<Rooms.CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<Rooms.LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<Rooms.JoinRoomProblem, Unit>
  changeGame: RemoteData.Model<Rooms.ChangeGameProblem, Unit>
}

export type ToFrontend =
  | ["Sync", Rooms.Model]
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

export type ChangeGameResulted = ["ChangeGameResulted", Rooms.ChangeGameResult]
export type ChangeGame = [
  "ChangeGame",
  { gameName: Game.GameName; userId: UserId.UserId },
]
