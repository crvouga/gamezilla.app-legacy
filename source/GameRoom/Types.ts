import { Option, RemoteData, Result, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game"

//
//
//
// Model
//
//
//

export type BackendModel = RoomsModel<Game.BackendModel>

export type FrontendModel = {
  rooms: RoomsModel<Game.FrontendModel>
  createRoom: RemoteData.Model<CreateRoomProblem, Unit>
  leaveRoom: RemoteData.Model<LeaveRoomProblem, Unit>
  joinRoom: RemoteData.Model<JoinRoomProblem, Unit>
  startGame: RemoteData.Model<StartGameProblem, Unit>
  stopGame: RemoteData.Model<StopGameProblem, Unit>
  modal: "DrawerOpened" | "Closed" | "MenuOpened"
}

export type RoomsModel<GameModel> ={
  rooms: {
    [roomId: RoomId.RoomId]: RoomModel<GameModel>
  },
  users: Users
}

export type RoomModel<GameModel> = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  events: RoomEvent[]
  game: Option.Option<GameModel>
}

export type Users = {
  [userId: UserId.UserId]: {
    userId: UserId.UserId
    roomId: RoomId.RoomId
  }
}


//
//
//
// Msg
//
//
//

export type ToFrontend =
  | ["Sync", BackendModel]
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

export type BackendMsg = ["Game",  {roomId: RoomId.RoomId, msg: Game.BackendMsg}]

export type FrontendMsg =
  | ["ClickedBack"]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["OpenedMenu"]
  | ["ClosedMenu"]
  | ["ClickedBanner"]
  | CreateRoom
  | JoinRoom
  | LeaveRoom
  | StartGame
  | StopGame
  | ["Game", Game.FrontendMsg]

//
//
//
//
//

export type LeaveRoom = ["LeaveRoom", { userId: UserId.UserId }]

export type LeaveRoomResulted = ["LeaveRoomResulted", LeaveRoomResult]

export type LeaveRoomProblem = "user_is_not_a_room"

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, BackendModel>

//
//
//
//
//

export type CreateRoomResulted = ["CreateRoomResulted", CreateRoomResult]

export type CreateRoom = [
  "CreateRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]

export type CreateRoomProblem = "user_is_already_in_a_room"

export type CreateRoomResult = Result.Result<CreateRoomProblem, BackendModel>

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

export type JoinRoomResult = Result.Result<JoinRoomProblem, BackendModel>

//
//
//
//
//

export type StartGame = [
  "StartGame",
  { gameName: Game.GameName; userId: UserId.UserId },
]
export type StartGameResulted = ["StartGameResulted", StartGameResult]

export type StartGameProblem =
  | "user_is_not_in_a_room"
  | "user_is_not_the_host"
  | "game_already_started"

export type StartGameResult = Result.Result<StartGameProblem, BackendModel>

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

export type StopGameResult = Result.Result<StopGameProblem, BackendModel>

//
//
//
// Rooms
//
//
//

export type RoomEvent =
  | ["Created", { userId: UserId.UserId; roomId: RoomId.RoomId }]
  | ["Joined", { userId: UserId.UserId }]
  | ["Left", { userId: UserId.UserId }]

