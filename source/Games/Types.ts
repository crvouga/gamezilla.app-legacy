import { RemoteData, Unit } from "../Core"
import * as Rooms from "./Rooms"
import * as TicTacToe from "./TicTacToe"

export type BackendModel = {
  rooms: Rooms.Model
}

export type FrontendModel = {
  rooms: Rooms.Model
  createRoom: RemoteData.Model<Rooms.CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<Rooms.LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<Rooms.JoinRoomProblem, Unit>
}

export type ToFrontend =
  | ["CreateRoomResulted", Rooms.CreateRoomResult]
  | ["LeaveRoomResulted", Rooms.LeaveRoomResult]
  | ["JoinRoomResulted", Rooms.JoinRoomResult]
  | ["Sync", Rooms.Model]

export type ToBackend =
  | ["Init"]
  | ["CreateRoom", { roomId: string; userId: string }]
  | ["LeaveRoom", { roomId: string; userId: string }]
  | ["JoinRoom", { roomId: string; userId: string }]

export type BackendMsg = ["Noop"]

export type FrontendMsg = ["Noop"]

export type GameName = "TicTacToe" | "ConnectFour" | "Chess" | "Snake"
