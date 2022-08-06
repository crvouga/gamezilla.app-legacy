import { Option, RemoteData, Result, Unit } from "../Core"
import { UserId } from "../Data"
import * as Games from "../Games"
import * as RoomId from "./RoomId"

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
  createRoom: RemoteData.Model<CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<JoinRoomProblem, Unit>
  startGame: RemoteData.Model<StartGameProblem, Unit>
  stopGame: RemoteData.Model<StopGameProblem, Unit>
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

// 
// 
// 
// 
// 

export type LeaveRoom = ["LeaveRoom", { userId: UserId.UserId }]

export type LeaveRoomResulted = ["LeaveRoomResulted", LeaveRoomResult]

export type LeaveRoomProblem = "user_is_not_a_room"

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, RoomsModel>

// 
// 
// 
// 
// 

export type CreateRoomResulted = [
  "CreateRoomResulted",
  CreateRoomResult,
]

export type CreateRoom = [
  "CreateRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]

export type CreateRoomProblem = "user_is_already_in_a_room"

export type CreateRoomResult = Result.Result<
  CreateRoomProblem,
  RoomsModel
>

// 
// 
// 
// 
// 

export type JoinRoom = [
  "JoinRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]
export type JoinRoomResulted = ["JoinRoomResulted", JoinRoomResult]

export type JoinRoomProblem =
  | "user_is_already_in_a_room"
  | "room_does_not_exists"

export type JoinRoomResult = Result.Result<JoinRoomProblem, RoomsModel>

// 
// 
// 
// 
// 

export type StartGame = [
  "StartGame",
  { gameName: Games.Name; userId: UserId.UserId },
]
export type StartGameResulted = ["StartGameResulted", StartGameResult]

export type StartGameProblem =
  | "user_is_not_in_a_room"
  | "user_is_not_the_host"
  | "game_already_started"

export type StartGameResult = Result.Result<StartGameProblem, RoomsModel>

// 
// 
// 
// 
// 

export type StopGame = ["StopGame", { userId: UserId.UserId }]

export type StopGameResulted = ["StopGameResulted", StopGameResult]

export type StopGameProblem =
  | "user_is_not_in_a_room"
  | "user_is_not_the_host"
  | "game_already_stopped"

export type StopGameResult = Result.Result<StopGameProblem, RoomsModel>


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

  export const initRooms: RoomsModel = {
    rooms: {},
    users: {},
  }
  

//
//
//
// Game
//
//
//

export type GameModel =
  | ["TicTacToe", Games.TicTacToe.GameModel]
  | ["ConnectFour", Games.ConnectFour.Model]
  | ["Snake", Games.Snake.GameModel]

export type GameMsg = ["TicTacToe", Games.TicTacToe.GameMsg]

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

export const initGame = (gameName: Games.Name): GameModel => {
  switch (gameName) {
    case "ConnectFour":
      return ["ConnectFour", Games.ConnectFour.init]

    case "Snake":
      return ["Snake", Games.Snake.init]

    case "TicTacToe":
      return ["TicTacToe", Games.TicTacToe.init]
  }
}
