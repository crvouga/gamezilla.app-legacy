import { ClientId } from "../../Bridge/Bridge"
import { Result } from "../../Core"
import { UserId } from "../../Data"
import * as Board from "./Board"
import * as Room from "./Room"

//
//
//
// Model
//
//
//

export type GameModel = {
  board: Board.Board
  players: {
    [player in Board.Player]:
      | { type: "None" }
      | { type: "User"; userId: UserId.UserId }
  }
}

export type BackendModel = {
  game: GameModel
}

export type User = { userId: UserId.UserId; roomId: Room.RoomId }

export type FrontendModel = {
  game: GameModel
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
  | ["ClickedUser", { userId: UserId.UserId }]
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

type LeaveRoom = ["LeaveRoom", { currentUserId: UserId.UserId }]
type LeaveRoomResulted = ["LeaveRoomResulted", Room.LeaveRoomResult]

type JoinRoom = [
  "JoinRoom",
  { currentUserId: UserId.UserId; roomId: Room.RoomId },
]
type JoinRoomResulted = ["JoinRoomResulted", Room.JoinRoomResult]

type RestartGame = ["RestartGame", { currentUserId: UserId.UserId }]
type RestartGameResulted = ["RestartGameResulted", Room.RestartGameResult]

type StartPlaying = [
  "StartPlaying",
  { player: Board.Player; currentUserId: UserId.UserId },
]
type StartPlayingResulted = ["StartPlayingResulted", Room.StartPlayingResult]

type Move = ["Move", { currentUserId: UserId.UserId; position: Board.Position }]
type MoveResulted = ["MoveResulted", Room.MoveResult]

type CreateRoom = ["CreateRoom", { currentUserId: UserId.UserId }]
type CreateRoomResulted = ["CreateRoomResulted", Room.CreateRoomResult]

type PlayAgain = ["PlayAgain", { currentUserId: UserId.UserId }]
type PlayAgainResulted = [
  "PlayAgainResulted",
  Result.Result<string, { userId: UserId.UserId }>,
]

type RemovePlayer = [
  "RemovePlayer",
  { currentUserId: UserId.UserId; player: Board.Player },
]
type RemovePlayerResulted = ["RemovePlayerResulted", Room.RemovePlayerResult]

type StopPlaying =
  | ["StopPlaying", { currentUserId: UserId.UserId; player: Board.Player }]
type StopPlayingResulted = ["StopPlayingResulted", Room.StopPlayingResult]
