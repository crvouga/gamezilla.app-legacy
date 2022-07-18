import { ClientId } from "Bridge/Bridge";
import { Option, RemoteData, Result, Uuid, pipe } from "Core";
import * as Board from "./Board";

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: { [id: RoomId]: Room };
  users: { [id: string]: User };
};

export type FrontendModel = {
  opened: ["Users"] | ["Player", Board.Player] | ["None"];
  rooms: { [id: RoomId]: Room };
  users: { [id: string]: User };
};

type User = { roomId: RoomId; userId: string };

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
        rooms: { [id: RoomId]: Room };
        users: { [id: string]: User };
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
type LeaveRoomResulted = [
  "LeaveRoomResulted",
  Result.Result<string, { userId: string }>,
];

type JoinRoom = ["JoinRoom", { currentUserId: string; roomId: RoomId }];
type JoinRoomResulted = [
  "JoinRoomResulted",
  Result.Result<string, { userId: string }>,
];

type Restart = ["Restart", { currentUserId: string }];
type RestartResulted = [
  "RestartResulted",
  Result.Result<string, { userId: string }>,
];

type PlayAs = ["PlayAs", { player: Board.Player; currentUserId: string }];
type PlayAsResulted = [
  "PlayAsResulted",
  Result.Result<string, { userId: string; player: Board.Player }>,
];

type Move = ["Move", { currentUserId: string; position: Board.Position }];
type MoveResulted = [
  "MoveResulted",
  Result.Result<string, { userId: string; position: Board.Position }>,
];

type CreateRoom = ["CreateRoom", { currentUserId: string }];
type CreateRoomResulted = [
  "CreateRoomResulted",
  Result.Result<string, { userId: string }>,
];

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

export const roomReducer = (room: Room, event: RoomEvent): Room => {
  switch (event[0]) {
    case "CreateRoomResulted":
      switch (event[1].type) {
        case "Err":
          return room;

        case "Ok":
          const { userId } = event[1].value;
          return {
            hostId: userId,
            board: Board.emptyBoard,
            eventLog: [event],
            players: {
              X: {
                type: "User",
                userId: userId,
              },
              O: {
                type: "None",
              },
            },
            roomId: Uuid.generateSync(),
          };
      }

    case "JoinRoomResulted":
      switch (event[1].type) {
        case "Err":
          return room;

        case "Ok":
          return room;
      }

    case "LeaveRoomResulted":
      return room;

    case "MoveResulted":
      return room;

    case "PlayAgainResulted":
      return room;

    case "PlayAsResulted":
      return room;

    case "QuitPlayingResulted":
      return room;

    case "RemovePlayerResulted":
      return room;

    case "RestartResulted":
      return room;
  }
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

export const toRoom = (
  userId: string,
  {
    rooms,
    users,
  }: {
    rooms: { [id: RoomId]: Room };
    users: { [id: string]: User };
  },
): Option.Option<Room> => {
  const user = users[userId];

  if (!user) {
    return Option.None;
  }

  const room = rooms[user.roomId];

  if (!room) {
    return Option.None;
  }

  return Option.Some(room);
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
