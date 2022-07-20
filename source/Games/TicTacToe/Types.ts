import { ClientId } from "../../Bridge/Bridge";
import { Result } from "../../Core";
import * as Board from "./Board";
import * as Room from "./Room";

//
//
//
// Model
//
//
//

export type BackendModel = Room.Model;

export type FrontendModel = Room.Model & {
  opened: ["Users"] | ["Player", Board.Player] | ["None"];
};

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
  | PlayAs
  | Restart
  | CreateRoom
  | QuitPlaying
  | RemovePlayer
  | PlayAgain;

export type ToBackend =
  | ["Init"]
  | LeaveRoom
  | JoinRoom
  | Restart
  | PlayAs
  | Move
  | CreateRoom
  | QuitPlaying
  | RemovePlayer
  | PlayAgain;

export type ToFrontend =
  | ["Sync", Room.Model]
  | LeaveRoomResulted
  | JoinRoomResulted
  | RestartResulted
  | PlayAsResulted
  | MoveResulted
  | QuitPlayingResulted
  | RemovePlayerResulted
  | PlayAgainResulted
  | CreateRoomResulted;

export type BackendMsg =
  | ["ClientConnected", ClientId]
  | ["ClientDisconnected", ClientId];

//
//
//
//
//
//
//

type LeaveRoom = ["LeaveRoom", { currentUserId: string }];
type LeaveRoomResulted = ["LeaveRoomResulted", Room.LeaveRoomResult];

type JoinRoom = ["JoinRoom", { currentUserId: string; roomId: Room.RoomId }];
type JoinRoomResulted = ["JoinRoomResulted", Room.JoinRoomResult];

type Restart = ["Restart", { currentUserId: string }];
type RestartResulted = [
  "RestartResulted",
  Result.Result<string, { userId: string }>,
];

type PlayAs = ["PlayAs", { player: Board.Player; currentUserId: string }];
type PlayAsResulted = ["PlayAsResulted", Room.PlayAsResult];

type Move = ["Move", { currentUserId: string; position: Board.Position }];
type MoveResulted = ["MoveResulted", Room.MoveResult];

type CreateRoom = ["CreateRoom", { currentUserId: string }];
type CreateRoomResulted = ["CreateRoomResulted", Room.CreateRoomResult];

type PlayAgain = ["PlayAgain", { currentUserId: string }];
type PlayAgainResulted = [
  "PlayAgainResulted",
  Result.Result<string, { userId: string }>,
];

type RemovePlayer = [
  "RemovePlayer",
  { currentUserId: string; player: Board.Player },
];
type RemovePlayerResulted = [
  "RemovePlayerResulted",
  Result.Result<string, { player: Board.Player; hostId: string }>,
];

type QuitPlaying =
  | ["QuitPlaying", { currentUserId: string; player: Board.Player }];
type QuitPlayingResulted = [
  "QuitPlayingResulted",
  Result.Result<string, { userId: string }>,
];
