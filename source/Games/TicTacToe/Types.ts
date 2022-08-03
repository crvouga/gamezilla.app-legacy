import { ClientId } from "../../Bridge/Bridge"
import { Result } from "../../Core"
import * as Board from "./Board"
import * as Room from "./Room"

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: {
    [id: Room.RoomId]: Room.Room
  }
  users: {
    [id: string]: {
      userId: string
      roomId: Room.RoomId
    }
  }
}

export type FrontendModel = {
  rooms: {
    [id: Room.RoomId]: Room.Room
  }
  users: {
    [id: string]: {
      userId: string
      roomId: Room.RoomId
    }
  }
  opened: ["None"] | ["Users"] | ["Player", Board.Player]
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["ClickedBack"]
  | ["ClickedUser", { userId: string }]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedPlayer", Board.Player]
  | LeaveRoom
  | JoinRoom
  | Move
  | StartPlaying
  | RestartGame
  | CreateRoom
  | StopPlaying
  | RemovePlayer
  | PlayAgain

export type ToBackend =
  | ["Init"]
  | LeaveRoom
  | JoinRoom
  | RestartGame
  | StartPlaying
  | Move
  | CreateRoom
  | StopPlaying
  | RemovePlayer
  | PlayAgain

export type ToFrontend =
  | ["Sync", Room.Model]
  | LeaveRoomResulted
  | JoinRoomResulted
  | RestartGameResulted
  | StartPlayingResulted
  | MoveResulted
  | StopPlayingResulted
  | RemovePlayerResulted
  | PlayAgainResulted
  | CreateRoomResulted

export type BackendMsg =
  | ["ClientConnected", ClientId]
  | ["ClientDisconnected", ClientId]

//
//
//
//
//
//
//

type LeaveRoom = ["LeaveRoom", { currentUserId: string }]
type LeaveRoomResulted = ["LeaveRoomResulted", Room.LeaveRoomResult]

type JoinRoom = ["JoinRoom", { currentUserId: string; roomId: Room.RoomId }]
type JoinRoomResulted = ["JoinRoomResulted", Room.JoinRoomResult]

type RestartGame = ["RestartGame", { currentUserId: string }]
type RestartGameResulted = ["RestartGameResulted", Room.RestartGameResult]

type StartPlaying = [
  "StartPlaying",
  { player: Board.Player; currentUserId: string },
]
type StartPlayingResulted = ["StartPlayingResulted", Room.StartPlayingResult]

type Move = ["Move", { currentUserId: string; position: Board.Position }]
type MoveResulted = ["MoveResulted", Room.MoveResult]

type CreateRoom = ["CreateRoom", { currentUserId: string }]
type CreateRoomResulted = ["CreateRoomResulted", Room.CreateRoomResult]

type PlayAgain = ["PlayAgain", { currentUserId: string }]
type PlayAgainResulted = [
  "PlayAgainResulted",
  Result.Result<string, { userId: string }>,
]

type RemovePlayer = [
  "RemovePlayer",
  { currentUserId: string; player: Board.Player },
]
type RemovePlayerResulted = ["RemovePlayerResulted", Room.RemovePlayerResult]

type StopPlaying =
  | ["StopPlaying", { currentUserId: string; player: Board.Player }]
type StopPlayingResulted = ["StopPlayingResulted", Room.StopPlayingResult]
