import { RemoteData, Result, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "../Game/Game.Types"

//
//
//
// Model
//
//
//

export type SharedModel = {
  rooms: {
    [roomId: RoomId.RoomId]: RoomModel
  }
  users: {
    [userId: UserId.UserId]: {
      userId: UserId.UserId
      roomId: RoomId.RoomId
    }
  }
}

export type RoomModel = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  events: RoomEvent[]
}

export type BackendModel = SharedModel & {
  games: {
    [roomId: RoomId.RoomId]: Game.BackendModel
  }
}

export type FrontendModel = SharedModel & {
  games: {
    [roomId: RoomId.RoomId]: Game.FrontendModel
  }
  modal: "DrawerOpened" | "Closed" | "MenuOpened"
  requests: {
    createRoom: RemoteData.RemoteData<CreateRoomProblem, Unit>
    leaveRoom: RemoteData.RemoteData<LeaveRoomProblem, Unit>
    joinRoom: RemoteData.RemoteData<JoinRoomProblem, Unit>
    startGame: RemoteData.RemoteData<StartGameProblem, Unit>
    stopGame: RemoteData.RemoteData<StopGameProblem, Unit>
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
  | ["ClickedBack"]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["OpenedMenu"]
  | ["ClosedMenu"]
  | ["ClickedBanner"]
  | ["Games", RoomId.RoomId, Game.FrontendMsg]
  | Request

export type Request = CreateRoom | LeaveRoom | JoinRoom | StartGame | StopGame

export type Response =
  | CreateRoomResulted
  | LeaveRoomResulted
  | JoinRoomResulted
  | StartGameResulted
  | StopGameResulted

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
