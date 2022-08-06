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
  startGame: RemoteData.Model<GameRooms.StartGameProblem, Unit>
  stopGame: RemoteData.Model<GameRooms.StopGameProblem, Unit>
  modal: "DrawerOpened" | "Closed" | "MenuOpened"
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
  | StartGameResulted
  | StopGameResulted

export type ToBackend =
  | ["Init"]
  | CreateRoom
  | LeaveRoom
  | JoinRoom
  | StartGame
  | StopGame

export type BackendMsg = ["Noop"]

export type FrontendMsg =
  | ["ClickedBack"]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["OpenedMenu"]
  | ["ClosedMenu"]
  | CreateRoom
  | JoinRoom
  | LeaveRoom
  | StartGame
  | StopGame

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

export type StartGame = [
  "StartGame",
  { gameName: Games.Name; userId: UserId.UserId },
]
export type StartGameResulted = ["StartGameResulted", GameRooms.StartGameResult]

export type StopGame = ["StopGame", { userId: UserId.UserId }]
export type StopGameResulted = ["StopGameResulted", GameRooms.StopGameResult]

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
