import { Option, RemoteData, Result, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Types"

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: {
    [roomId: RoomId.RoomId]: {
      roomId: RoomId.RoomId
      hostId: UserId.UserId
      events: RoomEvent[]
      game: Option.Option<Game.BackendModel>
    }
  }
  users: {
    [userId: UserId.UserId]: {
      userId: UserId.UserId
      roomId: RoomId.RoomId
    }
  }
}

export type FrontendModel = {
  rooms: {
    [roomId: RoomId.RoomId]: {
      roomId: RoomId.RoomId
      hostId: UserId.UserId
      events: RoomEvent[]
      game: Option.Option<Game.FrontendModel>
    }
  }
  users: {
    [userId: UserId.UserId]: {
      userId: UserId.UserId
      roomId: RoomId.RoomId
    }
  }
  modal: "DrawerOpened" | "Closed" | "MenuOpened"
  requests: {
    CreateRoom: RemoteData.RemoteData<CreateRoomProblem, Unit>
    LeaveRoom: RemoteData.RemoteData<LeaveRoomProblem, Unit>
    JoinRoom: RemoteData.RemoteData<JoinRoomProblem, Unit>
    OpenGame: RemoteData.RemoteData<OpenGameProblem, Unit>
    CloseGame: RemoteData.RemoteData<CloseGameProblem, Unit>
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
  | ["Games", RoomId.RoomId, Game.ToFrontend]
  | Response

export type ToBackend = Request | ["Games", RoomId.RoomId, Game.ToBackend]

export type BackendMsg = ["Games", RoomId.RoomId, Game.BackendMsg]

export type FrontendMsg =
  | ["ClickedGoHome"]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["ClickedBanner"]
  | ["Games", RoomId.RoomId, Game.FrontendMsg]
  | Request

export type Request = CreateRoom | LeaveRoom | JoinRoom | OpenGame | CloseGame

export type Response =
  | CreateRoom_Done
  | LeaveRoom_Done
  | JoinRoom_Done
  | OpenGame_Done
  | CloseGame_Done

//
//
//
//
//

export type LeaveRoom = ["LeaveRoom", { userId: UserId.UserId }]

export type LeaveRoom_Done = ["LeaveRoom_Done", LeaveRoomResult]

export type LeaveRoomProblem = "user_is_not_a_room"

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, BackendModel>

//
//
//
//
//

export type CreateRoom_Done = ["CreateRoom_Done", CreateRoomResult]

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
export type JoinRoom_Done = ["JoinRoom_Done", JoinRoomResult]

export type JoinRoomProblem =
  | "user_is_already_in_a_room"
  | "room_does_not_exists"

export type JoinRoomResult = Result.Result<JoinRoomProblem, BackendModel>

//
//
//
//
//

export type OpenGame = [
  "OpenGame",
  { gameName: Game.GameName; userId: UserId.UserId },
]
export type OpenGame_Done = ["OpenGame_Done", OpenGameResult]

export type OpenGameProblem = "user_is_not_in_a_room" | "game_already_started"

export type OpenGameResult = Result.Result<OpenGameProblem, BackendModel>

//
//
//
//
//

export type CloseGame = ["CloseGame", { userId: UserId.UserId }]

export type CloseGame_Done = ["CloseGame_Done", CloseGameResult]

export type CloseGameProblem = "user_is_not_in_a_room" | "game_already_stopped"

export type CloseGameResult = Result.Result<CloseGameProblem, BackendModel>

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
