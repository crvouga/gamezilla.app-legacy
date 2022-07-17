import { ClientId } from "Bridge/Bridge";
import { Option, RemoteData, Result } from "Core";
import * as Board from "./Board";

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: Rooms;
  users: Users;
};

export type FrontendModel = {
  // mutations
  createRoom: RemoteData.Model<string, {}>;
  leaveRoom: RemoteData.Model<string, {}>;
  joinRoom: RemoteData.Model<string, {}>;
  move: RemoteData.Model<string, {}>;
  quitPlaying: RemoteData.Model<string, {}>;
  removePlayer: RemoteData.Model<string, {}>;
  playAgain: RemoteData.Model<string, {}>;
  // queries
  init: RemoteData.Model<string, {}>;
  // ui
  opened: ["Users"] | ["Player", Board.Player] | ["None"];
  //
  rooms: Rooms;
  users: Users;
};

export type Rooms = {
  [roomId: RoomId]: Room;
};

export type Users = {
  [userId: string]: {
    userId: string;
    roomId: RoomId;
  };
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
  | [
      "Sync",
      {
        rooms: Rooms;
        users: Users;
      },
    ]
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
type LeaveRoomResulted = ["LeaveRoomResulted", Result.Result<string, {}>];

type JoinRoom = ["JoinRoom", { currentUserId: string; roomId: RoomId }];
type JoinRoomResulted = ["JoinRoomResulted", Result.Result<string, {}>];

type Restart = ["Restart", { currentUserId: string }];
type RestartResulted = ["RestartResulted", Result.Result<string, {}>];

type PlayAs = ["PlayAs", { player: Board.Player; currentUserId: string }];
type PlayAsResulted = ["PlayAsResulted", Result.Result<string, {}>];

type Move = ["Move", { currentUserId: string; position: Board.Position }];
type MoveResulted = [
  "MoveResulted",
  {
    userId: string;
    position: Board.Position;
    result: Result.Result<string, {}>;
  },
];

type CreateRoom = ["CreateRoom", { currentUserId: string }];
type CreateRoomResulted = ["CreateRoomResulted", Result.Result<string, {}>];

type PlayAgain = ["PlayAgain", { currentUserId: string }];
type PlayAgainResulted = ["PlayAgainResulted", Result.Result<string, {}>];

type RemovePlayer = [
  "RemovePlayer",
  { currentUserId: string; player: Board.Player },
];
type RemovePlayerResulted = ["RemovePlayerResulted", Result.Result<string, {}>];

type QuitPlaying =
  | ["QuitPlaying", { currentUserId: string; player: Board.Player }];
type QuitPlayingResulted = ["QuitPlayingResulted", Result.Result<string, {}>];

//
//
//
// Room
//
//
//

export type RoomId = string;

export type Room = {
  roomId: RoomId;
  board: Board.Board;
  players: {
    [player in Board.Player]: RoomPlayer;
  };
  hostId: string;
  eventLog: RoomEvent[];
};

export type RoomEvent =
  | LeaveRoomResulted
  | JoinRoomResulted
  | RestartResulted
  | PlayAsResulted
  | MoveResulted
  | QuitPlayingResulted
  | RemovePlayerResulted
  | PlayAgainResulted
  | CreateRoomResulted;

export const mapRoomPlayers = (
  mapper: (roomPlayer: RoomPlayer) => RoomPlayer,
  room: Room,
): Room => {
  return {
    ...room,
    players: {
      X: mapper(room.players.X),
      O: mapper(room.players.O),
    },
  };
};

export const initRoom = (roomId: RoomId, hostId: string): Room => {
  return {
    roomId,
    board: Board.emptyBoard,
    players: {
      X: { type: "User", userId: hostId },
      O: { type: "None" },
    },
    hostId,
    eventLog: [],
  };
};

export type RoomPlayer = { type: "User"; userId: string } | { type: "None" };

export const toPlayer = (
  userId: string,
  room: Room,
): Board.Player | "None" | "Both" => {
  const { X, O } = room.players;

  const isX = X.type === "User" && X.userId === userId;

  const isO = O.type === "User" && O.userId === userId;

  if (isX && isO) {
    return "Both";
  }

  if (isO) {
    return "O";
  }

  if (isX) {
    return "X";
  }

  return "None";
};

export const toCurrentRoom = (
  userId: string,
  { rooms, users }: { rooms: Rooms; users: Users },
): Option.Option<Room> => {
  const subset = Object.values(users)
    .filter((user) => user.userId === userId)
    .map((user) => rooms[user.roomId])
    .flatMap((maybeRoom) => (maybeRoom ? [maybeRoom] : []));

  return Option.fromNullable(subset[0]);
};

export type RoomStatus =
  | { type: "NotReady"; status: "MissingBoth" | "MissingX" | "MissingO" }
  | { type: "Ready"; status: Board.Status };

export const toRoomStatus = (room: Room): RoomStatus => {
  if (room.players.X.type === "None" && room.players.O.type === "None") {
    return { type: "NotReady", status: "MissingBoth" };
  }

  if (room.players.X.type === "None") {
    return { type: "NotReady", status: "MissingX" };
  }

  if (room.players.O.type === "None") {
    return { type: "NotReady", status: "MissingO" };
  }

  return { type: "Ready", status: Board.toStatus(room.board) };
};
