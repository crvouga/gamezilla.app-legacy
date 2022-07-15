import { ClientId } from "Bridge/Bridge";
import { Option, RemoteData, Result, pipe } from "Core";
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
  createRoom: RemoteData.RemoteData<string, {}>;
  leaveRoom: RemoteData.RemoteData<string, {}>;
  joinRoom: RemoteData.RemoteData<string, {}>;
  move: RemoteData.RemoteData<string, {}>;
  // queries
  init: RemoteData.RemoteData<string, {}>;
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
  | ["ClickedCreateRoom"]
  | ["ClickedLeaveRoom"]
  | ["ClickedJoinRoom", { roomId: RoomId }]
  | ["ClickedBack"]
  | ["ClickedBoard", Board.Position];

export type ToBackend =
  | ["Init"]
  | ["CreateRoom", { userId: string }]
  | ["LeaveRoom", { userId: string }]
  | ["JoinRoom", { userId: string; roomId: RoomId }]
  | ["Move", { userId: string; position: Board.Position }];

export type BackendMsg =
  | ["ClientConnected", ClientId]
  | ["ClientDisconnected", ClientId];

export type ToFrontend =
  | [
      "Sync",
      {
        rooms: Rooms;
        users: Users;
      },
    ]
  | ["CreateRoomResulted", Result.Result<string, {}>]
  | ["LeaveRoomResulted", Result.Result<string, {}>]
  | ["JoinRoomResulted", Result.Result<string, {}>]
  | ["MoveResulted", Result.Result<string, {}>];

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
    X: RoomPlayer;
    O: RoomPlayer;
  };
  scores: {
    X: number;
    O: number;
  };
  hostId: string;
};

export const initRoom = (roomId: RoomId, hostId: string): Room => {
  return {
    roomId,
    board: Board.emptyBoard,
    players: {
      X: { type: "User", userId: hostId },
      O: { type: "User", userId: hostId },
    },
    scores: {
      X: 0,
      O: 0,
    },
    hostId,
  };
};

export type RoomPlayer = { type: "User"; userId: string } | { type: "None" };

export const toPlayer = (userId: string, room: Room): Board.Player | "None" => {
  const { X, O } = room.players;

  if (X.type === "User" && X.userId === userId) {
    return "X";
  }

  if (O.type === "User" && O.userId === userId) {
    return "O";
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

export type RoomStatus = ["MissingPlayers", Board.Player] | ["Ready"];
